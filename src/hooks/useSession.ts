import { useState, useEffect, useCallback } from 'react';
import type { Session } from '../models/types';
import type { MatchSuggestion } from '../algorithms/matchingEngine';
import { ApiClient } from '../lib/api';

export function useSession() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentSession = useCallback(async () => {
    try {
      const active = await ApiClient.get<Session | null>('/sessions/active');
      setCurrentSession(active);
    } catch (err) {
      console.error('Failed to fetch active session', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentSession();
  }, [fetchCurrentSession]);

  const updateSession = async (updatedSession: Session) => {
    try {
      await ApiClient.put(`/sessions/${updatedSession.id}`, {
        shuttleCount: updatedSession.shuttleCount,
        costs: updatedSession.costs,
        courtMeta: updatedSession.courtMeta,
        courtNumbers: updatedSession.courtNumbers,
        courtFees: updatedSession.courtFees,
        numberOfCourts: updatedSession.numberOfCourts,
      });
      await fetchCurrentSession();
    } catch (err) {
      console.error('Failed to update session', err);
    }
  };

  const createSession = async (
    courtNumbers: number[],
    durationMinutes: number,
    selectedPlayerIds: string[],
    sessionType: 'CỐ ĐỊNH' | 'VÃNG LAI' = 'CỐ ĐỊNH'
  ) => {
    try {
      const now = new Date();
      const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      await ApiClient.post('/sessions', {
        sessionDate: localDateStr,
        plannedDurationMinutes: durationMinutes,
        courtNumbers,
        durationMinutes,
        selectedPlayerIds,
        sessionType
      });
      await fetchCurrentSession();
    } catch (err) {
      console.error('Failed to create session', err); throw err;
    }
  };

  const endSession = async () => {
    if (!currentSession) return;
    try {
      await ApiClient.post(`/sessions/${currentSession.id}/end`);
      setCurrentSession(null);
    } catch (err) {
      console.error('Failed to end session', err);
    }
  };

  const addPlayersToSession = async (playerIds: string[]) => {
    if (!currentSession || !playerIds.length) return;
    try {
      await Promise.all(
        playerIds.map(id =>
          ApiClient.post(`/sessions/${currentSession.id}/players`, { memberId: id })
        )
      );
      await fetchCurrentSession();
    } catch (err) {
      console.error('Failed to add players', err);
    }
  };

  const removePlayerFromSession = async (memberId: string) => {
    if (!currentSession) return;
    try {
      await ApiClient.delete(`/sessions/${currentSession.id}/players/${memberId}`);
      await fetchCurrentSession();
    } catch (err) {
      console.error('Failed to remove player', err);
    }
  };

  const addCourt = async (courtNumber: number, supplementalMinutes: number) => {
    if (!currentSession || currentSession.courtNumbers.includes(courtNumber)) return;
    const settings = currentSession.costs;
    const rate = settings.courtFeeCasualPerHour ?? settings.courtFeeFixedPerHour ?? settings.courtFeePerHour;
    const now = new Date().toISOString();
    const mins = Math.max(15, supplementalMinutes);

    const updated = {
      ...currentSession,
      courtNumbers: [...currentSession.courtNumbers, courtNumber].sort((a, b) => a - b),
      numberOfCourts: currentSession.numberOfCourts + 1,
      courtFees: { ...currentSession.courtFees, [String(courtNumber)]: rate },
      courtMeta: {
        ...currentSession.courtMeta,
        [String(courtNumber)]: {
          isSupplemental: true,
          plannedMinutes: mins,
          startedAt: now,
        },
      }
    };
    await updateSession(updated);
  };

  const returnCourt = async (courtNumber: number) => {
    if (!currentSession) return;
    const key = String(courtNumber);
    const meta = currentSession.courtMeta?.[key];
    const initial = currentSession.initialCourtNumbers ?? [];
    const isSupplemental = meta?.isSupplemental === true || !initial.includes(courtNumber);
    if (!isSupplemental || meta?.returnedAt) return;

    const startedAt = meta?.startedAt || currentSession.startTime || new Date().toISOString();
    const actualMinutes = Math.max(1, Math.round((Date.now() - new Date(startedAt).getTime()) / 60000));
    const billableMinutes = Math.min(
      Math.ceil(actualMinutes / 30) * 30,
      meta?.plannedMinutes ?? Math.ceil(actualMinutes / 30) * 30,
    );
    const now = new Date().toISOString();

    const updated = {
      ...currentSession,
      courtMeta: {
        ...currentSession.courtMeta,
        [key]: {
          isSupplemental: true,
          plannedMinutes: meta?.plannedMinutes ?? billableMinutes,
          startedAt,
          returnedAt: now,
          billableMinutes,
        },
      }
    };
    await updateSession(updated);
  };

  const previewAutoMatch = async (
    requestedCourt?: string,
    excludePlayerSets?: string[][]
  ): Promise<{ courtId: string; suggestion: MatchSuggestion } | null> => {
    if (!currentSession) return null;
    try {
      const activeCourts = currentSession.matches.filter(m => m.status === 'PLAYING').map(m => m.courtId);
      const configuredCourts = currentSession.courtNumbers || Array.from({ length: currentSession.numberOfCourts }, (_, i) => i + 1);
      
      let availableCourt = requestedCourt || String(configuredCourts[0]);
      for (const courtNumber of requestedCourt ? [] : configuredCourts) {
        if (!activeCourts.includes(String(courtNumber))) {
          availableCourt = String(courtNumber);
          break;
        }
      }

      if (activeCourts.length >= currentSession.numberOfCourts) {
        alert('Đã hết sân trống!');
        return null;
      }
      if (requestedCourt && activeCourts.includes(String(requestedCourt))) {
        alert('Sân này đang có trận!');
        return null;
      }

      const suggestion = await ApiClient.post<MatchSuggestion>(`/sessions/${currentSession.id}/suggest-match`, {
        excludePlayerSets
      });
      return { courtId: availableCourt, suggestion };
    } catch (err: any) {
      if (!excludePlayerSets?.length) alert(err.message || 'Không đủ người chờ để xếp trận.');
      return null;
    }
  };

  const confirmAutoMatch = async (courtId: string, suggestion: MatchSuggestion) => {
    if (!currentSession) return;
    try {
      await ApiClient.post(`/sessions/${currentSession.id}/matches`, {
        courtId,
        team1: suggestion.team1,
        team2: suggestion.team2,
        type: suggestion.type,
        assignmentMode: 'AUTO'
      });
      await fetchCurrentSession();
    } catch (err) {
      console.error('Failed to confirm match', err);
    }
  };

  const startManualMatch = async (courtId: string, playerIds: string[], assignmentMode: 'MANUAL' | 'AUTO' = 'MANUAL') => {
    if (!currentSession || playerIds.length !== 4) return;
    try {
      await ApiClient.post(`/sessions/${currentSession.id}/matches`, {
        courtId,
        team1: [playerIds[0], playerIds[1]],
        team2: [playerIds[2], playerIds[3]],
        type: 'TỰ DO',
        assignmentMode
      });
      await fetchCurrentSession();
    } catch (err) {
      console.error('Failed to start manual match', err);
    }
  };

  const endMatch = async (matchId: string) => {
    if (!currentSession) return;
    try {
      await ApiClient.post(`/sessions/${currentSession.id}/matches/${matchId}/end`);
      await fetchCurrentSession();
    } catch (err) {
      console.error('Failed to end match', err);
    }
  };

  return {
    currentSession,
    loading,
    createSession,
    endSession,
    addCourt,
    addPlayersToSession,
    removePlayerFromSession,
    returnCourt,
    previewAutoMatch,
    confirmAutoMatch,
    startManualMatch,
    endMatch,
    updateSession,
    refreshSession: fetchCurrentSession
  };
}
