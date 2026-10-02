'use client';

import React, { useEffect, useState } from 'react';
import { CompositorState } from './SceneManager';

interface MotionDebugHUDProps {
  stateRef: React.MutableRefObject<CompositorState | null>;
}

export const MotionDebugHUD: React.FC<MotionDebugHUDProps> = ({ stateRef }) => {
  const [isDebugEnabled, setIsDebugEnabled] = useState(false);
  const [hudData, setHudData] = useState<CompositorState | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV === 'production') return;
    const params = new URLSearchParams(window.location.search);
    const enabled = params.get('motionDebug') === '1';
    setIsDebugEnabled(enabled);

    if (!enabled) return;

    let animId: number;
    const updateHUD = () => {
      if (stateRef.current) {
        setHudData({ ...stateRef.current });
      }
      animId = requestAnimationFrame(updateHUD);
    };

    animId = requestAnimationFrame(updateHUD);
    return () => cancelAnimationFrame(animId);
  }, [stateRef]);

  if (!isDebugEnabled || !hudData) {
    return null;
  }

  const cleanPath = (p: string | null) => (p ? p.replace('/images/', '') : 'NONE');

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-5 z-50 p-4 rounded-xl font-mono text-[11px] leading-relaxed bg-[#19060A]/95 text-[#F7F0DF] border border-[#C89B3C]/60 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-md select-none pointer-events-none min-w-[260px]"
    >
      <div className="font-bold text-[#C89B3C] mb-2 tracking-[0.16em] uppercase flex items-center justify-between border-b border-[#C89B3C]/30 pb-1">
        <span>MOTION COMPOSITOR</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-[#C89B3C]/70">CURRENT SCENE:</span>
          <span className="font-semibold text-white">{hudData.currentSceneName}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#C89B3C]/70">NEXT SCENE:</span>
          <span className="font-semibold text-white">
            {hudData.nextSceneName || 'NONE (RESTING)'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#C89B3C]/70">PROGRESS:</span>
          <span className="font-semibold text-[#FFD700]">
            {hudData.progress.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#C89B3C]/70">RENDERED TEXTURES:</span>
          <span className="font-semibold text-white">
            {hudData.renderedTextures}
          </span>
        </div>

        <div className="pt-2 border-t border-[#C89B3C]/20 text-[10px] text-[#F7F0DF]/60 space-y-0.5">
          <div className="truncate">A: {cleanPath(hudData.imageA)}</div>
          <div className="truncate">B: {cleanPath(hudData.imageB)}</div>
        </div>
      </div>
    </div>
  );
};

export default MotionDebugHUD;
