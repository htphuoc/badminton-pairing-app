import { useState, useEffect } from 'react';
import type { Session, SessionPlayer, Player, Match, AttendanceStatus, CourtMeta } from '../models/types';
import { StorageService } from '../storage/storage';
import { v4 as uuidv4 } from 'uuid';
import { generateMatchSuggestion } from '../algorithms/matchingEngine';
import { roundUpTo30 } from '../utils/costCalc';

export function useSession() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  useEffect(() => {
    const loaded = StorageService.getSessions();
    setSessions(loaded);
    const active = loaded.find(s => s.status === 'RUNNING' || s.status === 'PLANNED');
    if (active) setCurrentSession(active);
  }, []);

  const save = (updatedSession: Session) => {
    setCurrentSession(updatedSession);
    const updatedSessions = sessions.map(s => (s.id === updatedSession.id ? updatedSession : s));
    if (!sessions.find(s => s.id === updatedSession.id)) {
      updatedSessions.push(updatedSession);
    }
    setSessions(updatedSessions);
    StorageService.saveSessions(updatedSessions);
  };

  const createSession = (courtNumbers: number[], durationMinutes: number, selectedPlayerIds: string[]) => {
    const players = StorageService.getPlayers();
    const settings = StorageService.getSettings();
    const now = new Date().toISOString();
    const sorted = [...courtNumbers].sort((a, b) => a - b);

    const sessionPlayers: SessionPlayer[] = players
      .filter(p => selectedPlayerIds.includes(p.id))
      .map(p => ({
        playerId: p.id,
        playerName: p.name,
        gender: p.gender,
        skillLevel: p.skillLevel,
        memberType: p.memberType,
        attendance: 'WAITING' as AttendanceStatus,
        matchesPlayed: 0,
        totalMinutesPlayed: 0,
        waitingSince: now,
      }));

    const courtMeta: Record<string, CourtMeta> = Object.fromEntries(
      sorted.map(court => [
        String(court),
        {
          isSupplemental: false,
          plannedMinutes: durationMinutes,
          startedAt: now,
        },
      ]),
    );

    const newSession: Session = {
      id: uuidv4(),
      date: now.split('T')[0],
      startTime: now,
      numberOfCourts: sorted.length,
      courtNumbers: sorted,
      initialCourtNumbers: sorted,
      courtMeta,
      courtFees: Object.fromEntries(
        sorted.map(court => [String(court), settings.courtFeeFixedPerHour ?? settings.courtFeePerHour]),
      ),
      shuttleCount: 0,
      plannedDurationMinutes: durationMinutes,
      durationMinutes,
      players: sessionPlayers,
      matches: [],
      costs: settings,
      status: 'RUNNING',
      createdAt: now,
      updatedAt: now,
    };
    save(newSession);
  };

  const endSession = () => {
    if (!currentSession) return;
    save({
      ...currentSession,
      status: 'FINISHED',
      endTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setCurrentSession(null);
  };

  /** Bổ sung sân: tự lấy đơn giá vãng lai; thời gian bổ sung (mặc định 60p). */
  const addCourt = (courtNumber: number, supplementalMinutes: number) => {
    if (!currentSession || currentSession.courtNumbers.includes(courtNumber)) return;
    const settings = currentSession.costs;
    const rate = settings.courtFeeCasualPerHour ?? settings.courtFeeFixedPerHour ?? settings.courtFeePerHour;
    const now = new Date().toISOString();
    const mins = Math.max(15, supplementalMinutes);
    save({
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
      },
      updatedAt: now,
    });
  };

  /** TRẢ SÂN — chỉ cho sân bổ sung; làm tròn lên bội 30 phút. */
  const returnCourt = (courtNumber: number) => {
    if (!currentSession) return;
    const key = String(courtNumber);
    const meta = currentSession.courtMeta?.[key];
    const initial = currentSession.initialCourtNumbers ?? [];
    const isSupplemental = meta?.isSupplemental === true || !initial.includes(courtNumber);
    if (!isSupplemental || meta?.returnedAt) return;

    const startedAt = meta?.startedAt || currentSession.startTime || new Date().toISOString();
    const actualMinutes = Math.max(
      1,
      Math.round((Date.now() - new Date(startedAt).getTime()) / 60000),
    );
    const billableMinutes = Math.min(
      roundUpTo30(actualMinutes),
      meta?.plannedMinutes ?? roundUpTo30(actualMinutes),
    );
    const now = new Date().toISOString();

    save({
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
      },
      updatedAt: now,
    });
  };

  const autoMatch = (requestedCourt?: string) => {
    if (!currentSession) return;
    const players = StorageService.getPlayers();

    const waitingSessionPlayers = currentSession.players.filter(p => p.attendance === 'WAITING');
    const enrichedWaitingPlayers = waitingSessionPlayers.map(sp => ({
      ...sp,
      ...(players.find(p => p.id === sp.playerId) as Player),
    }));

    const activeCourts = currentSession.matches.filter(m => m.status === 'PLAYING').map(m => m.courtId);

    const configuredCourts =
      currentSession.courtNumbers ||
      Array.from({ length: currentSession.numberOfCourts }, (_, index) => index + 1);
    let availableCourt = requestedCourt || String(configuredCourts[0]);
    for (const courtNumber of requestedCourt ? [] : configuredCourts) {
      if (!activeCourts.includes(String(courtNumber))) {
        availableCourt = String(courtNumber);
        break;
      }
    }

    if (activeCourts.length >= currentSession.numberOfCourts) {
      alert('Đã hết sân trống!');
      return;
    }

    const suggestion = generateMatchSuggestion({
      waitingPlayers: enrichedWaitingPlayers,
      activeMatches: currentSession.matches,
      sessionHistory: [],
      availableCourts: currentSession.numberOfCourts,
    });

    if (suggestion) {
      const newMatch: Match = {
        id: uuidv4(),
        sessionId: currentSession.id,
        courtId: availableCourt,
        type: suggestion.type,
        team1: suggestion.team1,
        team2: suggestion.team2,
        status: 'PLAYING',
        assignmentMode: 'AUTO',
        startTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newPlayers = currentSession.players.map(p => {
        if (suggestion.players.includes(p.playerId)) {
          return { ...p, attendance: 'PLAYING' as const };
        }
        return p;
      });

      save({
        ...currentSession,
        matches: [...currentSession.matches, newMatch],
        players: newPlayers,
        updatedAt: new Date().toISOString(),
      });
    } else {
      alert('Không đủ người chờ để xếp trận.');
    }
  };

  const startManualMatch = (
    courtId: string,
    playerIds: string[],
    assignmentMode: 'MANUAL' | 'AUTO' = 'MANUAL',
  ) => {
    if (!currentSession || playerIds.length !== 4) return;
    const selected = StorageService.getPlayers().filter(player => playerIds.includes(player.id));
    const females = selected.filter(player => player.gender === 'FEMALE').length;
    if (![0, 2, 4].includes(females)) {
      alert('Đôi Nam Nữ cần đúng 2 Nam và 2 Nữ. Hãy chọn lại cầu thủ.');
      return;
    }
    const type = females === 0 ? 'ĐÔI NAM' : females === 4 ? 'ĐÔI NỮ' : 'ĐÔI NAM NỮ';
    const match: Match = {
      id: uuidv4(),
      sessionId: currentSession.id,
      courtId,
      type,
      team1: [playerIds[0], playerIds[1]],
      team2: [playerIds[2], playerIds[3]],
      status: 'PLAYING',
      assignmentMode,
      startTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    save({
      ...currentSession,
      matches: [...currentSession.matches, match],
      players: currentSession.players.map(player =>
        playerIds.includes(player.playerId) ? { ...player, attendance: 'PLAYING' as const } : player,
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const endMatch = (matchId: string) => {
    if (!currentSession) return;

    const match = currentSession.matches.find(m => m.id === matchId);
    if (!match) return;

    const endTime = new Date();
    const startTime = new Date(match.startTime || new Date());
    const diffMins = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    const matchPlayers = [...match.team1, ...match.team2];

    const updatedMatches = currentSession.matches.map(m =>
      m.id === matchId
        ? { ...m, status: 'COMPLETED' as const, endTime: endTime.toISOString(), durationMinutes: diffMins }
        : m,
    );

    const updatedPlayers = currentSession.players.map(p => {
      if (matchPlayers.includes(p.playerId)) {
        return {
          ...p,
          attendance: 'WAITING' as const,
          matchesPlayed: p.matchesPlayed + 1,
          totalMinutesPlayed: p.totalMinutesPlayed + diffMins,
          waitingSince: new Date().toISOString(),
        };
      }
      return p;
    });

    save({
      ...currentSession,
      matches: updatedMatches,
      players: updatedPlayers,
      updatedAt: new Date().toISOString(),
    });
  };

  return {
    currentSession,
    createSession,
    endSession,
    addCourt,
    returnCourt,
    autoMatch,
    startManualMatch,
    endMatch,
  };
}
