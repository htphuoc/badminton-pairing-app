export type MatchType = 'ĐÔI NAM' | 'ĐÔI NỮ' | 'ĐÔI NAM NỮ' | 'TỰ DO';

export interface Player {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  skillLevel: 'Y' | 'TBY' | 'TB' | 'K';
  memberType: 'CỐ ĐỊNH' | 'VÃNG LAI';
}

export interface SessionPlayer {
  id: string;
  sessionId: string;
  memberId: string;
  playerName: string;
  gender: 'MALE' | 'FEMALE';
  skillLevel: 'Y' | 'TBY' | 'TB' | 'K';
  memberType: 'CỐ ĐỊNH' | 'VÃNG LAI';
  attendance: 'ABSENT' | 'WAITING' | 'PLAYING';
  matchesPlayed: number;
  totalMinutesPlayed: number;
  waitingSince: string | null;
  hasPaid: boolean;
}
