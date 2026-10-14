import { TetrominoType } from '../types/tetris';
import { TETROMINO_BASE_SHAPES, TETROMINO_COLORS } from '../utils/constants';

interface PiecePreviewProps {
  type: TetrominoType | null;
  dimmed?: boolean;
  size?: 'sm' | 'md';
}

export function PiecePreview({ type, dimmed = false, size = 'md' }: PiecePreviewProps) {
  const cellSize = size === 'sm' ? 14 : 18;
  const containerSize = size === 'sm' ? 'w-16 h-14' : 'w-20 h-16';

  if (!type) {
    return (
      <div className={`${containerSize} flex items-center justify-center rounded-lg bg-slate-900/60 border border-slate-800/80`}>
        <span className="text-xs text-slate-600 font-mono">-</span>
      </div>
    );
  }

  const shape = TETROMINO_BASE_SHAPES[type];
  const colors = TETROMINO_COLORS[type];
  const rows = shape.length;
  const cols = shape[0].length;

  return (
    <div
      className={`${containerSize} flex items-center justify-center rounded-lg bg-slate-900/80 border border-slate-800/80 shadow-inner p-1 transition-opacity ${
        dimmed ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <div
        className="grid gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {shape.map((row, rIdx) =>
          row.map((val, cIdx) => {
            if (val === 0) {
              return <div key={`${rIdx}-${cIdx}`} className="w-full h-full" />;
            }
            return (
              <div
                key={`${rIdx}-${cIdx}`}
                className="w-full h-full rounded-[2px] relative overflow-hidden"
                style={{
                  backgroundColor: colors.main,
                  boxShadow: `inset 1px 1px 0px ${colors.light}, inset -1px -1px 0px ${colors.dark}`,
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
