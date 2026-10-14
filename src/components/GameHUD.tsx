import { GameMode, GameStats } from '../types/tetris';

interface GameHUDProps {
  mode: GameMode;
  stats: GameStats;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
}

export function GameHUD({ mode, stats }: GameHUDProps) {
  const isSprint = mode === 'SPRINT';
  const isUltra = mode === 'ULTRA';

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Primary Score Metric */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md">
        <span className="text-xs font-semibold tracking-wider text-slate-400">SCORE</span>
        <div className="text-2xl font-bold font-mono-num text-amber-400 tracking-tight mt-0.5">
          {stats.score.toLocaleString()}
        </div>
      </div>

      {/* Grid of Secondary Metrics */}
      <div className="grid grid-cols-2 gap-2">
        {/* Lines Metric */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400">
            {isSprint ? 'LINES REMAINING' : 'LINES'}
          </span>
          <div className="text-xl font-bold font-mono-num text-slate-100 mt-0.5">
            {isSprint ? Math.max(0, 40 - stats.lines) : stats.lines}
          </div>
        </div>

        {/* Level Metric */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400">LEVEL</span>
          <div className="text-xl font-bold font-mono-num text-cyan-400 mt-0.5">
            {stats.level}
          </div>
        </div>

        {/* Time Metric */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md col-span-2">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400">
            {isUltra ? 'TIME REMAINING' : 'TIME'}
          </span>
          <div className="text-xl font-bold font-mono-num text-emerald-400 mt-0.5">
            {isUltra
              ? formatTime(stats.remainingTime ?? 120000)
              : formatTime(stats.elapsedTime)}
          </div>
        </div>
      </div>

      {/* Dynamic Status Cues (Combo, Back-to-Back) */}
      {(stats.combo > 1 || stats.backToBack) && (
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 flex flex-col gap-1">
          {stats.combo > 1 && (
            <div className="flex items-center justify-between">
              <span>Combo</span>
              <span className="font-mono-num font-semibold text-amber-300">
                {stats.combo} Combo
              </span>
            </div>
          )}
          {stats.backToBack && (
            <div className="flex items-center justify-between">
              <span>Back-to-Back</span>
              <span className="font-semibold text-cyan-300">Active (1.5x)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
