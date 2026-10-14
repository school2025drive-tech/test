import React, { useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  RotateCw,
  RotateCcw,
  ChevronsDown,
  RefreshCw,
} from 'lucide-react';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onHold: () => void;
  disabled?: boolean;
}

export function TouchControls({
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onHardDrop,
  onRotateCW,
  onRotateCCW,
  onHold,
  disabled = false,
}: TouchControlsProps) {
  const repeatTimerRef = useRef<number | null>(null);

  const triggerVibrate = (ms = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch {
        // ignore
      }
    }
  };

  const handleHoldStart = (action: () => void, allowRepeat = true) => {
    if (disabled) return;
    triggerVibrate();
    action();

    if (allowRepeat) {
      if (repeatTimerRef.current) clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = window.setInterval(() => {
        action();
      }, 75);
    }
  };

  const handleHoldEnd = () => {
    if (repeatTimerRef.current) {
      clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pt-2 select-none touch-control">
      <div className="flex items-center justify-between gap-4 px-2">
        {/* Left Side: D-Pad & Hold */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 active:bg-slate-800 flex items-center justify-center text-slate-300 active:text-white active:scale-95 transition-transform"
            onTouchStart={(e) => {
              e.preventDefault();
              handleHoldStart(onMoveLeft);
            }}
            onTouchEnd={handleHoldEnd}
            onMouseDown={() => handleHoldStart(onMoveLeft)}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            aria-label="왼쪽 이동"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 active:bg-slate-800 flex items-center justify-center text-slate-300 active:text-white active:scale-95 transition-transform"
            onTouchStart={(e) => {
              e.preventDefault();
              handleHoldStart(onMoveRight);
            }}
            onTouchEnd={handleHoldEnd}
            onMouseDown={() => handleHoldStart(onMoveRight)}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            aria-label="오른쪽 이동"
          >
            <ArrowRight className="w-6 h-6" />
          </button>

          <button
            type="button"
            className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 active:bg-slate-800 flex items-center justify-center text-slate-300 active:text-white active:scale-95 transition-transform"
            onTouchStart={(e) => {
              e.preventDefault();
              handleHoldStart(onSoftDrop);
            }}
            onTouchEnd={handleHoldEnd}
            onMouseDown={() => handleHoldStart(onSoftDrop)}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            aria-label="소프트 드롭"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
        </div>

        {/* Center: Hold & Hard Drop */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-800 active:bg-slate-800 flex flex-col items-center justify-center text-amber-400 active:scale-95 transition-transform"
            onTouchStart={(e) => {
              e.preventDefault();
              triggerVibrate(20);
              onHold();
            }}
            onClick={() => {
              triggerVibrate(20);
              onHold();
            }}
            aria-label="홀드"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="text-[9px] font-semibold mt-0.5">HOLD</span>
          </button>

          <button
            type="button"
            className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/80 active:bg-cyan-900 flex flex-col items-center justify-center text-cyan-400 active:scale-95 transition-transform shadow-lg shadow-cyan-950/50"
            onTouchStart={(e) => {
              e.preventDefault();
              triggerVibrate(35);
              onHardDrop();
            }}
            onClick={() => {
              triggerVibrate(35);
              onHardDrop();
            }}
            aria-label="하드 드롭"
          >
            <ChevronsDown className="w-5 h-5" />
            <span className="text-[9px] font-semibold mt-0.5">DROP</span>
          </button>
        </div>

        {/* Right Side: Rotations */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 active:bg-slate-800 flex items-center justify-center text-purple-400 active:text-purple-300 active:scale-95 transition-transform"
            onTouchStart={(e) => {
              e.preventDefault();
              triggerVibrate(15);
              onRotateCCW();
            }}
            onClick={() => {
              triggerVibrate(15);
              onRotateCCW();
            }}
            aria-label="반시계방향 회전"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 active:bg-slate-800 flex items-center justify-center text-purple-400 active:text-purple-300 active:scale-95 transition-transform"
            onTouchStart={(e) => {
              e.preventDefault();
              triggerVibrate(15);
              onRotateCW();
            }}
            onClick={() => {
              triggerVibrate(15);
              onRotateCW();
            }}
            aria-label="시계방향 회전"
          >
            <RotateCw className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
