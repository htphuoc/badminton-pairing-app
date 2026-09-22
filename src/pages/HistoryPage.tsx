import { useEffect, useState } from 'react';
import { Banknote, ChevronRight, Save, Volleyball, X, Mars, Venus } from 'lucide-react';
import { StorageService } from '../storage/storage';
import type { Session, Player, SessionPlayer } from '../models/types';
import { calcSessionCosts, type CostBreakdown } from '../utils/costCalc';
import GenderAvatar from '../components/GenderAvatar';

const money = (n: number) => `${Math.round(n).toLocaleString('vi-VN')}đ`;
const moneyK = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace('.0', '')}tr`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return `${n}đ`;
};

const formatClock = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const all = StorageService.getSessions()
      .filter(s => s.status === 'FINISHED')
      .sort((a, b) => (b.endTime || b.date).localeCompare(a.endTime || a.date));
    setSessions(all);
    setPlayers(StorageService.getPlayers());
  }, []);

  const saveSession = (s: Session) => {
    const all = StorageService.getSessions().map(item => (item.id === s.id ? s : item));
    StorageService.saveSessions(all);
    setSessions(
      all.filter(item => item.status === 'FINISHED').sort((a, b) => (b.endTime || b.date).localeCompare(a.endTime || a.date)),
    );
    setSelected(s);
  };

  const calc = (s: Session): CostBreakdown =>
    calcSessionCosts(s, id => players.find(p => p.id === id)?.gender);

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
        const displayDate = s.endTime ? new Date(s.endTime) : new Date(s.date + 'T00:00:00');
        const dateStr = displayDate.toLocaleDateString('vi-VN') + (endStr ? ` - ${endStr}` : '');
        return (
          <button
            key={s.id}
            onClick={() => setSelected(s)}
            className="w-full bg-white rounded-2xl border border-teal-100 px-4 py-3 flex items-center justify-between shadow-sm active:bg-teal-50 text-left"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-primary">📅 {dateStr}</span>
                <span className="text-xs text-gray-500">
                  {costs.participants.length} người · {s.matches.length} trận · {s.numberOfCourts} sân
                  · <b className="text-primary">{moneyK(costs.total)}</b>
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-teal-400 flex-shrink-0 ml-2" />
          </button>
        );
      })}

      {selected && (
        <MoneySheet
          session={selected}
          calc={calc(selected)}
          players={players}
          update={saveSession}
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
  update: (s: Session) => void;
  close: () => void;
}

function MoneySheet({ session, calc, players, update, close }: MoneySheetProps) {
  const setShuttle = (value: number) => update({ ...session, shuttleCount: value });

  const endStr = session.endTime ? new Date(session.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
  const displayDate = session.endTime ? new Date(session.endTime) : new Date(session.date + 'T00:00:00');
  const dateStr = displayDate.toLocaleDateString('vi-VN') + (endStr ? ` - ${endStr}` : '');
  const pricePerShuttle = session.costs.shuttleFee ?? 28000;

  const genderOf = (p: SessionPlayer) =>
    p.gender ?? players.find(x => x.id === p.playerId)?.gender ?? 'MALE';

  // Tính tiền mẫu cho 1 nam / 1 nữ
  const costMale = calc.owed({ playerId: 'M', playerName: 'M', matchesPlayed: 1, totalMinutesPlayed: 0, gender: 'MALE', attendance: 'PRESENT' } as SessionPlayer);
  const costFemale = calc.owed({ playerId: 'F', playerName: 'F', matchesPlayed: 1, totalMinutesPlayed: 0, gender: 'FEMALE', attendance: 'PRESENT' } as SessionPlayer);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/55 flex items-end sm:items-center justify-center">
      <div className="bg-gray-50 w-full max-w-md max-h-[95vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl pb-6">
        <header className="bg-primary text-white p-5 flex justify-between items-start">
          <div>
            <p className="text-xs font-bold tracking-widest text-teal-100">BẢNG TỔNG KẾT</p>
            <h3 className="text-xl font-extrabold leading-tight">{dateStr}</h3>
            <p className="text-xs text-teal-100 mt-1">
              {session.numberOfCourts} sân · {session.matches.length} trận · {calc.participants.length} người
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => update(session)}
              className="border border-white/60 hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition"
            >
              <Save size={16} /> LƯU
            </button>
            <button onClick={close} className="hover:text-teal-200 transition">
              <X size={24} />
            </button>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <CostCard icon={<Banknote size={18} />} label="Tiền sân" value={calc.courtCost} />

            <div className="bg-white rounded-2xl p-2 shadow-sm border border-teal-100 flex flex-col items-center justify-center">
              <label className="text-[10px] font-extrabold block text-primary uppercase text-center mb-1.5 leading-tight">
                Số quả cầu
              </label>
              <input
                type="number"
                min="0"
                value={session.shuttleCount ?? 15}
                onChange={e => setShuttle(+e.target.value || 0)}
                className="w-14 text-center rounded-md px-1 py-1 border border-teal-200 text-sm font-bold text-primary focus:outline-none focus:border-teal-400 bg-teal-50/50"
              />
              <div className="text-[9px] text-gray-400 mt-1.5 font-medium whitespace-nowrap">
                {pricePerShuttle.toLocaleString('vi-VN')}đ/quả
              </div>
            </div>

            <CostCard icon={<Volleyball size={18} />} label="Tiền cầu" value={calc.shuttleCost} />
          </div>

          <div className="bg-white border border-teal-100 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-primary uppercase">TỔNG CỘNG</p>
                <b className="text-3xl text-primary">{money(calc.total)}</b>
                <p className="text-[11px] text-gray-400 mt-1">Tự động lưu khi nhập</p>
              </div>
              <img
                src="/payment-qr.png"
                className="w-20 h-20 rounded-lg object-contain"
                alt="Mã QR thanh toán"
              />
            </div>

            <div className="rounded-xl p-3 border border-gray-200 flex flex-col items-center">
              <div className="text-xs font-extrabold text-center uppercase mb-3 text-gray-500">CHIA TIỀN</div>
              <div className="flex justify-center gap-3 mb-4 w-full">
                <div className="flex items-center justify-between border border-blue-200 bg-blue-50/50 rounded px-2 py-1.5 flex-1 max-w-[140px]">
                  <span className="text-blue-600 font-extrabold text-sm">NAM:</span>
                  <span className="font-bold text-primary">{money(costMale)}</span>
                  <div className="bg-blue-500 text-white rounded-[4px] w-5 h-5 flex items-center justify-center ml-1">
                    <Mars size={14} strokeWidth={3} />
                  </div>
                </div>
                <div className="flex items-center justify-between border border-pink-200 bg-pink-50/50 rounded px-2 py-1.5 flex-1 max-w-[140px]">
                  <span className="text-pink-600 font-extrabold text-sm">NỮ:</span>
                  <span className="font-bold text-primary">{money(costFemale)}</span>
                  <div className="bg-pink-500 text-white rounded-[4px] w-5 h-5 flex items-center justify-center ml-1">
                    <Venus size={14} strokeWidth={3} />
                  </div>
                </div>
              </div>
              <div className="text-center w-full">
                <div className="text-[10px] text-gray-400 font-medium uppercase mb-0.5">CHUYỂN KHOẢN CHO:</div>
                <div className="text-sm font-extrabold text-primary uppercase">NGUYỄN THỊ HỒNG DUNG</div>
              </div>
            </div>
          </div>

          <CourtTimeSection session={session} />

          <div className="bg-white border border-teal-100 rounded-2xl overflow-hidden shadow-sm mb-4">
            <div className="grid grid-cols-[1fr_48px_48px_80px] px-4 py-3 border-b border-teal-100 text-[11px] font-extrabold text-primary uppercase">
              <span>TÊN</span>
              <span className="text-center">TRẬN</span>
              <span className="text-center">PHÚT</span>
              <span className="text-right">SỐ TIỀN</span>
            </div>
            {calc.participants.length === 0 ? (
              <p className="p-4 text-center text-gray-400 text-sm">Không có thành viên tham gia.</p>
            ) : (
              calc.participants.map(p => (
                <div
                  key={p.playerId}
                  className="grid grid-cols-[1fr_48px_48px_80px] px-4 py-3 border-b border-gray-100 last:border-0 text-sm items-center gap-1 hover:bg-gray-50"
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
    <div className="bg-white border border-teal-100 rounded-2xl p-2 shadow-sm flex flex-col items-center justify-center">
      <div className="text-primary mb-1">{icon}</div>
      <p className="text-[10px] font-extrabold text-primary uppercase text-center mb-0.5 leading-tight">{label}</p>
      <b className="text-primary text-sm whitespace-nowrap">{money(value)}</b>
    </div>
  );
}

function CourtTimeSection({ session }: { session: Session }) {
  const courts = session.courtNumbers?.length
    ? session.courtNumbers
    : Array.from({ length: session.numberOfCourts }, (_, i) => i + 1);

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
