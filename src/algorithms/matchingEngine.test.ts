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

  it('should split 4 players into 2 teams', () => {
    const players: any = [
      { id: '1', name: 'A', skillLevel: 'K', matchesPlayed: 0 },
      { id: '2', name: 'B', skillLevel: 'K', matchesPlayed: 0 },
      { id: '3', name: 'C', skillLevel: 'TB', matchesPlayed: 0 },
      { id: '4', name: 'D', skillLevel: 'TB', matchesPlayed: 0 },
    ];
    
    const suggestion = generateMatchSuggestion({
      waitingPlayers: players,
      activeMatches: [],
      sessionHistory: [],
      availableCourts: 1,
    });
    
    expect(suggestion).not.toBeNull();
    expect(suggestion?.team1.length).toBe(2);
    expect(suggestion?.team2.length).toBe(2);
    expect(suggestion?.skillDifference).toBeLessThan(2);
  });
});
