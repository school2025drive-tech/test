import { TetrominoType } from '../types/tetris';
import { PiecePreview } from './PiecePreview';

interface NextQueueProps {
  queue: TetrominoType[];
}

export function NextQueue({ queue }: NextQueueProps) {
  const visibleQueue = queue.slice(0, 4);

  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md">
      <span className="text-xs font-semibold tracking-wider text-slate-400">NEXT</span>
      <div className="flex flex-col gap-2">
        {visibleQueue.map((type, idx) => (
          <PiecePreview
            key={`${idx}-${type}`}
            type={type}
            size={idx === 0 ? 'md' : 'sm'}
          />
        ))}
      </div>
    </div>
  );
}
