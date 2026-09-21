export type Gender = "MALE" | "FEMALE";

export type SkillLevel = "Y" | "TBY" | "TB" | "K";

export type MemberType = "CỐ ĐỊNH" | "VÃNG LAI";

export type AttendanceStatus =
  | "ABSENT"
  | "WAITING"
  | "PLAYING"
  | "RESTING"
  | "FINISHED";

export type MatchType = "ĐÔI NAM" | "ĐÔI NỮ" | "ĐÔI NAM NỮ";

export type MatchStatus =
  | "DRAFT"
  | "PLAYING"
  | "COMPLETED"
  | "CANCELLED";

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  skillLevel: SkillLevel;
  memberType: MemberType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionPlayer {
  playerId: string;
  /** Snapshot keeps historical sessions readable if a player is later deleted. */
  playerName: string;
  /** Snapshots for display + cost calc even if roster changes later. */
  gender?: Gender;
  skillLevel?: SkillLevel;
  memberType?: MemberType;
  attendance: AttendanceStatus;
  matchesPlayed: number;
  totalMinutesPlayed: number;
  waitingSince?: string;
}

export interface Match {
  id: string;
  sessionId: string;
  courtId: string;
  type: MatchType;

  team1: string[];
  team2: string[];

  startTime?: string;
  endTime?: string;
  durationMinutes?: number;

  status: MatchStatus;

  assignmentMode: "AUTO" | "MANUAL" | "AUTO_EDITED";

  createdAt: string;
  updatedAt: string;
}

export interface CostSettings {
  /** @deprecated Prefer courtFeeFixedPerHour; kept for legacy localStorage. */
  courtFeePerHour: number;
  /** Giá thuê sân / giờ cho thành viên Cố định. */
  courtFeeFixedPerHour: number;
  /** Giá thuê sân / giờ cho thành viên Vãng lai. */
  courtFeeCasualPerHour: number;
  shuttleFee: number;
  /** @deprecated Removed from UI; kept optional for old sessions. */
  otherFee?: number;
  splitMethod: "EQUAL" | "BY_MATCHES";
  /** Percentage discount applied to a female player's share, default 10. */
  femaleDiscountPercent: number;
}

/** Per-court usage for cost reconciliation (full / supplemental / early return). */
export interface CourtMeta {
  isSupplemental: boolean;
  /** Planned minutes: session duration for initial courts; slider value for supplemental. */
  plannedMinutes: number;
  startedAt: string;
  /** Set when Admin presses TRẢ SÂN (supplemental courts only). */
  returnedAt?: string;
  /** Billable minutes after early return (rounded up to 30). */
  billableMinutes?: number;
}

export interface Session {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  /** Legacy field retained for existing locally stored sessions. */
  durationMinutes?: number;
  plannedDurationMinutes: number;

  numberOfCourts: number;
  courtNumbers: number[];
  /** Courts chosen when the session was created (TRẢ SÂN disabled for these). */
  initialCourtNumbers?: number[];
  /** Per-court usage metadata for supplemental / early-return billing. */
  courtMeta?: Record<string, CourtMeta>;
  /** Per-court display rate / 60 phút (usually fixed rate at add time). */
  courtFees?: Record<string, number>;
  shuttleCount?: number;

  players: SessionPlayer[];
  matches: Match[];

  costs: CostSettings;

  status: "PLANNED" | "RUNNING" | "FINISHED";

  createdAt: string;
  updatedAt: string;
}
