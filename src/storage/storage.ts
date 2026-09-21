import type { Player, Session, CostSettings, Gender, SkillLevel } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

const PLAYERS_KEY = 'badminton_players', SESSIONS_KEY = 'badminton_sessions', SETTINGS_KEY = 'badminton_settings', SEED_VERSION_KEY = 'badminton_seed_version';
const imported: [string, Gender, SkillLevel][] = [
  ['Hà','FEMALE','TBY'], ['Phương','FEMALE','TBY'], ['Tường','MALE','TB'], ['Vân','FEMALE','TB'], ['Hà lớn','FEMALE','TB'], ['c Ba','FEMALE','TBY'], ['Nhi','FEMALE','TB'], ['Oanh','FEMALE','TBY'], ['c Kiều','FEMALE','Y'], ['a Hoàng','MALE','TB'], ['Phương NT','MALE','TB'], ['Tài','MALE','TB'], ['Hào','MALE','TBY'], ['Huân','MALE','TB'], ['a Bảo','MALE','TB'], ['a Phước','MALE','TB'], ['Lộc','MALE','TBY'], ['a Bi','MALE','TBY'], ['Cường','MALE','TB'], ['Đạt','MALE','Y'], ['Hiếu','MALE','TB'], ['Phúc','MALE','TB'], ['Duy','MALE','TBY'], ['Dung','FEMALE','TB']
];
const createSeed = (): Player[] => imported.map(([name, gender, skillLevel]) => ({ id: uuidv4(), name, gender, skillLevel, memberType: 'CỐ ĐỊNH', active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));

const defaultSettings: CostSettings = {
  courtFeePerHour: 130000,
  courtFeeFixedPerHour: 130000,
  courtFeeCasualPerHour: 180000,
  shuttleFee: 28000,
  splitMethod: 'EQUAL',
  femaleDiscountPercent: 10,
};

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
  };
}

export const StorageService = {
  getPlayers: (): Player[] => {
    // Versioned reset is intentional: replace the old demo list with the roster supplied in the design reference.
    if (localStorage.getItem(SEED_VERSION_KEY) !== '2') {
      const roster = createSeed();
      localStorage.setItem(PLAYERS_KEY, JSON.stringify(roster));
      localStorage.setItem(SEED_VERSION_KEY, '2');
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
