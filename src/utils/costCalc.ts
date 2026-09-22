import type { CostSettings, Gender, MemberType, Session, SessionPlayer } from '../models/types';

/** Round actual minutes up to the nearest 30-minute block. */
export function roundUpTo30(actualMinutes: number): number {
  if (actualMinutes <= 0) return 30;
  return Math.ceil(actualMinutes / 30) * 30;
}

export function courtRateForMember(costs: CostSettings, memberType?: MemberType): number {
  const fixed = costs.courtFeeFixedPerHour ?? costs.courtFeePerHour ?? 130000;
  const casual = costs.courtFeeCasualPerHour ?? fixed;
  return memberType === 'VÃNG LAI' ? casual : fixed;
}

/** Billable minutes for one court (full session / supplemental / early return). */
export function getCourtBillableMinutes(session: Session, courtNumber: number): number {
  const key = String(courtNumber);
  const meta = session.courtMeta?.[key];
  if (meta?.returnedAt != null && meta.billableMinutes != null) {
    return meta.billableMinutes;
  }
  if (meta?.isSupplemental) {
    return meta.plannedMinutes;
  }
  return session.plannedDurationMinutes || session.durationMinutes || 120;
}

/** Total court-hours across all courts in the session. */
export function totalCourtHours(session: Session): number {
  const courts = session.courtNumbers?.length
    ? session.courtNumbers
    : Array.from({ length: session.numberOfCourts }, (_, i) => i + 1);
  return courts.reduce((sum, c) => sum + getCourtBillableMinutes(session, c) / 60, 0);
}

/**
 * Tiền sân = tổng (giờ sân * đơn giá sân).
 * Sân cố định (initial courts) dùng giá courtFeeFixedPerHour.
 * Sân vãng lai (supplemental courts) dùng giá courtFeeCasualPerHour.
 */
export function calcCourtCost(session: Session): number {
  const fixedRate = session.costs.courtFeeFixedPerHour ?? session.costs.courtFeePerHour ?? 130000;
  const casualRate = session.costs.courtFeeCasualPerHour ?? fixedRate;

  const courts = session.courtNumbers?.length
    ? session.courtNumbers
    : Array.from({ length: session.numberOfCourts }, (_, i) => i + 1);

  let totalCost = 0;
  for (const c of courts) {
    const hours = getCourtBillableMinutes(session, c) / 60;
    
    const key = String(c);
    const meta = session.courtMeta?.[key];
    const isSupplemental = meta?.isSupplemental || (session.initialCourtNumbers && !session.initialCourtNumbers.includes(c));
    
    if (isSupplemental) {
      totalCost += hours * casualRate;
    } else {
      totalCost += hours * fixedRate;
    }
  }

  return totalCost;
}

export function calcShuttleCost(session: Session): number {
  const count = session.shuttleCount ?? 0;
  const price =
    (session.costs as CostSettings & { shuttleCostPerShuttle?: number }).shuttleCostPerShuttle ??
    session.costs.shuttleFee ??
    28000;
  return count * price;
}

export interface CostBreakdown {
  courtCost: number;
  shuttleCost: number;
  total: number;
  participants: SessionPlayer[];
  owed: (p: SessionPlayer) => number;
}

/** Participants for money split: everyone who joined the session (not ABSENT). */
export function calcSessionCosts(
  session: Session,
  genderLookup: (playerId: string) => Gender | undefined = () => undefined,
): CostBreakdown {
  const courtCost = calcCourtCost(session);
  const shuttleCost = calcShuttleCost(session);
  const total = courtCost + shuttleCost;

  const participants = session.players.filter(p => p.attendance !== 'ABSENT');

  const weight = (p: SessionPlayer) => {
    const gender = p.gender ?? genderLookup(p.playerId);
    const isFemale = gender === 'FEMALE';
    const discount = isFemale ? 1 - (session.costs.femaleDiscountPercent || 10) / 100 : 1;
    const base = session.costs.splitMethod === 'BY_MATCHES' ? Math.max(p.matchesPlayed, 0) : 1;
    // BY_MATCHES: người 0 trận vẫn hiện nhưng trọng số 0 → 0đ
    return base * discount;
  };

  const totalUnits = participants.reduce((a, p) => a + weight(p), 0);

  return {
    courtCost,
    shuttleCost,
    total,
    participants,
    owed: (p: SessionPlayer) =>
      totalUnits > 0 ? Math.round((weight(p) / totalUnits) * total / 1000) * 1000 : 0,
  };
}

export function careerMatchCount(playerId: string, sessions: Session[]): number {
  return sessions.reduce((sum, s) => {
    const sp = s.players.find(p => p.playerId === playerId);
    return sum + (sp?.matchesPlayed ?? 0);
  }, 0);
}
