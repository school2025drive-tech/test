import { useEffect, useRef } from 'react';
import { Grid, PieceState, ClearEffect, Particle } from '../types/tetris';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  HIDDEN_ROWS,
  TETROMINO_COLORS,
} from '../utils/constants';
import { calculateGhostY } from '../utils/gameLogic';

interface TetrisBoardProps {
  grid: Grid;
  currentPiece: PieceState | null;
  clearEffect: ClearEffect | null;
  isPaused: boolean;
}

export function TetrisBoard({
  grid,
  currentPiece,
  clearEffect,
  isPaused,
}: TetrisBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Spawn particles when rows are cleared
  useEffect(() => {
    if (clearEffect && clearEffect.rows.length > 0) {
      const newParticles: Particle[] = [];
      clearEffect.rows.forEach((rowIdx) => {
        const visibleY = rowIdx - HIDDEN_ROWS;
        if (visibleY >= 0) {
          for (let col = 0; col < BOARD_WIDTH; col++) {
            const cellType = grid[rowIdx]?.[col];
            const color = cellType ? TETROMINO_COLORS[cellType].light : '#67e8f9';
            // Spawn 3 particles per cleared cell
            for (let i = 0; i < 3; i++) {
              newParticles.push({
                x: col + 0.5 + (Math.random() - 0.5) * 0.8,
                y: visibleY + 0.5 + (Math.random() - 0.5) * 0.8,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 1.2) * 5,
                color,
                size: Math.random() * 3 + 2,
                alpha: 1,
                life: 0,
                maxLife: 30 + Math.random() * 15,
              });
            }
          }
        }
      });
      particlesRef.current = [...particlesRef.current, ...newParticles];
    }
  }, [clearEffect, grid]);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const cellSize = width / BOARD_WIDTH;

      // 1. Draw Board Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= BOARD_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, height);
        ctx.stroke();
      }
      for (let y = 0; y <= BOARD_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(width, y * cellSize);
        ctx.stroke();
      }

      // Helper function to draw a beveled arcade tetromino block
      const drawBlock = (
        col: number,
        row: number,
        colors: { main: string; light: string; dark: string },
        alpha = 1
      ) => {
        const px = col * cellSize;
        const py = row * cellSize;
        const inset = cellSize * 0.12;

        ctx.globalAlpha = alpha;

        // Main face
        ctx.fillStyle = colors.main;
        ctx.fillRect(px, py, cellSize, cellSize);

        // Top & Left bevel (Light highlight)
        ctx.fillStyle = colors.light;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + cellSize, py);
        ctx.lineTo(px + cellSize - inset, py + inset);
        ctx.lineTo(px + inset, py + inset);
        ctx.lineTo(px + inset, py + cellSize - inset);
        ctx.lineTo(px, py + cellSize);
        ctx.closePath();
        ctx.fill();

        // Bottom & Right bevel (Dark shadow)
        ctx.fillStyle = colors.dark;
        ctx.beginPath();
        ctx.moveTo(px + cellSize, py);
        ctx.lineTo(px + cellSize, py + cellSize);
        ctx.lineTo(px, py + cellSize);
        ctx.lineTo(px + inset, py + cellSize - inset);
        ctx.lineTo(px + cellSize - inset, py + cellSize - inset);
        ctx.lineTo(px + cellSize - inset, py + inset);
        ctx.closePath();
        ctx.fill();

        // Inner center tile
        ctx.fillStyle = colors.main;
        ctx.fillRect(px + inset, py + inset, cellSize - inset * 2, cellSize - inset * 2);

        // Subtle border stroke
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, cellSize, cellSize);

        ctx.globalAlpha = 1;
      };

      // 3. Draw Locked Blocks on Grid (Visible rows starting from HIDDEN_ROWS)
      for (let row = HIDDEN_ROWS; row < grid.length; row++) {
        const visibleRow = row - HIDDEN_ROWS;
        for (let col = 0; col < BOARD_WIDTH; col++) {
          const cellType = grid[row][col];
          if (cellType) {
            const colors = TETROMINO_COLORS[cellType];
            drawBlock(col, visibleRow, colors);
          }
        }
      }

      // 4. Draw Ghost Piece (Drop Guide)
      if (currentPiece && !isPaused) {
        const ghostY = calculateGhostY(grid, currentPiece);
        const colors = TETROMINO_COLORS[currentPiece.type];

        for (let r = 0; r < currentPiece.shape.length; r++) {
          for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c] !== 0) {
              const gridRow = ghostY + r;
              const gridCol = currentPiece.x + c;
              const visibleRow = gridRow - HIDDEN_ROWS;

              if (visibleRow >= 0 && visibleRow < BOARD_HEIGHT) {
                const px = gridCol * cellSize;
                const py = visibleRow * cellSize;

                // Ghost outline & subtle fill
                ctx.fillStyle = colors.ghost;
                ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);

                ctx.strokeStyle = colors.light;
                ctx.lineWidth = 1.5;
                ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
              }
            }
          }
        }
      }

      // 5. Draw Active Falling Piece
      if (currentPiece && !isPaused) {
        const colors = TETROMINO_COLORS[currentPiece.type];

        for (let r = 0; r < currentPiece.shape.length; r++) {
          for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c] !== 0) {
              const gridRow = currentPiece.y + r;
              const gridCol = currentPiece.x + c;
              const visibleRow = gridRow - HIDDEN_ROWS;

              if (visibleRow >= 0 && visibleRow < BOARD_HEIGHT) {
                drawBlock(gridCol, visibleRow, colors);
              }
            }
          }
        }
      }

      // 6. Draw Line Clear Flash Animation
      if (clearEffect && clearEffect.rows.length > 0) {
        clearEffect.rows.forEach((rowIdx) => {
          const visibleY = rowIdx - HIDDEN_ROWS;
          if (visibleY >= 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.fillRect(0, visibleY * cellSize, width, cellSize);
          }
        });

        // Floating message (e.g. TETRIS! / 3 COMBO!)
        if (clearEffect.text) {
          ctx.save();
          ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = clearEffect.isTetris ? '#facc15' : '#38bdf8';
          ctx.shadowColor = clearEffect.isTetris ? '#eab308' : '#0284c7';
          ctx.shadowBlur = 12;
          ctx.fillText(clearEffect.text, width / 2, height / 2);
          ctx.restore();
        }
      }

      // 7. Update and Render Particle Bursts
      if (particlesRef.current.length > 0) {
        particlesRef.current = particlesRef.current.filter((p) => {
          p.x += (p.vx * cellSize) / 60;
          p.y += (p.vy * cellSize) / 60;
          p.vy += 0.25; // gravity
          p.life++;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x * cellSize, p.y * cellSize, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;

          return p.life < p.maxLife;
        });
      }

      // 8. Paused Overlay
      if (isPaused) {
        ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('일시 정지', width / 2, height / 2 - 14);

        ctx.font = '13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('P 또는 ESC를 눌러 계속하기', width / 2, height / 2 + 18);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [grid, currentPiece, clearEffect, isPaused]);

  return (
    <div className="relative w-full max-w-[320px] aspect-[1/2] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950/90 ring-1 ring-slate-800/80">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
