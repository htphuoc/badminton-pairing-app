import { describe, it, expect } from 'vitest';
import { generateMatchSuggestion } from './matchingEngine';

describe('Matching Engine', () => {
  it('should return null if less than 4 players', () => {
    const suggestion = generateMatchSuggestion({
      waitingPlayers: [],
      activeMatches: [],
      sessionHistory: [],
      availableCourts: 1,
    });
    expect(suggestion).toBeNull();
  });

  it('should split 4 male players into ĐÔI NAM', () => {
    const players: any = [
      { id: '1', name: 'A', gender: 'MALE', skillLevel: 'K', matchesPlayed: 0, totalMinutesPlayed: 0 },
      { id: '2', name: 'B', gender: 'MALE', skillLevel: 'K', matchesPlayed: 0, totalMinutesPlayed: 0 },
      { id: '3', name: 'C', gender: 'MALE', skillLevel: 'TB', matchesPlayed: 0, totalMinutesPlayed: 0 },
      { id: '4', name: 'D', gender: 'MALE', skillLevel: 'TB', matchesPlayed: 0, totalMinutesPlayed: 0 },
    ];

    const suggestion = generateMatchSuggestion({
      waitingPlayers: players,
      activeMatches: [],
      sessionHistory: [],
      availableCourts: 1,
    });

    expect(suggestion).not.toBeNull();
    expect(suggestion?.type).toBe('ĐÔI NAM');
    expect(suggestion?.team1.length).toBe(2);
    expect(suggestion?.team2.length).toBe(2);
    expect(suggestion?.skillDifference).toBeLessThan(2);
  });

  it('should fall back to TỰ DO when gender rules cannot be satisfied', () => {
    const players: any = [
      { id: '1', name: 'A', gender: 'MALE', skillLevel: 'K', matchesPlayed: 0, totalMinutesPlayed: 0 },
      { id: '2', name: 'B', gender: 'MALE', skillLevel: 'K', matchesPlayed: 0, totalMinutesPlayed: 0 },
      { id: '3', name: 'C', gender: 'MALE', skillLevel: 'TB', matchesPlayed: 0, totalMinutesPlayed: 0 },
      { id: '4', name: 'D', gender: 'FEMALE', skillLevel: 'TB', matchesPlayed: 0, totalMinutesPlayed: 0 },
    ];

    const suggestion = generateMatchSuggestion({
      waitingPlayers: players,
      activeMatches: [],
      sessionHistory: [],
      availableCourts: 1,
    });

    expect(suggestion).not.toBeNull();
    expect(suggestion?.type).toBe('TỰ DO');
    expect(suggestion?.team1.length).toBe(2);
    expect(suggestion?.team2.length).toBe(2);
  });
});
