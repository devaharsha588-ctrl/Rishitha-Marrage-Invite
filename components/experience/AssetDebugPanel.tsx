'use client';

import React, { useEffect, useState } from 'react';
import { SCENE_IMAGE_PATHS } from '@/lib/scene-manifest';

export interface AssetState {
  path: string;
  name: string;
  status: 'PENDING' | 'PRELOADED' | 'TEXTURE_READY' | 'FAILED';
  width?: number;
  height?: number;
  error?: string;
}

export interface DiagnosticsState {
  webglReady: boolean;
  rendererReady: boolean;
  totalRequired: number;
  loadedCount: number;
  assets: AssetState[];
}

// Global store for asset diagnostics
const globalDiagnostics: DiagnosticsState = {
  webglReady: false,
  rendererReady: false,
  totalRequired: SCENE_IMAGE_PATHS.length,
  loadedCount: 0,
  assets: SCENE_IMAGE_PATHS.map((p) => ({
    path: p,
    name: p.replace('/images/', ''),
    status: 'PENDING',
  })),
};

const listeners = new Set<() => void>();

export function updateAssetDiagnostic(
  path: string,
  update: Partial<AssetState>
) {
  const item = globalDiagnostics.assets.find((a) => a.path === path);
  if (item) {
    Object.assign(item, update);
    globalDiagnostics.loadedCount = globalDiagnostics.assets.filter(
      (a) => a.status === 'TEXTURE_READY'
    ).length;
    listeners.forEach((fn) => fn());
  }
}

export function updateSystemDiagnostic(
  update: Partial<Pick<DiagnosticsState, 'webglReady' | 'rendererReady'>>
) {
  Object.assign(globalDiagnostics, update);
  listeners.forEach((fn) => fn());
}

export const AssetDebugPanel: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [data, setData] = useState<DiagnosticsState>(globalDiagnostics);
  const [failedAssets, setFailedAssets] = useState<AssetState[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const isDebug = params.get('assetDebug') === '1';
    setEnabled(isDebug);

    const onUpdate = () => {
      setData({ ...globalDiagnostics });
      setFailedAssets(globalDiagnostics.assets.filter((a) => a.status === 'FAILED'));
    };

    listeners.add(onUpdate);
    onUpdate();

    return () => {
      listeners.delete(onUpdate);
    };
  }, []);

  // Show failure notification banner in development mode if any texture fails
  const showFailureBanner = failedAssets.length > 0;

  if (!enabled && !showFailureBanner) {
    return null;
  }

  return (
    <>
      {/* Texture Failure Alert in Dev Mode */}
      {showFailureBanner && !enabled && (
        <div className="fixed top-5 left-5 z-50 p-4 rounded-xl font-mono text-xs bg-red-950/95 text-red-200 border-2 border-red-500 shadow-2xl backdrop-blur-md">
          <div className="font-bold text-red-400 mb-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            TEXTURE LOAD FAILED
          </div>
          {failedAssets.map((f) => (
            <div key={f.path} className="text-[11px] text-red-300">
              {f.path} ({f.error || 'Network/Decode error'})
            </div>
          ))}
        </div>
      )}

      {/* Asset Diagnostics Panel (?assetDebug=1) */}
      {enabled && (
        <div
          role="region"
          aria-label="Asset Diagnostics"
          className="fixed top-20 left-5 z-50 p-4 rounded-xl font-mono text-[11px] leading-relaxed bg-[#19060A]/95 text-[#F7F0DF] border border-[#C89B3C]/70 shadow-[0_8px_32px_rgba(0,0,0,0.85)] backdrop-blur-md select-none pointer-events-none min-w-[280px]"
        >
          <div className="font-bold text-[#C89B3C] mb-2 tracking-[0.16em] uppercase flex items-center justify-between border-b border-[#C89B3C]/30 pb-1">
            <span>ASSET DIAGNOSTICS</span>
            <span
              className={`w-2 h-2 rounded-full ${
                data.loadedCount === data.totalRequired ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
          </div>

          <div className="mb-2 pb-2 border-b border-[#C89B3C]/20 flex justify-between text-[10px]">
            <div>
              WebGL: <span className={data.webglReady ? 'text-emerald-400' : 'text-amber-400'}>{data.webglReady ? 'READY' : 'INIT'}</span>
            </div>
            <div>
              Renderer: <span className={data.rendererReady ? 'text-emerald-400' : 'text-amber-400'}>{data.rendererReady ? 'READY' : 'INIT'}</span>
            </div>
            <div>
              Textures: <span className="font-bold text-white">{data.loadedCount} / {data.totalRequired}</span>
            </div>
          </div>

          <div className="space-y-1">
            {data.assets.map((asset) => {
              const isLoaded = asset.status === 'TEXTURE_READY';
              const isFailed = asset.status === 'FAILED';

              return (
                <div key={asset.path} className="flex justify-between items-center text-[10px]">
                  <span className="truncate max-w-[170px] text-[#F7F0DF]/90">{asset.name}</span>
                  <span
                    className={`font-semibold px-1.5 py-0.5 rounded text-[9px] ${
                      isLoaded
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : isFailed
                        ? 'bg-red-950 text-red-300 border border-red-500/60'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isLoaded ? 'LOADED' : isFailed ? 'FAILED' : 'LOADING'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default AssetDebugPanel;
