import { pgTable, text, integer, real, boolean, jsonb } from 'drizzle-orm/pg-core';

// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  role: text('role', { enum: ['ADMIN', 'HOST', 'MEMBER'] }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ─── GROUPS ──────────────────────────────────────────────────────────────────
export const groups = pgTable('groups', {
  id: text('id').primaryKey(),
  hostUserId: text('host_user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ─── MEMBERS ─────────────────────────────────────────────────────────────────
export const members = pgTable('members', {
  id: text('id').primaryKey(),
  groupId: text('group_id').notNull().references(() => groups.id),
  userAccountId: text('user_account_id').references(() => users.id), // nullable — member w/o login
  name: text('name').notNull(),
  gender: text('gender', { enum: ['MALE', 'FEMALE'] }).notNull(),
  skillLevel: text('skill_level', { enum: ['Y', 'TBY', 'TB', 'K'] }).notNull(),
  memberType: text('member_type', { enum: ['CỐ ĐỊNH', 'VÃNG LAI'] }).notNull(),
  phone: text('phone'),
  note: text('note'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ─── GROUP SETTINGS ──────────────────────────────────────────────────────────
export const groupSettings = pgTable('group_settings', {
  id: text('id').primaryKey(),
  groupId: text('group_id').notNull().unique().references(() => groups.id),
  courtFeeFixedPerHour: integer('court_fee_fixed_per_hour').notNull().default(130000),
  courtFeeCasualPerHour: integer('court_fee_casual_per_hour').notNull().default(180000),
  shuttleFee: integer('shuttle_fee').notNull().default(28000),
  splitMethod: text('split_method', { enum: ['EQUAL', 'BY_MATCHES'] }).notNull().default('EQUAL'),
  femaleDiscountPercent: integer('female_discount_percent').notNull().default(10),
  defaultCourtsByWeekday: text('default_courts_by_weekday').notNull().default('{}'), // JSON
  updatedAt: text('updated_at').notNull(),
});

// ─── SESSIONS ─────────────────────────────────────────────────────────────────
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  groupId: text('group_id').notNull().references(() => groups.id),
  sessionDate: text('session_date').notNull(),
  startTime: text('start_time'),
  endTime: text('end_time'),
  plannedDurationMinutes: integer('planned_duration_minutes').notNull().default(120),
  sessionType: text('session_type', { enum: ['CỐ ĐỊNH', 'VÃNG LAI'] }).notNull().default('CỐ ĐỊNH'),
  status: text('status', { enum: ['PLANNED', 'RUNNING', 'FINISHED'] }).notNull().default('PLANNED'),
  shuttleCount: integer('shuttle_count').notNull().default(15),
  isFinalized: boolean('is_finalized').notNull().default(false),
  // Court data stored as JSON (small, session-specific)
  courtNumbers: text('court_numbers').notNull().default('[]'),       // JSON: number[]
  initialCourtNumbers: text('initial_court_numbers').notNull().default('[]'), // JSON: number[]
  courtMeta: text('court_meta').notNull().default('{}'),             // JSON: Record<string,CourtMeta>
  courtFees: text('court_fees').notNull().default('{}'),             // JSON: Record<string,number>
  // Snapshot of cost settings at session creation time
  costsSnapshot: text('costs_snapshot').notNull().default('{}'),     // JSON: CostSettings
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ─── SESSION PLAYERS ─────────────────────────────────────────────────────────
export const sessionPlayers = pgTable('session_players', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  memberId: text('member_id').notNull().references(() => members.id),
  // Snapshots for historical accuracy
  playerName: text('player_name').notNull(),
  gender: text('gender', { enum: ['MALE', 'FEMALE'] }),
  skillLevel: text('skill_level', { enum: ['Y', 'TBY', 'TB', 'K'] }),
  memberType: text('member_type', { enum: ['CỐ ĐỊNH', 'VÃNG LAI'] }),
  attendance: text('attendance', { enum: ['ABSENT', 'WAITING', 'PLAYING', 'RESTING', 'FINISHED'] }).notNull().default('WAITING'),
  matchesPlayed: integer('matches_played').notNull().default(0),
  totalMinutesPlayed: integer('total_minutes_played').notNull().default(0),
  waitingSince: text('waiting_since'),
  hasPaid: boolean('has_paid').notNull().default(false),
});

// ─── MATCHES ─────────────────────────────────────────────────────────────────
export const matches = pgTable('matches', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  groupId: text('group_id').notNull().references(() => groups.id),
  courtId: text('court_id').notNull(), // e.g., "1", "2", "3"
  matchType: text('match_type', { enum: ['ĐÔI NAM', 'ĐÔI NỮ', 'ĐÔI NAM NỮ', 'TỰ DO'] }).notNull().default('TỰ DO'),
  team1: text('team1').notNull().default('[]'), // JSON: memberId[]
  team2: text('team2').notNull().default('[]'), // JSON: memberId[]
  startTime: text('start_time'),
  endTime: text('end_time'),
  durationMinutes: integer('duration_minutes'),
  status: text('status', { enum: ['DRAFT', 'PLAYING', 'COMPLETED', 'CANCELLED'] }).notNull().default('PLAYING'),
  assignmentMode: text('assignment_mode', { enum: ['AUTO', 'MANUAL'] }).notNull().default('AUTO'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Type exports for use throughout the app
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type GroupSettings = typeof groupSettings.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type SessionPlayer = typeof sessionPlayers.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
