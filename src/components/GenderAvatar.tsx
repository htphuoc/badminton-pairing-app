import type { Gender } from '../models/types';

interface GenderAvatarProps {
  gender: Gender;
  size?: number;
  className?: string;
}

/** Sporty male/female sticker avatars (white bg, full silhouette visible). */
export default function GenderAvatar({ gender, size = 40, className = '' }: GenderAvatarProps) {
  const src = gender === 'FEMALE' ? '/avatar-female.png?v=2' : '/avatar-male.png?v=2';
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full overflow-hidden bg-white shadow-sm ring-1 ring-black/5 flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={gender === 'FEMALE' ? 'Avatar nữ' : 'Avatar nam'}
        width={size}
        height={size}
        className="w-full h-full object-contain p-[6%]"
        draggable={false}
      />
    </span>
  );
}
