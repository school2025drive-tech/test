import { TetrominoType } from '../types/tetris';
import { PiecePreview } from './PiecePreview';

interface HoldQueueProps {
  holdPiece: TetrominoType | null;
  canHold: boolean;
}

export function HoldQueue({ holdPiece, canHold }: HoldQueueProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md">
      <span className="text-xs font-semibold tracking-wider text-slate-400">HOLD</span>
      <PiecePreview type={holdPiece} dimmed={!canHold} size="md" />
      <span className="text-[11px] text-slate-500 font-mono-num">
        {canHold ? 'C / Shift' : '사용됨'}
      </span>
    </div>
  );
}
