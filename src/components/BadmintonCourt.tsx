import { useEffect, useState } from 'react';

interface BadmintonCourtProps {
  playerTopLeft: string;
  playerBottomLeft: string;
  playerTopRight: string;
  playerBottomRight: string;
  matchType: string;
  startTime?: string;
  onEndMatch: () => void;
}

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

function matchTypeBadgeColor(type: string) {
  if (type === 'ĐÔI NAM') return '#2563eb';
  if (type === 'ĐÔI NỮ') return '#db2777';
  return '#d97706';
}

function NameBadge({ name }: { name: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: '2px',
      }}
    >
      <div
        style={{
          fontSize: '0.78rem',
          fontWeight: 800,
          color: '#fff',
          background: 'rgba(15, 23, 42, 0.72)',
          borderRadius: '8px',
          padding: '4px 8px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
          lineHeight: 1.25,
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
        }}
      >
        {name}
      </div>
    </div>
  );
}

/**
 * Sân nằm ngang: lưới dọc giữa.
 * 4 ô xanh lớn (2 đội × trước/sau lưới) — tên cầu thủ đặt giữa từng ô.
 */
export default function BadmintonCourt({
  playerTopLeft,
  playerBottomLeft,
  playerTopRight,
  playerBottomRight,
  matchType,
  startTime,
  onEndMatch,
}: BadmintonCourtProps) {
  const mins = useElapsedMinutes(startTime);
  const startLabel = startTime
    ? new Date(startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '';
  const badgeColor = matchTypeBadgeColor(matchType);

  return (
    <div className="relative w-full overflow-hidden" style={{ background: '#2f8f45' }}>
      <svg
        viewBox="0 0 220 120"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', width: '100%', height: 'auto' }}
        aria-label="Sân cầu lông"
      >
        <rect width="220" height="120" fill="#2f8f45" />

        {/* 4 ô xanh lớn (nhẹ khác tông để đọc rõ) */}
        <rect x="10" y="6" width="98" height="52" fill="#348f48" />
        <rect x="10" y="62" width="98" height="52" fill="#2b7f3f" />
        <rect x="112" y="6" width="98" height="52" fill="#348f48" />
        <rect x="112" y="62" width="98" height="52" fill="#2b7f3f" />

        <g stroke="white" strokeWidth="1.6" fill="none">
          {/* Biên ngoài */}
          <rect x="10" y="6" width="200" height="108" />
          {/* Biên đơn (trong) */}
          <line x1="10" y1="16" x2="210" y2="16" />
          <line x1="10" y1="104" x2="210" y2="104" />
          {/* Short service line */}
          <line x1="10" y1="34" x2="210" y2="34" />
          <line x1="10" y1="86" x2="210" y2="86" />
          {/* Center line trong vùng giao cầu */}
          <line x1="110" y1="34" x2="110" y2="86" />
        </g>

        {/* Lưới */}
        <line x1="110" y1="0" x2="110" y2="120" stroke="#0f172a" strokeWidth="3.5" />

        {/* Tên ở giữa 4 ô xanh lớn */}
        <foreignObject x="14" y="14" width="90" height="40">
          <NameBadge name={playerTopLeft} />
        </foreignObject>
        <foreignObject x="14" y="70" width="90" height="40">
          <NameBadge name={playerBottomLeft} />
        </foreignObject>
        <foreignObject x="116" y="14" width="90" height="40">
          <NameBadge name={playerTopRight} />
        </foreignObject>
        <foreignObject x="116" y="70" width="90" height="40">
          <NameBadge name={playerBottomRight} />
        </foreignObject>

        {/* Badge loại trận giữa lưới */}
        <rect x="78" y="52" width="64" height="16" rx="8" fill={badgeColor} opacity="0.95" />
        <text
          x="110"
          y="63.5"
          textAnchor="middle"
          fill="white"
          fontSize="7"
          fontWeight="900"
          letterSpacing="0.4"
        >
          {matchType}
        </text>
      </svg>

      <div style={{ background: '#1b5e2a' }} className="px-3 pt-1.5 pb-1 flex items-center justify-between">
        <span style={{ color: '#bbf7d0', fontSize: '0.75rem', fontWeight: 700 }}>
          ⏱ {mins} phút
        </span>
        {startLabel && (
          <span style={{ color: '#86efac', fontSize: '0.7rem' }}>🕐 {startLabel}</span>
        )}
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
