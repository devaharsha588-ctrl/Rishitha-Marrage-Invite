'use client';

import React from 'react';

interface ScrollIndicatorProps {
  targetId?: string;
  className?: string;
  label?: string;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  targetId = 'story',
  className = '',
  label = 'SCROLL TO BEGIN',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      aria-label={label}
      className={`group inline-flex flex-col items-center gap-2 cursor-pointer transition-opacity duration-300 hover:opacity-100 opacity-80 ${className}`}
    >
      <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#F7F0DF] group-hover:text-[#C89B3C] transition-colors">
        {label}
      </span>
      <div className="relative w-5 h-8 flex justify-center">
        {/* Subtle sliding indicator without bouncy animation */}
        <span className="w-[1px] h-6 bg-gradient-to-b from-[#C89B3C] via-[#C89B3C]/60 to-transparent relative overflow-hidden">
          <span className="scroll-needle absolute top-0 left-0 w-full h-2 bg-[#FFFDF7] rounded-full" />
        </span>
      </div>

      <style jsx>{`
        @keyframes scrollGlide {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(16px);
            opacity: 0;
          }
        }

        .scroll-needle {
          animation: scrollGlide 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-needle {
            animation: none;
            opacity: 0.8;
          }
        }
      `}</style>
    </a>
  );
};

export default ScrollIndicator;
