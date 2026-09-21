import type { SessionPlayer, Player, MatchType } from '../models/types';

export interface MatchingSettings {
  maxSkillDifference: number;
  repeatPartnerPenalty: number;
  repeatOpponentPenalty: number;
  /** Weight for waiting time (0–1), default 0.60 — highest priority */
  waitingWeight: number;
  /** Weight for match count fairness (0–1), default 0.25 */
  matchCountWeight: number;
  /** Weight for played minutes fairness (0–1), default 0.15 */
  minutesWeight: number;
}

export const defaultSettings: MatchingSettings = {
  maxSkillDifference: 2,
  repeatPartnerPenalty: 50,
  repeatOpponentPenalty: 30,
  waitingWeight: 0.60,   // ưu tiên cao nhất — người chờ lâu được vào trước
  matchCountWeight: 0.25,
  minutesWeight: 0.15,
};

const skillValue = (skill: string): number => {
  switch (skill) {
    case 'Y':   return 1;
    case 'TBY': return 2;
    case 'TB':  return 3;
    case 'K':   return 4;
    default:    return 1;
  }
};

type EnrichedPlayer = SessionPlayer & Player;

/**
 * Tính priorityScore cho từng người theo spec:
 *   score = w1 × normalizedWaiting + w2 × (1 - normalizedMatches) + w3 × (1 - normalizedMinutes)
 *
 * Người có score cao nhất → được xếp vào trận trước.
 */
function computePriorityScores(
  players: EnrichedPlayer[],
  settings: MatchingSettings
): Map<string, number> {
  if (players.length === 0) return new Map();

  // Lấy max để chuẩn hoá — tránh chia 0
  const maxWaiting = Math.max(...players.map(p => waitingSeconds(p)), 1);
  const maxMatches  = Math.max(...players.map(p => p.matchesPlayed), 1);
  const maxMinutes  = Math.max(...players.map(p => p.totalMinutesPlayed), 1);

  const scores = new Map<string, number>();
  for (const p of players) {
    const nWaiting = waitingSeconds(p) / maxWaiting;
    const nMatches  = p.matchesPlayed  / maxMatches;
    const nMinutes  = p.totalMinutesPlayed / maxMinutes;

    const score =
      settings.waitingWeight    * nWaiting +
      settings.matchCountWeight  * (1 - nMatches) +
      settings.minutesWeight     * (1 - nMinutes);

    scores.set(p.id, score);
  }
  return scores;
}

function waitingSeconds(p: EnrichedPlayer): number {
  if (!p.waitingSince) return 0;
  return Math.max(0, (Date.now() - new Date(p.waitingSince).getTime()) / 1000);
}

/**
 * Tìm cách chia 4 người thành 2 đội sao cho chênh lệch skill nhỏ nhất.
 * Có 3 cách chia (C(4,2)/2 = 3):
 *   [0,1] vs [2,3]
 *   [0,2] vs [1,3]
 *   [0,3] vs [1,2]
 */
function bestTeamSplit(four: EnrichedPlayer[]): { team1: string[]; team2: string[]; skillDiff: number } {
  const splits: [number[], number[]][] = [
    [[0, 1], [2, 3]],
    [[0, 2], [1, 3]],
    [[0, 3], [1, 2]],
  ];

  let best = { team1: [] as string[], team2: [] as string[], skillDiff: 999 };
  for (const [a, b] of splits) {
    const skillA = a.reduce((s, i) => s + skillValue(four[i].skillLevel), 0);
    const skillB = b.reduce((s, i) => s + skillValue(four[i].skillLevel), 0);
    const diff = Math.abs(skillA - skillB);
    if (diff < best.skillDiff) {
      best = {
        team1: a.map(i => four[i].id),
        team2: b.map(i => four[i].id),
        skillDiff: diff,
      };
    }
  }
  return best;
}

/**
 * Xác định MatchType từ danh sách 4 người (quy tắc giới tính thông thường).
 * Luật:
 *   - 4 nam  → ĐÔI NAM
 *   - 4 nữ  → ĐÔI NỮ
 *   - 2 nam + 2 nữ → ĐÔI NAM NỮ
 *   - Khác → null (dùng TỰ DO ở lớp gọi)
 */
function detectMatchType(four: EnrichedPlayer[]): MatchType | null {
  const males   = four.filter(p => p.gender === 'MALE').length;
  const females = four.filter(p => p.gender === 'FEMALE').length;
  if (males === 4) return 'ĐÔI NAM';
  if (females === 4) return 'ĐÔI NỮ';
  if (males === 2 && females === 2) return 'ĐÔI NAM NỮ';
  return null;
}

/**
 * Chia đội cho ĐÔI NAM NỮ: mỗi đội phải có đúng 1 nam + 1 nữ.
 * Trả về cách chia tốt nhất theo skill diff trong ràng buộc giới tính.
 */
function mixedTeamSplit(four: EnrichedPlayer[]): { team1: string[]; team2: string[]; skillDiff: number } | null {
  const males   = four.filter(p => p.gender === 'MALE');
  const females = four.filter(p => p.gender === 'FEMALE');
  if (males.length !== 2 || females.length !== 2) return null;

  // 2 cách ghép: (M0+F0 vs M1+F1) hoặc (M0+F1 vs M1+F0)
  const options = [
    { t1: [males[0], females[0]], t2: [males[1], females[1]] },
    { t1: [males[0], females[1]], t2: [males[1], females[0]] },
  ];

  let best = { team1: [] as string[], team2: [] as string[], skillDiff: 999 };
  for (const opt of options) {
    const skillA = opt.t1.reduce((s, p) => s + skillValue(p.skillLevel), 0);
    const skillB = opt.t2.reduce((s, p) => s + skillValue(p.skillLevel), 0);
    const diff = Math.abs(skillA - skillB);
    if (diff < best.skillDiff) {
      best = {
        team1: opt.t1.map(p => p.id),
        team2: opt.t2.map(p => p.id),
        skillDiff: diff,
      };
    }
  }
  return best;
}

export interface MatchSuggestion {
  players: string[];
  team1: string[];
  team2: string[];
  type: MatchType;
  score: number;
  skillDifference: number;
  reasons: string[];
}

function playerSetKey(ids: string[]): string {
  return [...ids].sort().join('|');
}

function isExcludedSet(ids: string[], excludePlayerSets?: string[][]): boolean {
  if (!excludePlayerSets?.length) return false;
  const key = playerSetKey(ids);
  return excludePlayerSets.some(ex => playerSetKey(ex) === key);
}

/** Sinh các tổ hợp 4 người ứng viên (ưu tiên điểm chờ cao). */
function buildCandidateFours(sorted: EnrichedPlayer[]): { four: EnrichedPlayer[]; type: MatchType; note: string }[] {
  const malesAll = sorted.filter(p => p.gender === 'MALE');
  const femalesAll = sorted.filter(p => p.gender === 'FEMALE');
  const seen = new Set<string>();
  const out: { four: EnrichedPlayer[]; type: MatchType; note: string }[] = [];

  const push = (four: EnrichedPlayer[], type: MatchType, note: string) => {
    if (four.length !== 4) return;
    const key = playerSetKey(four.map(p => p.id));
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ four, type, note });
  };

  const top4 = sorted.slice(0, 4);
  const top4Type = detectMatchType(top4);
  if (top4Type) {
    push(top4, top4Type, '4 người ưu tiên cao nhất đã thoả điều kiện giới tính');
  }

  // ĐÔI NAM NỮ — tối đa top 6 mỗi giới để giữ thứ tự ưu tiên
  const males = malesAll.slice(0, 6);
  const females = femalesAll.slice(0, 6);
  for (let mi = 0; mi < males.length; mi++) {
    for (let mj = mi + 1; mj < males.length; mj++) {
      for (let fi = 0; fi < females.length; fi++) {
        for (let fj = fi + 1; fj < females.length; fj++) {
          push(
            [males[mi], males[mj], females[fi], females[fj]],
            'ĐÔI NAM NỮ',
            'Chọn 2 nam + 2 nữ → ĐÔI NAM NỮ',
          );
        }
      }
    }
  }

  // ĐÔI NAM / ĐÔI NỮ — cửa sổ trượt 4 người
  for (let i = 0; i <= malesAll.length - 4; i++) {
    push(malesAll.slice(i, i + 4), 'ĐÔI NAM', '4 nam → ĐÔI NAM');
  }
  for (let i = 0; i <= femalesAll.length - 4; i++) {
    push(femalesAll.slice(i, i + 4), 'ĐÔI NỮ', '4 nữ → ĐÔI NỮ');
  }

  // TỰ DO — cửa sổ trượt trên toàn bộ danh sách chờ
  for (let i = 0; i <= sorted.length - 4; i++) {
    const four = sorted.slice(i, i + 4);
    const typed = detectMatchType(four);
    push(four, typed ?? 'TỰ DO', typed ? `Tổ hợp → ${typed}` : 'Không đủ theo quy tắc giới tính → TỰ DO');
  }

  return out;
}

function splitTeams(
  four: EnrichedPlayer[],
  matchType: MatchType,
): { team1: string[]; team2: string[]; skillDiff: number } | null {
  if (matchType === 'ĐÔI NAM NỮ') return mixedTeamSplit(four);
  return bestTeamSplit(four);
}

/** Đảo đội / đổi cách chia để "Xếp lại" khi chỉ còn đúng 1 tổ hợp 4 người. */
export function reshuffleSuggestion(suggestion: MatchSuggestion): MatchSuggestion {
  return {
    ...suggestion,
    team1: [...suggestion.team2],
    team2: [...suggestion.team1],
    reasons: [...suggestion.reasons, 'Đã đổi bên sân (Xếp lại)'],
  };
}

export const generateMatchSuggestion = (params: {
  waitingPlayers: EnrichedPlayer[];
  activeMatches: any[];
  sessionHistory: any[];
  availableCourts: number;
  preferredMatchType?: MatchType;
  /** Các bộ 4 người đã preview / bị loại khi bấm "Xếp lại". */
  excludePlayerSets?: string[][];
  settings?: MatchingSettings;
}): MatchSuggestion | null => {
  const { waitingPlayers, excludePlayerSets, settings: cfg } = params;
  const settings = { ...defaultSettings, ...cfg };
  const reasons: string[] = [];

  if (waitingPlayers.length < 4) {
    return null;
  }

  // ── BƯỚC 1: Tính priorityScore cho tất cả người đang WAITING ──
  const priorityScores = computePriorityScores(waitingPlayers, settings);

  // Sắp theo priorityScore giảm dần
  const sorted = [...waitingPlayers].sort((a, b) => {
    const sa = priorityScores.get(a.id) ?? 0;
    const sb = priorityScores.get(b.id) ?? 0;
    return sb - sa;
  });

  reasons.push('Ưu tiên người chờ lâu nhất (waitingWeight=0.60)');

  // ── BƯỚC 2: Duyệt ứng viên, bỏ qua các bộ đã loại (Xếp lại) ──
  const candidates = buildCandidateFours(sorted);
  const pick = candidates.find(c => !isExcludedSet(c.four.map(p => p.id), excludePlayerSets));
  if (!pick) return null;

  const { four: selectedFour, type: matchType, note } = pick;
  reasons.push(note);

  // ── BƯỚC 3: Chia đội tối ưu theo skillBalance ──
  const split = splitTeams(selectedFour, matchType);
  if (!split) return null;

  if (matchType === 'ĐÔI NAM NỮ') {
    reasons.push('Mỗi đội 1 nam + 1 nữ, chia skill cân bằng nhất');
  } else {
    reasons.push(`Chia đội: skill diff = ${split.skillDiff}`);
  }

  const score = Math.max(0, 100 - split.skillDiff * 15);

  return {
    players: selectedFour.map(p => p.id),
    team1: split.team1,
    team2: split.team2,
    type: matchType,
    score,
    skillDifference: split.skillDiff,
    reasons,
  };
};
