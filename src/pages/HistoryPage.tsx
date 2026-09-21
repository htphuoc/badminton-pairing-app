import { useEffect, useState } from 'react';
import { Banknote, ChevronRight, Save, Volleyball, X } from 'lucide-react';
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

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const all = StorageService.getSessions()
      .filter(s => s.status === 'FINISHED')
      .sort((a, b) => b.date.localeCompare(a.date));
    setSessions(all);
    setPlayers(StorageService.getPlayers());
  }, []);

  const saveSession = (s: Session) => {
    const all = StorageService.getSessions().map(item => (item.id === s.id ? s : item));
    StorageService.saveSessions(all);
    setSessions(
      all.filter(item => item.status === 'FINISHED').sort((a, b) => b.date.localeCompare(a.date)),
    );
    setSelected(s);
  };

  const calc = (s: Session): CostBreakdown =>
    calcSessionCosts(s, id => players.find(p => p.id === id)?.gender);

  return (
    <div className="pb-20 space-y-3">
      <h2 className="text-xl font-extrabold uppercase">BẢNG CHIA TIỀN</h2>

      {sessions.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
          Chưa có buổi chơi đã kết thúc.
        </div>
      )}

      {sessions.map(s => {
        const costs = calc(s);
        const dateStr = new Date(s.date + 'T00:00:00').toLocaleDateString('vi-VN');
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

  const dateStr = new Date(session.date + 'T00:00:00').toLocaleDateString('vi-VN');
  const pricePerShuttle = session.costs.shuttleFee ?? 28000;

  const genderOf = (p: SessionPlayer) =>
    p.gender ?? players.find(x => x.id === p.playerId)?.gender ?? 'MALE';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/55 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md max-h-[95vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl">
        <header className="bg-primary text-white p-5 flex justify-between items-start">
          <div>
            <p className="text-xs font-bold tracking-widest text-teal-100">BẢNG CHIA TIỀN</p>
            <h3 className="text-xl font-extrabold">{dateStr}</h3>
            <p className="text-xs text-teal-100 mt-0.5">
              {session.numberOfCourts} sân · {session.matches.length} trận · {calc.participants.length}{' '}
              người
            </p>
          </div>
          <button onClick={close}>
            <X size={22} />
          </button>
        </header>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <CostCard icon={<Banknote />} label="Tiền sân" value={calc.courtCost} />
            <CostCard icon={<Volleyball />} label="Tiền cầu" value={calc.shuttleCost} />
          </div>

          <div className="bg-teal-50 rounded-2xl p-3">
            <label className="text-xs font-bold block">
              SỐ QUẢ CẦU ĐÃ DÙNG
              <input
                type="number"
                min="0"
                value={session.shuttleCount || 0}
                onChange={e => setShuttle(+e.target.value || 0)}
                className="mt-1 w-full rounded-lg p-2 border border-teal-100 text-base"
              />
              <span className="text-gray-400 font-normal">
                {pricePerShuttle.toLocaleString('vi-VN')}đ/quả
              </span>
            </label>
          </div>

          <div className="border-2 border-primary/30 rounded-2xl p-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-primary">TỔNG CỘNG</p>
              <b className="text-3xl text-primary">{money(calc.total)}</b>
              <p className="text-[11px] text-gray-400 mt-0.5">Tự động lưu khi nhập</p>
            </div>
            <img
              src="/payment-qr.png"
              className="w-24 h-24 rounded-lg object-cover"
              alt="Mã QR thanh toán"
            />
          </div>

          <div className="border border-teal-100 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_40px_44px_76px] p-3 bg-teal-50 text-xs font-extrabold text-primary">
              <span>TÊN</span>
              <span>TRẬN</span>
              <span>PHÚT</span>
              <span className="text-right">SỐ TIỀN</span>
            </div>
            {calc.participants.length === 0 ? (
              <p className="p-4 text-center text-gray-400 text-sm">Không có thành viên tham gia.</p>
            ) : (
              calc.participants.map(p => (
                <div
                  key={p.playerId}
                  className="grid grid-cols-[1fr_40px_44px_76px] p-3 border-t border-teal-50 text-sm items-center gap-1"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GenderAvatar gender={genderOf(p)} size={28} />
                    <div className="min-w-0">
                      <b className="block truncate">{p.playerName || 'Người chơi'}</b>
                      <small className="text-gray-400">
                        {p.skillLevel ?? '—'} ·{' '}
                        {p.memberType === 'VÃNG LAI' ? 'Vãng lai' : 'Cố định'}
                      </small>
                    </div>
                  </div>
                  <span className="text-gray-600">{p.matchesPlayed}</span>
                  <span className="text-gray-600">{p.totalMinutesPlayed}</span>
                  <b className="text-primary text-right">{money(calc.owed(p))}</b>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => update(session)}
            className="w-full rounded-xl bg-primary text-white py-3 font-extrabold"
          >
            <Save className="inline mr-2" size={17} />
            LƯU CHI PHÍ
          </button>
        </div>
      </div>
    </div>
  );
}

function CostCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="border border-teal-100 rounded-2xl p-2 text-center">
      <span className="text-primary flex justify-center">{icon}</span>
      <p className="text-[11px] font-bold mt-0.5">{label}</p>
      <b className="text-primary text-sm">{money(value)}</b>
    </div>
  );
}
