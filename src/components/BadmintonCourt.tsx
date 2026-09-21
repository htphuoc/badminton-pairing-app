import { useEffect, useState } from 'react';
import type { Gender } from '../models/types';
import GenderAvatar from './GenderAvatar';

export interface CourtPlayer {
  name: string;
  gender: Gender;
}

interface BadmintonCourtProps {
  topLeft: CourtPlayer;
  bottomLeft: CourtPlayer;
  topRight: CourtPlayer;
  bottomRight: CourtPlayer;
  startTime?: string;
  onEndMatch: () => void;
}

/** Doubles court, landscape. 1 unit = 1/40 m. Net is the vertical dashed line. */
const M = 40;
const OX = 10;
const OY = 10;
const CW = 13.4 * M;
const CH = 6.1 * M;
const VB_W = OX * 2 + CW;
const VB_H = OY * 2 + CH;

const x0 = OX;
const y0 = OY;
const x1 = OX + CW;
const y1 = OY + CH;
const netX = OX + CW / 2;
const alley = ((6.1 - 5.18) / 2) * M;
const ySinglesTop = y0 + alley;
const ySinglesBot = y1 - alley;
const yMid = y0 + CH / 2;
const xShortL = netX - 1.98 * M;
const xShortR = netX + 1.98 * M;
const xLongL = x0 + 0.76 * M;
const xLongR = x1 - 0.76 * M;

/** Open green inside each service box — no court line crosses these rectangles. */
const SERVICE_SLOTS = [
  { key: 'tl', x: xLongL, y: ySinglesTop, w: xShortL - xLongL, h: yMid - ySinglesTop },
  { key: 'bl', x: xLongL, y: yMid, w: xShortL - xLongL, h: ySinglesBot - yMid },
  { key: 'tr', x: xShortR, y: ySinglesTop, w: xLongR - xShortR, h: yMid - ySinglesTop },
  { key: 'br', x: xShortR, y: yMid, w: xLongR - xShortR, h: ySinglesBot - yMid },
] as const;

function useElapsedMinutes(startTime?: string) {
  const [mins, setMins] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const calc = () => {
      const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000);
      setMins(Math.max(0, elapsed));
    };
    calc();
    const id = setInterval(calc, 30000);
    return () => clearInterval(id);
  }, [startTime]);
  return mins;
}

function PlayerInBox({ player, box }: { player: CourtPlayer; box: (typeof SERVICE_SLOTS)[number] }) {
  return (
    <div
      className="absolute flex flex-col items-center justify-center gap-0.5 px-1 overflow-hidden pointer-events-none"
      style={{
        left: `${(box.x / VB_W) * 100}%`,
        top: `${(box.y / VB_H) * 100}%`,
        width: `${(box.w / VB_W) * 100}%`,
        height: `${(box.h / VB_H) * 100}%`,
      }}
    >
      <GenderAvatar gender={player.gender} size={30} />
      <span
        className="max-w-full truncate text-center text-[11px] font-extrabold leading-tight text-white"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
      >
        {player.name}
      </span>
    </div>
  );
}

/**
 * Sân nằm ngang, chỉ đường trắng mảnh trên nền xanh.
 * Avatar + tên nằm giữa 4 ô giao cầu, không đè đường kẻ.
 */
export default function BadmintonCourt({
  topLeft,
  bottomLeft,
  topRight,
  bottomRight,
  startTime,
  onEndMatch,
}: BadmintonCourtProps) {
  const mins = useElapsedMinutes(startTime);
  const startLabel = startTime
    ? new Date(startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '';
  const players = [topLeft, bottomLeft, topRight, bottomRight];

  return (
    <div className="w-full overflow-hidden" style={{ background: '#2f9a46' }}>
      <div className="relative">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-auto"
          aria-label="Sân cầu lông"
        >
          <rect width={VB_W} height={VB_H} fill="#2f9a46" />
          <g stroke="white" strokeWidth="2" fill="none" strokeLinecap="square">
            <rect x={x0} y={y0} width={CW} height={CH} />
            <line x1={x0} y1={ySinglesTop} x2={x1} y2={ySinglesTop} />
            <line x1={x0} y1={ySinglesBot} x2={x1} y2={ySinglesBot} />
            <line x1={xShortL} y1={y0} x2={xShortL} y2={y1} />
            <line x1={xShortR} y1={y0} x2={xShortR} y2={y1} />
            <line x1={xLongL} y1={y0} x2={xLongL} y2={y1} />
            <line x1={xLongR} y1={y0} x2={xLongR} y2={y1} />
            <line x1={x0} y1={yMid} x2={xShortL} y2={yMid} />
            <line x1={xShortR} y1={yMid} x2={x1} y2={yMid} />
          </g>
          <line
            x1={netX}
            y1={y0}
            x2={netX}
            y2={y1}
            stroke="white"
            strokeWidth="2.25"
            strokeDasharray="7 6"
          />
        </svg>
        {SERVICE_SLOTS.map((box, i) => (
          <PlayerInBox key={box.key} box={box} player={players[i]} />
        ))}
      </div>

      <div style={{ background: '#1b5e2a' }} className="flex items-center justify-between px-3 pb-1 pt-1.5">
        <span style={{ color: '#bbf7d0', fontSize: '0.75rem', fontWeight: 700 }}>⏱ {mins} phút</span>
        {startLabel && <span style={{ color: '#86efac', fontSize: '0.7rem' }}>🕐 {startLabel}</span>}
      </div>

      <div className="px-3 pb-2.5 pt-1" style={{ background: '#1b5e2a' }}>
        <button
          onClick={onEndMatch}
          style={{
            display: 'block',
            width: '100%',
            background: '#ef4444',
            color: 'white',
            fontWeight: 800,
            fontSize: '0.82rem',
            padding: '10px 0',
            borderRadius: '10px',
            border: 'none',
            minHeight: '44px',
            letterSpacing: '0.03em',
          }}
        >
          🔚 KẾT THÚC TRẬN
        </button>
      </div>
    </div>
  );
}
