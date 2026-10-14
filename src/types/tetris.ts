export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type Rotation = 0 | 1 | 2 | 3;

export interface Position {
  x: number;
  y: number;
}

export type GridCell = TetrominoType | null;

export type Grid = GridCell[][];

export type GameMode = 'MARATHON' | 'SPRINT' | 'ULTRA';

export type GameStatus = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export interface PieceState {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
  rotation: Rotation;
}

export interface GameStats {
  score: number;
  lines: number;
  level: number;
  combo: number;
  maxCombo: number;
  tetrisCount: number;
  tSpins: number;
  piecesPlaced: number;
  elapsedTime: number; // in milliseconds
  remainingTime?: number; // for Ultra mode (ms)
  backToBack: boolean;
}

export interface HighScoreRecord {
  id: string;
  mode: GameMode;
  score: number;
  lines: number;
  level: number;
  timeMs: number;
  date: string;
}

export interface ClearEffect {
  rows: number[];
  progress: number; // 0 to 1
  isTetris: boolean;
  tSpin: boolean;
  combo: number;
  text?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}
