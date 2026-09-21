import { useState, useEffect } from 'react';
import type { Player } from '../models/types';
import { StorageService } from '../storage/storage';
import { v4 as uuidv4 } from 'uuid';

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    setPlayers(StorageService.getPlayers());
  }, []);

  const save = (newPlayers: Player[]) => {
    setPlayers(newPlayers);
    StorageService.savePlayers(newPlayers);
  };

  const addPlayer = (player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPlayer: Player = {
      ...player,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    save([...players, newPlayer]);
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    const updated = players.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    save(updated);
  };

  const removePlayer = (id: string) => {
    save(players.filter(p => p.id !== id));
  };

  return {
    players,
    addPlayer,
    updatePlayer,
    removePlayer
  };
}
