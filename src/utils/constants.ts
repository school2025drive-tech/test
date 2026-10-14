import { TetrominoType, Rotation } from '../types/tetris';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const HIDDEN_ROWS = 2; // Spawn area above visible board
export const TOTAL_ROWS = BOARD_HEIGHT + HIDDEN_ROWS;

// Standard Tetris Guideline Colors
export const TETROMINO_COLORS: Record<TetrominoType, {
  main: string;
  light: string;
  dark: string;
  ghost: string;
  glow: string;
}> = {
  I: {
    main: '#06b6d4',  // Cyan
    light: '#67e8f9',
    dark: '#0891b2',
    ghost: 'rgba(6, 182, 212, 0.25)',
    glow: 'rgba(6, 182, 212, 0.6)',
  },
  J: {
    main: '#2563eb',  // Blue
    light: '#60a5fa',
    dark: '#1d4ed8',
    ghost: 'rgba(37, 99, 235, 0.25)',
    glow: 'rgba(37, 99, 235, 0.6)',
  },
  L: {
    main: '#ea580c',  // Orange
    light: '#fb923c',
    dark: '#c2410c',
    ghost: 'rgba(234, 88, 12, 0.25)',
    glow: 'rgba(234, 88, 12, 0.6)',
  },
  O: {
    main: '#eab308',  // Yellow
    light: '#fde047',
    dark: '#ca8a04',
    ghost: 'rgba(234, 179, 8, 0.25)',
    glow: 'rgba(234, 179, 8, 0.6)',
  },
  S: {
    main: '#16a34a',  // Green
    light: '#4ade80',
    dark: '#15803d',
    ghost: 'rgba(22, 163, 74, 0.25)',
    glow: 'rgba(22, 163, 74, 0.6)',
  },
  T: {
    main: '#9333ea',  // Purple
    light: '#c084fc',
    dark: '#7e22ce',
    ghost: 'rgba(147, 51, 234, 0.25)',
    glow: 'rgba(147, 51, 234, 0.6)',
  },
  Z: {
    main: '#dc2626',  // Red
    light: '#f87171',
    dark: '#b91c1c',
    ghost: 'rgba(220, 38, 38, 0.25)',
    glow: 'rgba(220, 38, 38, 0.6)',
  },
};

// Base 4x4 or 3x3 matrices in Rotation 0
export const TETROMINO_BASE_SHAPES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

// Rotate matrix 90 degrees clockwise
export function rotateMatrixCW(matrix: number[][]): number[][] {
  const N = matrix.length;
  const result: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      result[c][N - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

// Rotate matrix 90 degrees counter-clockwise
export function rotateMatrixCCW(matrix: number[][]): number[][] {
  const N = matrix.length;
  const result: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      result[N - 1 - c][r] = matrix[r][c];
    }
  }
  return result;
}

// Precomputed 4 rotations for each tetromino
export const TETROMINO_ROTATIONS: Record<TetrominoType, Record<Rotation, number[][]>> = (() => {
  const types: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  const res = {} as Record<TetrominoType, Record<Rotation, number[][]>>;

  for (const t of types) {
    const r0 = TETROMINO_BASE_SHAPES[t];
    const r1 = rotateMatrixCW(r0);
    const r2 = rotateMatrixCW(r1);
    const r3 = rotateMatrixCW(r2);
    res[t] = { 0: r0, 1: r1, 2: r2, 3: r3 };
  }
  return res;
})();

// Super Rotation System (SRS) Wall Kick Data
// Standard pieces: J, L, S, T, Z
export const SRS_KICKS_NORMAL: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

// I Piece Wall Kicks
export const SRS_KICKS_I: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

// 7-Bag Randomizer
export function generateBag(): TetrominoType[] {
  const bag: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

// Gravity speed per level in milliseconds
export function getGravitySpeed(level: number): number {
  const speeds = [
    800, // Lv 1
    716, // Lv 2
    633, // Lv 3
    550, // Lv 4
    466, // Lv 5
    383, // Lv 6
    300, // Lv 7
    216, // Lv 8
    133, // Lv 9
    100, // Lv 10
    83,  // Lv 11
    66,  // Lv 12
    50,  // Lv 13
    33,  // Lv 14
    20,  // Lv 15+
  ];
  return speeds[Math.min(level - 1, speeds.length - 1)] || 20;
}

// Scoring rules based on classic Guideline
export const SCORE_VALUES = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  BACK_TO_BACK_MULTIPLIER: 1.5,
  SOFT_DROP_PER_CELL: 1,
  HARD_DROP_PER_CELL: 2,
  T_SPIN_MINI: 100,
  T_SPIN_SINGLE: 800,
  T_SPIN_DOUBLE: 1200,
  T_SPIN_TRIPLE: 1600,
  COMBO_BONUS: 50,
};
