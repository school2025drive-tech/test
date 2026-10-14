import {
  Grid,
  TetrominoType,
  Rotation,
  PieceState,
} from '../types/tetris';
import {
  BOARD_WIDTH,
  TOTAL_ROWS,
  TETROMINO_ROTATIONS,
  SRS_KICKS_NORMAL,
  SRS_KICKS_I,
} from './constants';

// Create an empty grid
export function createEmptyGrid(): Grid {
  return Array.from({ length: TOTAL_ROWS }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
}

// Check if a piece position is valid inside the grid
export function isValidPosition(
  grid: Grid,
  shape: number[][],
  posX: number,
  posY: number
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const x = posX + c;
        const y = posY + r;

        // Horizontal boundary
        if (x < 0 || x >= BOARD_WIDTH) {
          return false;
        }

        // Bottom boundary
        if (y >= TOTAL_ROWS) {
          return false;
        }

        // Cell occupied (ignore cells above row 0)
        if (y >= 0 && grid[y][x] !== null) {
          return false;
        }
      }
    }
  }
  return true;
}

// Calculate the lowest valid Y position (Ghost piece drop position)
export function calculateGhostY(grid: Grid, piece: PieceState): number {
  let ghostY = piece.y;
  while (isValidPosition(grid, piece.shape, piece.x, ghostY + 1)) {
    ghostY++;
  }
  return ghostY;
}

// Try SRS rotation
export function attemptRotation(
  grid: Grid,
  piece: PieceState,
  direction: 'CW' | 'CCW'
): { success: boolean; newPiece?: PieceState; isTSpin?: boolean } {
  const currentRotation = piece.rotation;
  let nextRotation: Rotation;

  if (direction === 'CW') {
    nextRotation = ((currentRotation + 1) % 4) as Rotation;
  } else {
    nextRotation = ((currentRotation + 3) % 4) as Rotation;
  }

  const nextShape = TETROMINO_ROTATIONS[piece.type][nextRotation];
  const transitionKey = `${currentRotation}->${nextRotation}`;

  const kickTable = piece.type === 'I' ? SRS_KICKS_I : SRS_KICKS_NORMAL;
  const kickOffsets = kickTable[transitionKey] || [[0, 0]];

  for (const [kx, ky] of kickOffsets) {
    // In SRS tables, positive Y is UP, so on board array we SUBTRACT ky
    const testX = piece.x + kx;
    const testY = piece.y - ky;

    if (isValidPosition(grid, nextShape, testX, testY)) {
      // Check for T-spin
      let isTSpin = false;
      if (piece.type === 'T') {
        isTSpin = checkTSpinCorners(grid, testX, testY);
      }

      return {
        success: true,
        newPiece: {
          ...piece,
          shape: nextShape,
          rotation: nextRotation,
          x: testX,
          y: testY,
        },
        isTSpin,
      };
    }
  }

  return { success: false };
}

// Check 3-corner rule for T-Spin
export function checkTSpinCorners(grid: Grid, pieceX: number, pieceY: number): boolean {
  // Center of T piece in 3x3 matrix is (pieceX + 1, pieceY + 1)
  const corners = [
    { x: pieceX, y: pieceY },         // Top-left
    { x: pieceX + 2, y: pieceY },     // Top-right
    { x: pieceX, y: pieceY + 2 },     // Bottom-left
    { x: pieceX + 2, y: pieceY + 2 }, // Bottom-right
  ];

  let occupied = 0;
  for (const c of corners) {
    if (c.x < 0 || c.x >= BOARD_WIDTH || c.y >= TOTAL_ROWS) {
      occupied++;
    } else if (c.y >= 0 && grid[c.y][c.x] !== null) {
      occupied++;
    }
  }

  return occupied >= 3;
}

// Merge piece into grid
export function mergePieceToGrid(grid: Grid, piece: PieceState): Grid {
  const newGrid = grid.map((row) => [...row]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c] !== 0) {
        const x = piece.x + c;
        const y = piece.y + r;
        if (y >= 0 && y < TOTAL_ROWS && x >= 0 && x < BOARD_WIDTH) {
          newGrid[y][x] = piece.type;
        }
      }
    }
  }
  return newGrid;
}

// Find full rows
export function getFullRows(grid: Grid): number[] {
  const fullRows: number[] = [];
  for (let r = 0; r < TOTAL_ROWS; r++) {
    const isFull = grid[r].every((cell) => cell !== null);
    if (isFull) {
      fullRows.push(r);
    }
  }
  return fullRows;
}

// Remove full rows and add new empty rows at top
export function clearRows(grid: Grid, rowsToClear: number[]): Grid {
  if (rowsToClear.length === 0) return grid;

  const rowsSet = new Set(rowsToClear);
  const remainingRows = grid.filter((_, idx) => !rowsSet.has(idx));
  const newEmptyRows = Array.from({ length: rowsToClear.length }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );

  return [...newEmptyRows, ...remainingRows];
}

// Spawn a new piece centered at top
export function createNewPiece(type: TetrominoType): PieceState {
  const shape = TETROMINO_ROTATIONS[type][0];
  const pieceWidth = shape[0].length;
  // Center horizontally
  const spawnX = Math.floor((BOARD_WIDTH - pieceWidth) / 2);
  // Spawn in the hidden rows at top
  const spawnY = 0;

  return {
    type,
    shape,
    rotation: 0,
    x: spawnX,
    y: spawnY,
  };
}
