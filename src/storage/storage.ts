import type { Player, Session, CostSettings, Gender, SkillLevel, DefaultCourtsByWeekday, MemberType } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

const PLAYERS_KEY = 'badminton_players', SESSIONS_KEY = 'badminton_sessions', SETTINGS_KEY = 'badminton_settings', SEED_VERSION_KEY = 'badminton_seed_version';
const imported: [string, MemberType, Gender, SkillLevel][] = [
  ['Vân', 'CỐ ĐỊNH', 'FEMALE', 'TB'],
  ['Hà Đỗ', 'CỐ ĐỊNH', 'FEMALE', 'Y'],
  ['chị Ba', 'CỐ ĐỊNH', 'FEMALE', 'Y'],
  ['Dung', 'CỐ ĐỊNH', 'FEMALE', 'TB'],
  ['bé Mi', 'CỐ ĐỊNH', 'FEMALE', 'Y'],
  ['Tài', 'CỐ ĐỊNH', 'MALE', 'TB'],
  ['a Phước', 'CỐ ĐỊNH', 'MALE', 'TB'],
  ['a Bi', 'CỐ ĐỊNH', 'MALE', 'TBY'],
  ['Kiệt', 'CỐ ĐỊNH', 'MALE', 'TB'],
  ['bé Hà', 'VÃNG LAI', 'FEMALE', 'TB'],
  ['bé Phương', 'VÃNG LAI', 'FEMALE', 'TBY'],
  ['Nhi', 'VÃNG LAI', 'FEMALE', 'TB'],
  ['Doan', 'VÃNG LAI', 'FEMALE', 'Y'],
  ['c Kiều', 'VÃNG LAI', 'FEMALE', 'Y'],
  ['Tường', 'VÃNG LAI', 'MALE', 'K'],
  ['a Hoàng', 'VÃNG LAI', 'MALE', 'TB'],
  ['Phương NT', 'VÃNG LAI', 'MALE', 'TB'],
  ['Hào', 'VÃNG LAI', 'MALE', 'TBY'],
  ['Huân', 'VÃNG LAI', 'MALE', 'TB'],
  ['a Bảo', 'VÃNG LAI', 'MALE', 'TB'],
  ['Lộc', 'VÃNG LAI', 'MALE', 'TBY'],
  ['Cường', 'VÃNG LAI', 'MALE', 'TB'],
  ['Đạt', 'VÃNG LAI', 'MALE', 'TB'],
  ['Hiếu', 'VÃNG LAI', 'MALE', 'TB'],
  ['Phúc', 'VÃNG LAI', 'MALE', 'TB'],
  ['Duy', 'VÃNG LAI', 'MALE', 'TBY'],
  ['Phước nhỏ', 'VÃNG LAI', 'MALE', 'TB'],
  ['Trí Vững', 'VÃNG LAI', 'MALE', 'TB'],
  ['Bảo Duy', 'VÃNG LAI', 'MALE', 'TB'],
  ['Tân', 'VÃNG LAI', 'MALE', 'TB'],
  ['a Tâm', 'VÃNG LAI', 'MALE', 'TB'],
  ['Thuyên', 'VÃNG LAI', 'MALE', 'K'],
  ['Đỗ Hưng', 'VÃNG LAI', 'MALE', 'TBY'],
  ['Quốc', 'VÃNG LAI', 'MALE', 'TBY'],
];
const createSeed = (): Player[] => imported.map(([name, memberType, gender, skillLevel]) => ({ id: uuidv4(), name, gender, skillLevel, memberType, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));

const defaultSettings: CostSettings = {
  courtFeePerHour: 130000,
  courtFeeFixedPerHour: 130000,
  courtFeeCasualPerHour: 180000,
  shuttleFee: 28000,
  splitMethod: 'EQUAL',
  femaleDiscountPercent: 10,
  defaultCourtsByWeekday: {},
};

function normalizeCourtsByWeekday(raw: unknown): DefaultCourtsByWeekday {
  if (!raw || typeof raw !== 'object') return {};
  const result: DefaultCourtsByWeekday = {};
  for (const key of ['0', '1', '2', '3', '4', '5', '6'] as const) {
    const value = (raw as Record<string, unknown>)[key];
    if (!Array.isArray(value)) continue;
    const courts = value
      .map(n => Number(n))
      .filter(n => Number.isInteger(n) && n >= 1 && n <= 16);
    if (courts.length) result[key] = [...new Set(courts)].sort((a, b) => a - b);
  }
  return result;
}

function normalizeSettings(raw: Partial<CostSettings> | Record<string, unknown>): CostSettings {
  const r = raw as Partial<CostSettings>;
  const fixed =
    typeof r.courtFeeFixedPerHour === 'number'
      ? r.courtFeeFixedPerHour
      : typeof r.courtFeePerHour === 'number'
        ? r.courtFeePerHour
        : defaultSettings.courtFeeFixedPerHour;
  const casual =
    typeof r.courtFeeCasualPerHour === 'number'
      ? r.courtFeeCasualPerHour
      : defaultSettings.courtFeeCasualPerHour;
  return {
    ...defaultSettings,
    ...r,
    courtFeePerHour: fixed,
    courtFeeFixedPerHour: fixed,
    courtFeeCasualPerHour: casual,
    shuttleFee: typeof r.shuttleFee === 'number' ? r.shuttleFee : defaultSettings.shuttleFee,
    splitMethod: r.splitMethod === 'BY_MATCHES' ? 'BY_MATCHES' : 'EQUAL',
    femaleDiscountPercent:
      typeof r.femaleDiscountPercent === 'number'
        ? r.femaleDiscountPercent
        : defaultSettings.femaleDiscountPercent,
    defaultCourtsByWeekday: normalizeCourtsByWeekday(r.defaultCourtsByWeekday),
  };
}

/** Courts configured for a weekday (`Date.getDay()`), or fallback defaults. */
export function getDefaultCourtsForWeekday(
  weekday: number,
  settings?: CostSettings,
  fallback: number[] = [1, 2, 3],
): number[] {
  const cfg = settings ?? StorageService.getSettings();
  const key = String(weekday) as keyof DefaultCourtsByWeekday;
  const courts = cfg.defaultCourtsByWeekday?.[key];
  return courts?.length ? [...courts] : [...fallback];
}

export const StorageService = {
  getPlayers: (): Player[] => {
    // Versioned reset is intentional: replace the old demo list with the roster supplied in the design reference.
    if (localStorage.getItem(SEED_VERSION_KEY) !== '3') {
      const roster = createSeed();
      localStorage.setItem(PLAYERS_KEY, JSON.stringify(roster));
      localStorage.setItem(SEED_VERSION_KEY, '3');
      return roster;
    }
    return JSON.parse(localStorage.getItem(PLAYERS_KEY) || '[]');
  },
  savePlayers: (players: Player[]) => localStorage.setItem(PLAYERS_KEY, JSON.stringify(players)),
  getSessions: (): Session[] => JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'),
  saveSessions: (sessions: Session[]) => localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)),
  getSettings: (): CostSettings => {
    try {
      return normalizeSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'));
    } catch {
      return { ...defaultSettings };
    }
  },
  saveSettings: (settings: CostSettings) =>
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalizeSettings(settings))),
};
