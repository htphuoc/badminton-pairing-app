import { useEffect, useState, useCallback, useMemo } from 'react';
import { Banknote, ChevronRight, Save, X, Mars, Venus } from 'lucide-react';
import { ApiClient } from '../lib/api';
import type { Session, Player, SessionPlayer } from '../models/types';
import { calcSessionCosts, type CostBreakdown } from '../utils/costCalc';
import GenderAvatar from '../components/GenderAvatar';

const money = (n: number) => `${Math.round(n).toLocaleString('vi-VN')}đ`;

const formatClock = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [sessionsData, playersData] = await Promise.all([
        ApiClient.get<Session[]>('/sessions'),
        ApiClient.get<Player[]>('/members')
      ]);
      const finished = sessionsData
        .filter(s => s.status === 'FINISHED')
        .sort((a, b) => (b.endTime || b.date).localeCompare(a.endTime || a.date));
      setSessions(finished);
      setPlayers(playersData);
      
      // Update selected session if it is currently open
      if (selected) {
        const updatedSelected = finished.find(s => s.id === selected.id);
        if (updatedSelected) setSelected(updatedSelected);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  }, [selected]);

  useEffect(() => {
    fetchData();
  }, []);

  const saveSessionSettings = async (s: Session) => {
    setSessions(prev => prev.map(x => x.id === s.id ? { ...x, shuttleCount: s.shuttleCount, isFinalized: s.isFinalized } : x));
    if (selected?.id === s.id) setSelected({ ...selected, shuttleCount: s.shuttleCount, isFinalized: s.isFinalized });
    try {
      await ApiClient.put(`/sessions/${s.id}`, {
        shuttleCount: s.shuttleCount,
        isFinalized: s.isFinalized,
      });
    } catch (err) {
      console.error('Failed to update session settings', err);
      fetchData();
    }
  };

  const updatePlayerPayment = async (sessionId: string, playerId: string, hasPaid: boolean) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        players: s.players?.map(p => p.playerId === playerId ? { ...p, hasPaid } : p)
      };
    }));
    if (selected?.id === sessionId) {
      setSelected(prev => prev ? {
        ...prev,
        players: prev.players?.map(p => p.playerId === playerId ? { ...p, hasPaid } : p)
      } : prev);
    }
    try {
      await ApiClient.put(`/sessions/${sessionId}/players/${playerId}`, { hasPaid });
    } catch (err) {
      console.error('Failed to update player payment', err);
      fetchData();
    }
  };

  const genderLookup = useCallback(
    (id: string) => players.find(p => p.id === id)?.gender,
    [players],
  );

  const sessionCosts = useMemo(() => {
    const map = new Map<string, CostBreakdown>();
    for (const s of sessions) {
      map.set(s.id, calcSessionCosts(s, genderLookup));
    }
    return map;
  }, [sessions, genderLookup]);

  const calc = (s: Session): CostBreakdown =>
    sessionCosts.get(s.id) ?? calcSessionCosts(s, genderLookup);

  return (
    <div className="pb-20 space-y-3">
      <h2 className="text-xl font-extrabold uppercase">BẢNG TỔNG KẾT</h2>

      {sessions.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
          Chưa có buổi chơi đã kết thúc.
        </div>
      )}

      {sessions.map(s => {
        const costs = calc(s);
        const endStr = s.endTime ? new Date(s.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
        const displayDate = s.endTime ? new Date(s.endTime) : new Date((s.sessionDate || s.date) + 'T00:00:00');
        const dateStr = displayDate.toLocaleDateString('vi-VN') + (endStr ? ` - ${endStr}` : '');
        return (
          <button
            key={s.id}
            onClick={() => setSelected(s)}
            className="w-full bg-white rounded-2xl border border-teal-100 px-4 py-3 flex items-center justify-between shadow-sm active:bg-teal-50 text-left gap-3"
          >
            <div className="min-w-0 flex-1">
              <span className="text-sm font-extrabold text-primary block">📅 {dateStr}</span>
              <span className="text-xs text-gray-500">
                {costs.participants.length} người · {s.matches.length} trận · {(s.courtNumbers?.length || 0)} sân
              </span>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex flex-wrap justify-end gap-1">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.sessionType === 'VÃNG LAI' ? 'bg-emerald-600' : 'bg-primary'} text-white`}>
                  {s.sessionType === 'VÃNG LAI' ? 'Vãng lai' : 'Cố định'}
                </span>
                {s.isFinalized && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                    Đã chốt
                  </span>
                )}
              </div>
              {(() => {
                const received = Math.round(costs.participants.filter(p => s.players?.find(sp => sp.playerId === p.playerId)?.hasPaid).reduce((sum, p) => sum + costs.owed(p), 0));
                return (
                  <div className="text-right flex flex-col items-end">
                    
                    <div className="text-sm font-black text-primary whitespace-nowrap">
                      <span className="text-emerald-600">{money(received)}</span>
                      <span className="text-gray-300 mx-1">/</span>
                      {money(costs.total)}
                    </div>
                  </div>
                );
              })()}
            </div>
            <ChevronRight size={18} className="text-teal-400 flex-shrink-0" />
          </button>
        );
      })}

      {selected && (
        <MoneySheet
          session={selected}
          calc={calc(selected)}
          players={players}
          updateSettings={saveSessionSettings}
          updatePayment={updatePlayerPayment}
          close={() => setSelected(null)}
        />
      )}
    </div>
  );
}

interface MoneySheetProps {
  session: Session;
  calc: CostBreakdown;
  players: Player[];
  updateSettings: (s: Session) => void;
  updatePayment: (sessionId: string, playerId: string, hasPaid: boolean) => void;
  close: () => void;
}

function MoneySheet({ session, calc, players, updateSettings, updatePayment, close }: MoneySheetProps) {
  const [localShuttle, setLocalShuttle] = useState(session.shuttleCount ?? 15);
useEffect(() => { setLocalShuttle(session.shuttleCount ?? 15); }, [session.shuttleCount]);
const setShuttle = (value: number) => { setLocalShuttle(value); };
const handleShuttleBlur = () => { if (localShuttle !== session.shuttleCount) updateSettings({ ...session, shuttleCount: localShuttle }); };

  const endStr = session.endTime ? new Date(session.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
  const displayDate = session.endTime ? new Date(session.endTime) : new Date((session.sessionDate || session.date) + 'T00:00:00');
  const dateStr = displayDate.toLocaleDateString('vi-VN') + (endStr ? ` - ${endStr}` : '');
  const pricePerShuttle = session.costs.shuttleFee ?? 28000;

  const genderOf = (p: SessionPlayer) =>
    p.gender ?? players.find(x => x.id === p.playerId)?.gender ?? 'MALE';

  // Tính tiền mẫu cho 1 nam / 1 nữ
  const costMale = calc.owed({ playerId: 'M', playerName: 'M', matchesPlayed: 1, totalMinutesPlayed: 0, gender: 'MALE', attendance: 'FINISHED' } as SessionPlayer);
  const costFemale = calc.owed({ playerId: 'F', playerName: 'F', matchesPlayed: 1, totalMinutesPlayed: 0, gender: 'FEMALE', attendance: 'FINISHED' } as SessionPlayer);

  const totalPaid = calc.participants
    .filter(p => session.players.find(sp => sp.playerId === p.playerId)?.hasPaid)
    .reduce((sum, p) => sum + calc.owed(p), 0);

  const totalRemaining = calc.total - totalPaid;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/55 flex items-end sm:items-center justify-center">
      <div className="bg-gray-50 w-full max-w-md max-h-[95vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl pb-6">
        <header className="bg-primary text-white p-5 flex justify-between items-start">
          <div>
            <p className="text-xs font-bold tracking-widest text-teal-100 uppercase">
              BẢNG TỔNG KẾT · {session.sessionType === 'VÃNG LAI' ? 'VÃNG LAI' : 'CỐ ĐỊNH'}
            </p>
            <h3 className="text-xl font-extrabold leading-tight">{dateStr}</h3>
            <p className="text-xs text-teal-100 mt-1">
              {(session.courtNumbers?.length || 0)} sân · {session.matches.length} trận · {calc.participants.length} người · {Math.floor((session.plannedDurationMinutes || 120) / 60)}h{((session.plannedDurationMinutes || 120) % 60) === 0 ? '00' : String((session.plannedDurationMinutes || 120) % 60).padStart(2, '0')} {session.sessionType?.toLowerCase() === 'vãng lai' ? 'vãng lai' : 'cố định'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!session.isFinalized ? (
              <button
                onClick={() => {
                  if (window.confirm('CHỐT TIỀN CẦU sẽ không thể sửa lại số cầu. Bạn có chắc chắn?')) {
                    updateSettings({ ...session, isFinalized: true });
                  }
                }}
                className="border border-white/60 hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition"
              >
                <Save size={16} /> CHỐT TIỀN CẦU
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-lg text-sm font-bold border border-transparent bg-white/20">
                ĐÃ CHỐT
              </div>
            )}
            <button onClick={close} className="hover:text-teal-200 transition">
              <X size={24} />
            </button>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <CostCard icon={<Banknote size={18} />} label="Tiền sân" value={calc.courtCost} />

            <div className="bg-primary text-white rounded-2xl p-2 shadow-sm border border-primary flex flex-col items-center justify-center">
              <label className="text-[10px] font-extrabold block uppercase text-center mb-1.5 leading-tight text-white/90">
                Số quả cầu
              </label>
              <input
                type="number"
                min="0"
                value={localShuttle}
                onChange={e => setShuttle(+e.target.value || 0)} onBlur={handleShuttleBlur}
                disabled={session.isFinalized}
                className="w-14 text-center rounded-md px-1 py-1 border border-teal-600 text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-white bg-white disabled:opacity-80 disabled:bg-gray-200"
              />
              <div className="text-[9px] text-teal-100 mt-1.5 font-medium whitespace-nowrap">
                {pricePerShuttle.toLocaleString('vi-VN')}đ/quả
              </div>
            </div>

            <CostCard icon={<ShuttlecockIcon size={22} />} label="Tiền cầu" value={calc.shuttleCost} />
          </div>

          <div className="bg-white border border-teal-100 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col items-center justify-center flex-1">
                <p className="text-xs font-bold text-primary uppercase">TỔNG CỘNG</p>
                <b className="text-3xl text-primary">{money(calc.total)}</b>
              </div>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <img
                  src="/payment-qr.png"
                  className="w-28 h-28 rounded-xl object-contain border border-teal-100 shadow-sm"
                  alt="Mã QR thanh toán"
                />
                <span className="text-[10px] text-gray-500 font-medium">Nguyễn Thị Hồng Dung</span>
              </div>
            </div>

            <div className="rounded-xl p-3 border border-gray-200 flex flex-col items-center">
              {session.costs.splitMethod !== 'BY_MATCHES' && (
                <div className="flex justify-center gap-2 mb-2 w-full">
                  <div className="flex items-center gap-1 border border-blue-200 bg-blue-50/50 rounded px-2 py-1.5 flex-1">
                    <div className="bg-blue-500 text-white rounded-[4px] w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <Mars size={11} strokeWidth={3} />
                    </div>
                    <span className="text-blue-600 font-extrabold text-[11px]">NAM:</span>
                    <span className="font-bold text-primary text-[11px] ml-auto">{money(costMale)}</span>
                  </div>
                  <div className="flex items-center gap-1 border border-pink-200 bg-pink-50/50 rounded px-2 py-1.5 flex-1">
                    <div className="bg-pink-500 text-white rounded-[4px] w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <Venus size={11} strokeWidth={3} />
                    </div>
                    <span className="text-pink-600 font-extrabold text-[11px]">NỮ:</span>
                    <span className="font-bold text-primary text-[11px] ml-auto">{money(costFemale)}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-center gap-2 w-full">
                <div className="flex flex-col items-center justify-center border border-green-200 bg-green-50/50 rounded px-2 py-1.5 flex-1">
                  <span className="text-[10px] text-green-600 font-extrabold uppercase mb-0.5">ĐÃ NHẬN</span>
                  <span className="text-sm font-bold text-green-700">{money(totalPaid)}</span>
                </div>
                <div className="flex flex-col items-center justify-center border border-amber-200 bg-amber-50/50 rounded px-2 py-1.5 flex-1">
                  <span className="text-[10px] text-amber-600 font-extrabold uppercase mb-0.5">Còn lại</span>
                  <span className="text-sm font-bold text-amber-700">{money(totalRemaining)}</span>
                </div>
              </div>
            </div>
          </div>

          <CourtTimeSection session={session} />

          <div className="bg-white border border-teal-100 rounded-2xl overflow-hidden shadow-sm mb-4">
            <div className="grid grid-cols-[1fr_44px_60px_72px_44px] px-4 py-3 border-b border-teal-100 text-[11px] font-extrabold text-primary uppercase items-center gap-1">
              <span>TÊN</span>
              <span className="text-center">Số C</span>
              <span className="text-center">Số Phút</span>
              <span className="text-right">TIỀN</span>
              <span className="text-center text-[10px] leading-none">ĐÃ<br/>NHẬN</span>
            </div>
            {calc.participants.length === 0 ? (
              <p className="p-4 text-center text-gray-400 text-sm">Không có thành viên tham gia.</p>
            ) : (
              calc.participants.map(p => (
                <div
                  key={p.playerId}
                  className="grid grid-cols-[1fr_44px_60px_72px_44px] px-4 py-3 border-b border-gray-100 last:border-0 text-sm items-center gap-1 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GenderAvatar gender={genderOf(p)} size={28} />
                    <div className="min-w-0">
                      <b className="block truncate">{p.playerName || 'Người chơi'}</b>
                      <small className="text-[10px] text-gray-400">
                        {p.skillLevel ?? '—'} ·{' '}
                        {p.memberType === 'VÃNG LAI' ? 'Vãng lai' : 'Cố định'}
                      </small>
                    </div>
                  </div>
                  <span className="text-gray-600 text-center font-medium">{p.matchesPlayed}</span>
                  <span className="text-gray-600 text-center font-medium">{p.totalMinutesPlayed}</span>
                  <b className="text-primary text-right">{money(calc.owed(p))}</b>
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      checked={session.players.find(sp => sp.playerId === p.playerId)?.hasPaid || false}
                      disabled={session.players.find(sp => sp.playerId === p.playerId)?.hasPaid || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          if (window.confirm(`Xác nhận đã nhận tiền từ ${p.playerName}?`)) {
                            updatePayment(session.id, p.playerId, true);
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CostCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-primary text-white border border-primary rounded-2xl p-2 shadow-sm flex flex-col items-center justify-center">
      <div className="text-white/90 mb-1">{icon}</div>
      <p className="text-[10px] font-extrabold uppercase text-center mb-0.5 leading-tight text-white/90">{label}</p>
      <b className="text-sm whitespace-nowrap">{money(value)}</b>
    </div>
  );
}

function CourtTimeSection({ session }: { session: Session }) {
  const courts = session.courtNumbers?.length
    ? session.courtNumbers
    : Array.from({ length: (session.courtNumbers?.length || 0) }, (_, i) => i + 1);

  if (!courts.length) return null;

  return (
    <div className="bg-white border border-teal-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <p className="text-xs font-extrabold text-primary uppercase">CHI TIẾT GIỜ SÂN / TRẬN</p>
      </div>
      <div className="divide-y divide-gray-100">
        {courts.map(courtNum => {
          const key = String(courtNum);
          const meta = session.courtMeta?.[key];
          const courtStart = meta?.startedAt || session.startTime;
          const courtEnd = meta?.returnedAt || session.endTime;
          const matches = session.matches
            .filter(m => m.courtId === key && m.status !== 'CANCELLED')
            .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

          return (
            <div key={courtNum} className="p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <b className="text-sm text-primary">Sân {courtNum}</b>
                <span className="text-xs text-gray-500 font-bold">
                  {formatClock(courtStart)} – {formatClock(courtEnd)}
                </span>
              </div>
              {matches.length === 0 ? (
                <p className="text-xs text-gray-400">Không có trận trên sân này.</p>
              ) : (
                <ul className="space-y-1.5">
                  {matches.map((m, idx) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-2 text-xs text-gray-600"
                    >
                      <span>
                        Trận {idx + 1}
                        {m.type ? ` · ${m.type}` : ''}
                      </span>
                      <span className="font-bold whitespace-nowrap">
                        {formatClock(m.startTime)} – {formatClock(m.endTime)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShuttlecockIcon({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
    >
      {/* Feathers fan */}
      <ellipse cx="32" cy="20" rx="18" ry="14" fill="currentColor" opacity="0.15" />
      {/* Individual feather lines */}
      <line x1="32" y1="38" x2="14" y2="8"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <line x1="32" y1="38" x2="20" y2="6"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.75"/>
      <line x1="32" y1="38" x2="27" y2="5"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
      <line x1="32" y1="38" x2="32" y2="5"  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="32" y1="38" x2="37" y2="5"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
      <line x1="32" y1="38" x2="44" y2="6"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.75"/>
      <line x1="32" y1="38" x2="50" y2="8"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      {/* Arc connecting feather tips */}
      <path d="M14 8 Q32 2 50 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      {/* Cork base */}
      <ellipse cx="32" cy="50" rx="7" ry="9" fill="currentColor" opacity="0.85"/>
      {/* Skirt ring */}
      <ellipse cx="32" cy="40" rx="7" ry="3" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* Cork highlight */}
      <ellipse cx="30" cy="47" rx="2.5" ry="3.5" fill="white" opacity="0.25"/>
    </svg>
  );
}
