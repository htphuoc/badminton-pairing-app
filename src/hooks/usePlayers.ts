import { useState, useEffect, useCallback } from 'react';
import type { Player } from '../models/types';
import { ApiClient } from '../lib/api';

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = useCallback(async () => {
    try {
      const data = await ApiClient.get<Player[]>('/members');
      setPlayers(data);
    } catch (err) {
      console.error('Failed to fetch players', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const addPlayer = async (player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPlayer = await ApiClient.post<Player>('/members', player);
      setPlayers(prev => [...prev, newPlayer]);
    } catch (err) {
      console.error('Failed to add player', err);
      throw err;
    }
  };

  const updatePlayer = async (id: string, updates: Partial<Player>) => {
    try {
      await ApiClient.put(`/members/${id}`, updates);
      setPlayers(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ));
    } catch (err) {
      console.error('Failed to update player', err);
      throw err;
    }
  };

  const removePlayer = async (id: string) => {
    try {
      await ApiClient.delete(`/members/${id}`);
      setPlayers(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to remove player', err);
      throw err;
    }
  };

  return {
    players,
    loading,
    addPlayer,
    updatePlayer,
    removePlayer,
    refreshPlayers: fetchPlayers
  };
}
