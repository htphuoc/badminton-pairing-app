import { useEffect, useMemo, useState } from 'react';
import { Check, Clock3, Play, Plus, Shuffle, Trash2, UserPlus, X } from 'lucide-react';
import { useSession } from '../hooks/useSession';
import { usePlayers } from '../hooks/usePlayers';
import BadmintonCourt from '../components/BadmintonCourt';
import GenderAvatar from '../components/GenderAvatar';
import { getDefaultCourtsForWeekday, StorageService } from '../storage/storage';
import { careerMatchCount } from '../utils/costCalc';
import { reshuffleSuggestion, type MatchSuggestion } from '../algorithms/matchingEngine';
import type { Gender, MemberType, SkillLevel } from '../models/types';

const label = (m: number) =>
  `${Math.floor(m / 60)}h ${m % 60 > 0 ? (m % 60) + 'm' : ''}`.trim() || '0m';

const skillLabel = (s: SkillLevel | string) => {
  if (s === 'Y') return 'Yếu';
  if (s === 'TBY') return 'TB Yếu';
  if (s === 'TB') return 'Trung Bình';
  if (s === 'K') return 'Khá';
  return s;
};

function MatchTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    'ĐÔI NAM': 'bg-blue-600 text-white',
    'ĐÔI NỮ': 'bg-pink-600 text-white',
    'ĐÔI NAM NỮ': 'bg-amber-500 text-white',
    'TỰ DO': 'bg-emerald-600 text-white',
  };
  return (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${colors[type] ?? 'bg-gray-400 text-white'}`}>
      {type}
    </span>
  );
}

function memberLabel(t?: MemberType) {
  return t === 'VÃNG LAI' ? 'Vãng lai' : 'Cố định';
}

export default function SessionPage() {
  const {
    currentSession,
    createSession,
    endSession,
    previewAutoMatch,
    confirmAutoMatch,
    startManualMatch,
    endMatch,
    addCourt,
    addPlayersToSession,
    removePlayerFromSession,
    returnCourt,
  } = useSession();
  const { players } = usePlayers();

  const [courts, setCourts] = useState(() => getDefaultCourtsForWeekday(new Date().getDay()));
  const [mins, setMins] = useState(120);
  const [ids, setIds] = useState<string[]>([]);
  const [modal, setModal] = useState<{ court: string } | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [addingMembers, setAddingMembers] = useState(false);
  const [memberPick, setMemberPick] = useState<string[]>([]);
  const [newCourt, setNewCourt] = useState(4);
  const [addMins, setAddMins] = useState(60);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [pendingSessionType, setPendingSessionType] = useState<'CỐ ĐỊNH' | 'VÃNG LAI' | null>(null);
  const [autoPreview, setAutoPreview] = useState<{
    courtId: string;
    suggestion: MatchSuggestion;
    excluded: string[][];
  } | null>(null);

  const openAutoPreview = (courtId?: string) => {
    const result = previewAutoMatch(courtId);
    if (!result) return;
    setAutoPreview({ courtId: result.courtId, suggestion: result.suggestion, excluded: [] });
  };

  const reshuffleAutoPreview = () => {
    if (!autoPreview) return;
    const excluded = [...autoPreview.excluded, autoPreview.suggestion.players];
    const next = previewAutoMatch(autoPreview.courtId, excluded);
    if (next) {
      setAutoPreview({ courtId: next.courtId, suggestion: next.suggestion, excluded });
      return;
    }
    // Hết tổ hợp khác → đảo đội trên cùng 4 người
    setAutoPreview({
      ...autoPreview,
      suggestion: reshuffleSuggestion(autoPreview.suggestion),
      excluded,
    });
  };

  const allSessions = useMemo(() => StorageService.getSessions(), [currentSession, players]);

  useEffect(() => {
    if (players.length && !ids.length) {
      setIds(players.filter(p => p.memberType === 'CỐ ĐỊNH').map(p => p.id));
    }
  }, [players]);

  useEffect(() => {
    if (currentSession) return;
    setCourts(getDefaultCourtsForWeekday(new Date().getDay()));
  }, [currentSession]);

  const toggle = (id: string) =>
    setIds(x => (x.includes(id) ? x.filter(i => i !== id) : [...x, id]));

  const name = (id: string) =>
    players.find(p => p.id === id)?.name ||
    currentSession?.players.find(p => p.playerId === id)?.playerName ||
    'Người chơi';

  const resolvePlayer = (playerId: string) => {
    const live = players.find(p => p.id === playerId);
    const snap = currentSession?.players.find(p => p.playerId === playerId);
    return {
      gender: (live?.gender ?? snap?.gender ?? 'MALE') as Gender,
      skillLevel: (live?.skillLevel ?? snap?.skillLevel ?? 'TB') as SkillLevel,
      memberType: (live?.memberType ?? snap?.memberType ?? 'CỐ ĐỊNH') as MemberType,
      name: live?.name ?? snap?.playerName ?? 'Người chơi',
    };
  };

  /* ── CHUẨN BỊ VÀO SÂN ── */
  if (!currentSession) {
    const defaultCourts = getDefaultCourtsForWeekday(new Date().getDay());
    return (
      <div className="pb-24 space-y-4">
        <h2 className="text-4xl font-black uppercase text-center text-slate-800 tracking-tight">CHUẨN BỊ VÀO SÂN</h2>

        <section className="bg-white rounded-2xl p-4 space-y-4 shadow-sm">
          <div className="flex justify-between font-bold text-gray-700">
            <span className="uppercase text-xs tracking-wide text-gray-500">
              Thời gian
            </span>
            <span className="flex items-center text-2xl font-bold text-slate-800">
              <Clock3 className="inline mr-2 text-primary" size={24} />
              {label(mins)}
            </span>
          </div>
          <input
            className="w-full accent-primary"
            type="range"
            min="15"
            max="360"
            step="15"
            value={mins}
            onChange={e => setMins(+e.target.value)}
          />
          <div className="flex justify-between text-xs text-gray-400 font-medium px-1">
            <span>15p</span>
            <span>3h</span>
            <span>6h</span>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
          <b className="uppercase text-xs tracking-wide text-gray-500 block mb-2">
            Chọn sân
          </b>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 16 }, (_, i) => i + 1).map(c => {
              const isDefault = defaultCourts.includes(c);
              const isSelected = courts.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => {
                    if (isDefault) return; // sân đăng ký cố định không thể bỏ chọn
                    setCourts(x => (x.includes(c) ? x.filter(i => i !== c) : [...x, c]));
                  }}
                  className={`rounded-xl py-3 text-2xl font-black transition-colors border ${
                    isSelected
                      ? 'bg-primary border-primary text-white'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-100'
                  } ${isDefault ? 'cursor-not-allowed opacity-90' : ''}`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl overflow-hidden shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <b className="uppercase text-xs tracking-wide text-gray-500">
              THÀNH VIÊN THAM GIA ({players.length})
            </b>
            <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
              <button
                onClick={() =>
                  setIds(players.filter(p => p.memberType === 'CỐ ĐỊNH').map(p => p.id))
                }
                className="text-xs px-3 py-1.5 bg-primary text-white font-bold rounded-md shadow-sm"
              >
                CỐ ĐỊNH
              </button>
              <button onClick={() => setIds([])} className="text-xs px-3 py-1.5 text-gray-500 font-bold hover:bg-gray-200 rounded-md transition-colors">
                BỎ CHỌN
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[...players]
              .sort((a, b) => (a.memberType === 'CỐ ĐỊNH' ? -1 : 1) - (b.memberType === 'CỐ ĐỊNH' ? -1 : 1))
              .map(p => {
              const selected = ids.includes(p.id);
              const matches = careerMatchCount(p.id, allSessions);
              return (
                <button
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className={`relative text-left rounded-xl p-2 flex gap-2 items-center transition-all ${
                    selected
                      ? 'border-[5px] border-primary/50 bg-teal-50/30'
                      : 'border-[5px] border-transparent bg-white shadow-[0_0_0_1px_rgba(243,244,246,1)] hover:shadow-[0_0_0_1px_rgba(229,231,235,1)]'
                  }`}
                >
                  <div className="relative">
                    <GenderAvatar gender={p.gender} size={36} />
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-white shadow-sm ring-1 ring-black/5 ${p.gender === 'FEMALE' ? 'text-pink-500' : 'text-blue-500'}`}>
                       {p.gender === 'FEMALE' ? '♀' : '♂'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <b className="text-sm block truncate text-slate-800 leading-tight mb-0.5">{p.name}</b>
                    <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        {skillLabel(p.skillLevel)}
                        <span className={`w-1.5 h-1.5 rounded-full ${p.skillLevel === 'Y' ? 'bg-pink-400' : p.skillLevel === 'TBY' ? 'bg-purple-400' : p.skillLevel === 'TB' ? 'bg-blue-400' : p.skillLevel === 'K' ? 'bg-teal-400' : 'bg-emerald-400'}`}></span>
                        {matches}C
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0 text-white ${p.memberType === 'CỐ ĐỊNH' ? 'bg-orange-400' : 'bg-blue-500'}`}>
                        {memberLabel(p.memberType)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 px-1">
                    {selected ? (
                      <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-200"></div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <button
            disabled={ids.length < 4 || !courts.length}
            onClick={() => setPendingSessionType('CỐ ĐỊNH')}
            className={`w-full rounded-2xl py-4 font-extrabold flex items-center justify-center text-sm transition-all
              ${pendingSessionType === 'CỐ ĐỊNH'
                ? 'bg-primary text-white ring-4 ring-primary/40 shadow-lg scale-[1.02]'
                : 'bg-primary text-white disabled:bg-gray-300 opacity-80'}`}
          >
            <Play className="inline mr-1" size={18} />
            ĐÁNH CỐ ĐỊNH
          </button>
          <button
            disabled={ids.length < 4 || !courts.length}
            onClick={() => setPendingSessionType('VÃNG LAI')}
            className={`w-full rounded-2xl py-4 font-extrabold flex items-center justify-center text-sm transition-all
              ${pendingSessionType === 'VÃNG LAI'
                ? 'border-2 border-emerald-600 text-emerald-600 ring-4 ring-emerald-600/30 shadow-lg scale-[1.02] bg-emerald-50'
                : 'border-2 border-emerald-600 text-emerald-600 bg-white disabled:border-gray-300 disabled:text-gray-400 opacity-80'}`}
          >
            <Play className="inline mr-1" size={18} />
            ĐÁNH VÃNG LAI
          </button>
        </div>

        {/* Modal xác nhận tạo buổi */}
        {pendingSessionType && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="font-extrabold uppercase text-base">Xác nhận tạo buổi chơi</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Loại buổi:{' '}
                  <span className={`font-black ${pendingSessionType === 'VÃNG LAI' ? 'text-emerald-600' : 'text-primary'}`}>
                    {pendingSessionType}
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-extrabold text-primary uppercase tracking-wide mb-1.5">
                    Sân đã chọn ({courts.length} sân)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[...courts].sort((a, b) => a - b).map(c => (
                      <span key={c} className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        Sân {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-extrabold text-primary uppercase tracking-wide mb-1.5">
                    Thành viên tham gia ({ids.length} người)
                  </p>
                  <div className="max-h-40 overflow-y-auto grid grid-cols-2 gap-1">
                    {ids.map(id => {
                      const p = players.find(pl => pl.id === id);
                      if (!p) return null;
                      return (
                        <div key={id} className="flex items-center gap-1.5 bg-teal-50 rounded-lg px-2 py-1 min-w-0">
                          <GenderAvatar gender={p.gender} size={24} />
                          <span className="text-xs font-bold truncate">{p.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setPendingSessionType(null)}
                  className="border border-gray-300 rounded-xl py-3 font-bold text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    createSession(courts, mins, ids, pendingSessionType);
                    setPendingSessionType(null);
                  }}
                  className={`rounded-xl py-3 font-extrabold text-sm text-white
                    ${pendingSessionType === 'VÃNG LAI' ? 'bg-emerald-600' : 'bg-primary'}`}
                >
                  BẮT ĐẦU
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── BUỔI ĐANG CHƠI ── */
  const configured = currentSession.courtNumbers || [];
  const initialCourts = currentSession.initialCourtNumbers ?? configured.filter(c => {
    const meta = currentSession.courtMeta?.[String(c)];
    return !meta?.isSupplemental;
  });
  const waiting = currentSession.players.filter(p => p.attendance === 'WAITING');
  const playing = currentSession.matches.filter(m => m.status === 'PLAYING');
  const joinedIds = new Set(
    currentSession.players.filter(p => p.attendance !== 'ABSENT').map(p => p.playerId),
  );
  const outsidePlayers = players.filter(p => !joinedIds.has(p.id));

  const canReturnCourt = (courtNum: number, hasActiveMatch: boolean) => {
    const meta = currentSession.courtMeta?.[String(courtNum)];
    const isSupplemental = meta?.isSupplemental === true || !initialCourts.includes(courtNum);
    // Chỉ sân bổ sung, chưa trả, và không còn trận đang chơi trên sân đó
    return isSupplemental && !meta?.returnedAt && !hasActiveMatch;
  };

  return (
    <div className="pb-24 space-y-4">
      <header className="bg-primary text-white rounded-2xl p-4 flex justify-between items-start">
        <div>
          <small className="text-teal-100 font-bold tracking-wide uppercase">
            ĐANG CHƠI · {currentSession.sessionType === 'VÃNG LAI' ? 'VÃNG LAI' : 'CỐ ĐỊNH'}
          </small>
          <div className="flex items-baseline gap-2 flex-wrap">
            <b className="block text-lg">
              {new Date(currentSession.date).toLocaleDateString('vi-VN')}
            </b>
            <small className="text-teal-100 font-semibold">
              {configured.length} sân · {label(currentSession.plannedDurationMinutes || 120)}
            </small>
          </div>
        </div>
        <button
          onClick={() => setConfirmEnd(true)}
          className="border border-white/60 rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap"
        >
          KẾT THÚC BUỔI
        </button>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            setMemberPick([]);
            setAddingMembers(true);
          }}
          className="border border-primary text-primary rounded-xl py-3 px-1 font-extrabold text-[12px] leading-tight whitespace-nowrap"
        >
          <UserPlus className="inline mr-1" size={17} />
          THÊM THÀNH VIÊN
        </button>
        <button
          onClick={() => {
            setNewCourt(
              Array.from({ length: 16 }, (_, i) => i + 1).find(c => !configured.includes(c)) || 1,
            );
            setAddMins(60);
            setAdding(true);
          }}
          className="border border-primary text-primary rounded-xl py-3 px-1 font-extrabold text-[12px] leading-tight whitespace-nowrap"
        >
          <Plus className="inline mr-1" size={17} />
          THÊM SÂN
        </button>
      </div>

      {configured.map(c => {
        const activeMatch = playing.find(x => x.courtId === String(c));
        const rate =
          currentSession.courtFees?.[c] ||
          currentSession.costs.courtFeeFixedPerHour ||
          currentSession.costs.courtFeePerHour;
        const courtFee = rate.toLocaleString('vi-VN');
        const returnEnabled = canReturnCourt(c, !!activeMatch);
        const returned = !!currentSession.courtMeta?.[String(c)]?.returnedAt;

        return (
          <article
            key={c}
            className="bg-white rounded-2xl border border-teal-100 overflow-hidden shadow-sm"
          >
            <div className="px-4 py-2.5 flex justify-between items-center border-b border-teal-50">
              <b className="text-primary font-extrabold tracking-wide">SÂN {c}</b>
              <div className="flex items-center gap-2">
                {activeMatch && <MatchTypeBadge type={activeMatch.type} />}
                <small className="text-gray-400 text-xs">{courtFee}đ/60p</small>
              </div>
            </div>

            {activeMatch ? (
              <>
                <BadmintonCourt
                  topLeft={resolvePlayer(activeMatch.team1[0])}
                  bottomLeft={resolvePlayer(activeMatch.team1[1])}
                  topRight={resolvePlayer(activeMatch.team2[0])}
                  bottomRight={resolvePlayer(activeMatch.team2[1])}
                  startTime={activeMatch.startTime}
                  onEndMatch={() => endMatch(activeMatch.id)}
                />
                <div className="p-3">
                  <button
                    disabled
                    className="w-full rounded-xl py-2.5 text-xs font-extrabold tracking-wide bg-gray-200 text-gray-400 cursor-not-allowed"
                  >
                    TRẢ SÂN
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 p-3">
                <button
                  onClick={() => openAutoPreview(String(c))}
                  className="bg-primary text-white rounded-xl py-2.5 px-1 text-[11px] font-extrabold leading-tight disabled:opacity-50"
                  disabled={returned}
                >
                  <Shuffle className="inline mb-0.5" size={14} />
                  <span className="block">XẾP TỰ ĐỘNG</span>
                </button>
                <button
                  onClick={() => {
                    setPicked([]);
                    setModal({ court: String(c) });
                  }}
                  className="border border-primary text-primary rounded-xl py-2.5 px-1 text-[11px] font-extrabold leading-tight disabled:opacity-50"
                  disabled={returned}
                >
                  THỦ CÔNG
                </button>
                <button
                  disabled={!returnEnabled}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Trả Sân ${c}? Tiền sân sẽ tính theo thời gian thực tế (làm tròn lên 30 phút).`,
                      )
                    ) {
                      returnCourt(c);
                    }
                  }}
                  className={`rounded-xl py-2.5 px-1 text-[11px] font-extrabold tracking-wide leading-tight ${
                    returnEnabled
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {returned ? 'ĐÃ TRẢ' : 'TRẢ SÂN'}
                </button>
              </div>
            )}
          </article>
        );
      })}

      {/* Waiting list */}
      <section className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 border-b border-teal-50 flex justify-between items-center">
          <b className="uppercase tracking-wide text-sm">ĐANG CHỜ</b>
          <span className="bg-teal-100 text-primary text-xs font-black px-2 py-0.5 rounded-full">
            {waiting.length} người
          </span>
        </div>

        {waiting.length === 0 ? (
          <p className="p-4 text-center text-gray-400 text-sm">Không có người đang chờ.</p>
        ) : (
          <div className="divide-y divide-teal-50">
            {waiting.map(sp => {
              const info = resolvePlayer(sp.playerId);
              return (
                <div key={sp.playerId} className="px-3 py-2.5 flex items-center gap-2 min-w-0">
                  <GenderAvatar gender={info.gender} size={36} />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-sm truncate block">{sp.playerName}</span>
                    <span className="text-[11px] text-gray-500 font-bold">
                      {skillLabel(info.skillLevel)} · {sp.matchesPlayed}C · {memberLabel(info.memberType)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`Gỡ "${sp.playerName}" khỏi danh sách chờ (vắng mặt)?`)) {
                        removePlayerFromSession(sp.playerId);
                      }
                    }}
                    className="flex-shrink-0 w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                    title="Gỡ khỏi danh sách"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Thêm thành viên chưa có trong buổi */}
      {addingMembers && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-end sm:place-items-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col">
            <div className="flex justify-between items-start p-4 border-b border-teal-50">
              <div>
                <h3 className="font-extrabold uppercase">THÊM THÀNH VIÊN</h3>
                <p className="text-xs text-gray-500 mt-0.5">Chọn người chưa có trong buổi</p>
              </div>
              <button onClick={() => setAddingMembers(false)} aria-label="Đóng">
                <X size={20} />
              </button>
            </div>
            {outsidePlayers.length === 0 ? (
              <p className="p-6 text-center text-gray-400 text-sm">
                Tất cả thành viên đã có trong buổi.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-3 overflow-y-auto">
                {[...outsidePlayers]
                  .sort((a, b) => (a.memberType === 'CỐ ĐỊNH' ? -1 : 1) - (b.memberType === 'CỐ ĐỊNH' ? -1 : 1))
                  .map(p => {
                  const selected = memberPick.includes(p.id);
                  const matches = careerMatchCount(p.id, allSessions);
                  return (
                    <button
                      key={p.id}
                      onClick={() =>
                        setMemberPick(x =>
                          x.includes(p.id) ? x.filter(i => i !== p.id) : [...x, p.id],
                        )
                      }
                      className={`relative text-left rounded-xl p-2 flex gap-2 items-start transition-all ${
                        selected
                          ? 'border-4 border-primary bg-teal-50/70 shadow-sm'
                          : 'border border-teal-100 bg-white'
                      }`}
                    >
                      {selected && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary text-white grid place-items-center">
                          <Check size={12} />
                        </span>
                      )}
                      <GenderAvatar gender={p.gender} size={36} />
                      <div className="min-w-0 pr-4">
                        <b className="text-sm block truncate">{p.name}</b>
                        <span className="text-[11px] text-gray-500 font-bold">
                          {skillLabel(p.skillLevel)} · {matches}C
                        </span>
                        <span className="block text-[10px] text-amber-700 font-bold">
                          {memberLabel(p.memberType)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 p-3 border-t border-teal-50">
              <button
                onClick={() => setAddingMembers(false)}
                className="border border-gray-300 rounded-xl py-3 font-bold"
              >
                Huỷ
              </button>
              <button
                disabled={!memberPick.length}
                onClick={() => {
                  addPlayersToSession(memberPick);
                  setAddingMembers(false);
                }}
                className="bg-primary disabled:bg-gray-300 text-white rounded-xl py-3 font-bold"
              >
                THÊM ({memberPick.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm sân */}
      {adding && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-3">
            <h3 className="font-extrabold uppercase">THÊM SÂN</h3>
            <label className="block text-sm font-bold">
              Sân
              <select
                value={newCourt}
                onChange={e => setNewCourt(+e.target.value)}
                className="w-full mt-1 border rounded-xl p-3"
              >
                {Array.from({ length: 16 }, (_, i) => i + 1)
                  .filter(c => !configured.includes(c))
                  .map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </label>
            <div>
              <div className="flex justify-between text-sm font-bold">
                <span>Thời gian bổ sung:</span>
                <b className="text-primary">{label(addMins)}</b>
              </div>
              <input
                className="w-full accent-primary mt-2"
                type="range"
                min="15"
                max="360"
                step="15"
                value={addMins}
                onChange={e => setAddMins(+e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setAdding(false)}
                className="border border-gray-300 rounded-xl py-3 font-bold"
              >
                Huỷ
              </button>
              <button
                onClick={() => {
                  addCourt(newCourt, addMins);
                  setAdding(false);
                }}
                className="bg-primary text-white rounded-xl py-3 font-bold"
              >
                THÊM SÂN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xếp thủ công */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-end sm:place-items-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-extrabold">SÂN {modal.court} · XẾP THỦ CÔNG</h3>
              <button onClick={() => setModal(null)} aria-label="Đóng">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-2">
              Chọn đúng 4 người · 2 người đầu = Đội A · Loại trận: TỰ DO
            </p>
            <div className="max-h-72 overflow-y-auto divide-y divide-teal-50">
              {waiting.map(sp => {
                const info = resolvePlayer(sp.playerId);
                const isSel = picked.includes(sp.playerId);
                return (
                  <button
                    key={sp.playerId}
                    onClick={() =>
                      setPicked(x =>
                        x.includes(sp.playerId)
                          ? x.filter(i => i !== sp.playerId)
                          : x.length < 4
                            ? [...x, sp.playerId]
                            : x,
                      )
                    }
                    className={`w-full p-3 text-left flex items-center justify-between gap-2 ${
                      isSel ? 'bg-teal-50' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <GenderAvatar gender={info.gender} size={32} />
                      <span className="min-w-0">
                        <b className="block truncate">{sp.playerName}</b>
                        <small className="text-gray-400">
                          {skillLabel(info.skillLevel)} · {sp.matchesPlayed}C · {memberLabel(info.memberType)}
                        </small>
                      </span>
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full border grid place-items-center flex-shrink-0 ${
                        isSel ? 'bg-primary text-white border-primary' : 'border-gray-300'
                      }`}
                    >
                      {isSel && <Check size={13} />}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-center mt-2 text-gray-400">
              Đã chọn: {picked.length}/4
              {picked.length > 0 && (
                <>
                  {' '}
                  · Đội A: {picked.slice(0, 2).map(name).join(', ')}
                  {picked.length > 2 && <> · Đội B: {picked.slice(2).map(name).join(', ')}</>}
                </>
              )}
            </p>

            <button
              disabled={picked.length !== 4}
              onClick={() => {
                startManualMatch(modal.court, picked);
                setModal(null);
              }}
              className="mt-4 w-full bg-primary disabled:bg-gray-300 text-white rounded-xl py-3 font-bold"
            >
              VÀO SÂN
            </button>
          </div>
        </div>
      )}

      {/* Preview xếp tự động */}
      {autoPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-end sm:place-items-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold uppercase">Xem trước xếp sân</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sân {autoPreview.courtId} · {autoPreview.suggestion.type}
                </p>
              </div>
              <button onClick={() => setAutoPreview(null)} aria-label="Đóng">
                <X size={20} />
              </button>
            </div>

            <div className="flex justify-center">
              <MatchTypeBadge type={autoPreview.suggestion.type} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-teal-100 p-3 space-y-2">
                <p className="text-[11px] font-extrabold text-primary tracking-wide">ĐỘI A</p>
                {autoPreview.suggestion.team1.map(id => {
                  const info = resolvePlayer(id);
                  return (
                    <div key={id} className="flex items-center gap-2 min-w-0">
                      <GenderAvatar gender={info.gender} size={32} />
                      <div className="min-w-0">
                        <b className="block text-sm truncate">{info.name}</b>
                        <span className="text-[11px] text-gray-500 font-bold">{skillLabel(info.skillLevel)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-2xl border border-teal-100 p-3 space-y-2">
                <p className="text-[11px] font-extrabold text-primary tracking-wide">ĐỘI B</p>
                {autoPreview.suggestion.team2.map(id => {
                  const info = resolvePlayer(id);
                  return (
                    <div key={id} className="flex items-center gap-2 min-w-0">
                      <GenderAvatar gender={info.gender} size={32} />
                      <div className="min-w-0">
                        <b className="block text-sm truncate">{info.name}</b>
                        <span className="text-[11px] text-gray-500 font-bold">{skillLabel(info.skillLevel)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setAutoPreview(null)}
                className="border border-gray-300 rounded-xl py-3 text-xs font-extrabold"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={reshuffleAutoPreview}
                className="border border-primary text-primary rounded-xl py-3 text-xs font-extrabold"
              >
                Xếp Lại
              </button>
              <button
                onClick={() => {
                  confirmAutoMatch(autoPreview.courtId, autoPreview.suggestion);
                  setAutoPreview(null);
                }}
                className="bg-primary text-white rounded-xl py-3 text-xs font-extrabold"
              >
                Vào Sân
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmEnd && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="font-extrabold uppercase">Kết thúc buổi</h3>
            <p className="text-sm text-gray-600">
              Bạn có chắc chắn muốn kết thúc buổi chơi này không?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmEnd(false)}
                className="border border-gray-300 rounded-xl py-3 font-bold"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setConfirmEnd(false);
                  endSession();
                }}
                className="bg-primary text-white rounded-xl py-3 font-bold"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
