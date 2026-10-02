import React from 'react';
import Image from 'next/image';

interface GoldDividerProps {
  variant?: 'temple' | 'floral' | 'line';
  className?: string;
  maxWidth?: number;
}

export const GoldDivider: React.FC<GoldDividerProps> = ({
  variant = 'temple',
  className = '',
  maxWidth = 320,
}) => {
  if (variant === 'line') {
    return (
      <div
        role="separator"
        aria-hidden="true"
        className={`flex items-center justify-center gap-3 my-6 ${className}`}
      >
        <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#C89B3C]/60" />
        <span className="w-1.5 h-1.5 rotate-45 border border-[#C89B3C] bg-[#C89B3C]/20" />
        <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#C89B3C]/60" />
      </div>
    );
  }

  const assetSrc =
    variant === 'floral'
      ? '/decorations/floral-divider.svg'
      : '/decorations/temple-divider.svg';

  return (
    <div
      role="separator"
      aria-hidden="true"
      className={`relative mx-auto flex justify-center text-[#C89B3C] opacity-80 ${className}`}
      style={{ maxWidth: `${maxWidth}px`, width: '100%' }}
    >
      <Image
        src={assetSrc}
        alt=""
        width={maxWidth}
        height={30}
        style={{ width: '100%', height: 'auto' }}
        className="object-contain filter"
        priority={false}
      />
    </div>
  );
};

export default GoldDivider;
