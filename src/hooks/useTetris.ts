import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Grid,
  GameMode,
  GameStatus,
  PieceState,
  TetrominoType,
  GameStats,
  HighScoreRecord,
  ClearEffect,
} from '../types/tetris';
import {
  BOARD_WIDTH,
  HIDDEN_ROWS,
  TOTAL_ROWS,
  generateBag,
  getGravitySpeed,
  SCORE_VALUES,
} from '../utils/constants';
import {
  createEmptyGrid,
  createNewPiece,
  isValidPosition,
  calculateGhostY,
  attemptRotation,
  mergePieceToGrid,
  getFullRows,
  clearRows,
} from '../utils/gameLogic';
import { sound } from '../utils/audio';

const STORAGE_KEY = 'tetris_arcade_high_scores_v1';

export function useTetris() {
  const [mode, setMode] = useState<GameMode>('MARATHON');
  const [status, setStatus] = useState<GameStatus>('TITLE');
  const [grid, setGrid] = useState<Grid>(createEmptyGrid);
  const [currentPiece, setCurrentPiece] = useState<PieceState | null>(null);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>([]);
  const [highScores, setHighScores] = useState<HighScoreRecord[]>([]);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    lines: 0,
    level: 1,
    combo: -1,
    maxCombo: 0,
    tetrisCount: 0,
    tSpins: 0,
    piecesPlaced: 0,
    elapsedTime: 0,
    remainingTime: 120000,
    backToBack: false,
  });

  const [clearEffect, setClearEffect] = useState<ClearEffect | null>(null);

  // References for game loop state
  const bagRef = useRef<TetrominoType[]>([]);
  const gridRef = useRef<Grid>(createEmptyGrid());
  const currentPieceRef = useRef<PieceState | null>(null);
  const statsRef = useRef<GameStats>(stats);
  const statusRef = useRef<GameStatus>(status);
  const modeRef = useRef<GameMode>(mode);
  const holdPieceRef = useRef<TetrominoType | null>(null);
  const canHoldRef = useRef<boolean>(true);
  const nextQueueRef = useRef<TetrominoType[]>([]);

  // Lock delay refs
  const lockTimerRef = useRef<number | null>(null);
  const lockResetsRef = useRef<number>(0);
  const MAX_LOCK_RESETS = 15;
  const LOCK_DELAY = 500; // ms

  // Timing refs
  const lastDropTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(0);
  const pausedTimeOffsetRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const isSoftDroppingRef = useRef<boolean>(false);
  const lastActionWasRotateRef = useRef<boolean>(false);

  // Keep refs in sync with state
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    currentPieceRef.current = currentPiece;
  }, [currentPiece]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    holdPieceRef.current = holdPiece;
  }, [holdPiece]);

  useEffect(() => {
    canHoldRef.current = canHold;
  }, [canHold]);

  useEffect(() => {
    nextQueueRef.current = nextQueue;
  }, [nextQueue]);

  // Load high scores from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHighScores(JSON.parse(stored));
      }
    } catch {
      // ignore storage error
    }
  }, []);

  const saveHighScore = useCallback((newRecord: HighScoreRecord) => {
    setHighScores((prev) => {
      const updated = [newRecord, ...prev].sort((a, b) => {
        if (a.mode === 'SPRINT' && b.mode === 'SPRINT') {
          return a.timeMs - b.timeMs; // lower time is better in sprint
        }
        return b.score - a.score;
      }).slice(0, 30);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
      return updated;
    });
  }, []);

  // Bag replenishing helper
  const pullNextPiece = useCallback((): TetrominoType => {
    if (bagRef.current.length < 7) {
      bagRef.current = [...bagRef.current, ...generateBag()];
    }
    const next = bagRef.current.shift()!;
    return next;
  }, []);

  // Spawn new tetromino
  const spawnPiece = useCallback((specifiedType?: TetrominoType) => {
    // Ensure queue has at least 5 pieces
    while (nextQueueRef.current.length < 5) {
      nextQueueRef.current.push(pullNextPiece());
    }

    const type = specifiedType || nextQueueRef.current.shift()!;
    setNextQueue([...nextQueueRef.current]);

    const newPiece = createNewPiece(type);

    // Check if new piece immediately collides with existing board -> GAME OVER
    if (!isValidPosition(gridRef.current, newPiece.shape, newPiece.x, newPiece.y)) {
      statusRef.current = 'GAME_OVER';
      setStatus('GAME_OVER');
      sound.playGameOver();

      // Record high score
      saveHighScore({
        id: `${Date.now()}-${Math.random()}`,
        mode: modeRef.current,
        score: statsRef.current.score,
        lines: statsRef.current.lines,
        level: statsRef.current.level,
        timeMs: statsRef.current.elapsedTime,
        date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      });
      return;
    }

    currentPieceRef.current = newPiece;
    setCurrentPiece(newPiece);
    canHoldRef.current = true;
    setCanHold(true);
    lockResetsRef.current = 0;
    if (lockTimerRef.current) {
      window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    lastActionWasRotateRef.current = false;
  }, [pullNextPiece, saveHighScore]);

  // Lock the active piece and handle line clears
  const lockPiece = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece) return;

    if (lockTimerRef.current) {
      window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }

    // Merge piece to grid
    const merged = mergePieceToGrid(gridRef.current, piece);
    currentPieceRef.current = null;
    setCurrentPiece(null);

    // Check for full rows
    const fullRows = getFullRows(merged);
    const linesCleared = fullRows.length;

    let pointsEarned = 0;
    let newCombo = statsRef.current.combo;
    let isTetris = linesCleared === 4;
    let isB2B = statsRef.current.backToBack;
    let tSpinType: 'none' | 'mini' | 'full' = 'none';

    // T-Spin detection
    if (piece.type === 'T' && lastActionWasRotateRef.current) {
      // Already checked in rotate
      if (linesCleared === 1) tSpinType = 'mini';
      if (linesCleared === 2 || linesCleared === 3) tSpinType = 'full';
    }

    if (linesCleared > 0) {
      newCombo += 1;

      // Base line clear points
      let basePoints = 0;
      if (tSpinType === 'full') {
        if (linesCleared === 1) basePoints = SCORE_VALUES.T_SPIN_SINGLE;
        else if (linesCleared === 2) basePoints = SCORE_VALUES.T_SPIN_DOUBLE;
        else if (linesCleared === 3) basePoints = SCORE_VALUES.T_SPIN_TRIPLE;
      } else if (tSpinType === 'mini') {
        basePoints = SCORE_VALUES.T_SPIN_MINI;
      } else {
        if (linesCleared === 1) basePoints = SCORE_VALUES.SINGLE;
        else if (linesCleared === 2) basePoints = SCORE_VALUES.DOUBLE;
        else if (linesCleared === 3) basePoints = SCORE_VALUES.TRIPLE;
        else if (linesCleared === 4) basePoints = SCORE_VALUES.TETRIS;
      }

      // Back-to-Back bonus
      const isDifficult = isTetris || tSpinType !== 'none';
      if (isDifficult) {
        if (isB2B) {
          basePoints = Math.floor(basePoints * SCORE_VALUES.BACK_TO_BACK_MULTIPLIER);
        }
        isB2B = true;
      } else {
        isB2B = false;
      }

      pointsEarned = basePoints * statsRef.current.level + (newCombo > 0 ? newCombo * SCORE_VALUES.COMBO_BONUS * statsRef.current.level : 0);

      // Sound
      sound.playClear(linesCleared);

      // Trigger clear flash effect
      setClearEffect({
        rows: fullRows,
        progress: 0,
        isTetris,
        tSpin: tSpinType !== 'none',
        combo: newCombo,
        text: isTetris ? 'TETRIS!' : tSpinType !== 'none' ? 'T-SPIN!' : newCombo > 1 ? `${newCombo} COMBO!` : undefined,
      });

      // Clear rows after small visual delay
      window.setTimeout(() => {
        const cleanedGrid = clearRows(merged, fullRows);
        gridRef.current = cleanedGrid;
        setGrid(cleanedGrid);
        setClearEffect(null);

        // Check Sprint Mode victory
        const totalLines = statsRef.current.lines + linesCleared;
        if (modeRef.current === 'SPRINT' && totalLines >= 40) {
          statusRef.current = 'VICTORY';
          setStatus('VICTORY');
          sound.playLevelUp();
          saveHighScore({
            id: `${Date.now()}-${Math.random()}`,
            mode: 'SPRINT',
            score: statsRef.current.score + pointsEarned,
            lines: 40,
            level: statsRef.current.level,
            timeMs: statsRef.current.elapsedTime,
            date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          });
          return;
        }

        // Spawn next piece after clear
        spawnPiece();
      }, 120);
    } else {
      newCombo = -1;
      gridRef.current = merged;
      setGrid(merged);
      spawnPiece();
    }

    // Update stats
    setStats((prev) => {
      const newLines = prev.lines + linesCleared;
      const newLevel = modeRef.current === 'MARATHON' ? Math.floor(newLines / 10) + 1 : prev.level;

      if (newLevel > prev.level) {
        sound.playLevelUp();
      }

      return {
        ...prev,
        score: prev.score + pointsEarned,
        lines: newLines,
        level: newLevel,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        tetrisCount: prev.tetrisCount + (isTetris ? 1 : 0),
        tSpins: prev.tSpins + (tSpinType !== 'none' ? 1 : 0),
        piecesPlaced: prev.piecesPlaced + 1,
        backToBack: isB2B,
      };
    });
  }, [spawnPiece, saveHighScore]);

  // Move active piece left or right
  const moveHorizontally = useCallback((deltaX: number) => {
    const piece = currentPieceRef.current;
    if (!piece || statusRef.current !== 'PLAYING') return;

    if (isValidPosition(gridRef.current, piece.shape, piece.x + deltaX, piece.y)) {
      const updated: PieceState = {
        ...piece,
        x: piece.x + deltaX,
      };
      currentPieceRef.current = updated;
      setCurrentPiece(updated);
      sound.playMove();
      lastActionWasRotateRef.current = false;

      // If grounded, reset lock timer up to MAX_LOCK_RESETS
      const isGrounded = !isValidPosition(gridRef.current, updated.shape, updated.x, updated.y + 1);
      if (isGrounded && lockResetsRef.current < MAX_LOCK_RESETS) {
        lockResetsRef.current++;
        if (lockTimerRef.current) {
          window.clearTimeout(lockTimerRef.current);
          lockTimerRef.current = window.setTimeout(lockPiece, LOCK_DELAY);
        }
      }
    }
  }, [lockPiece]);

  // Rotate active piece CW or CCW
  const rotatePiece = useCallback((direction: 'CW' | 'CCW' = 'CW') => {
    const piece = currentPieceRef.current;
    if (!piece || statusRef.current !== 'PLAYING') return;

    const result = attemptRotation(gridRef.current, piece, direction);
    if (result.success && result.newPiece) {
      currentPieceRef.current = result.newPiece;
      setCurrentPiece(result.newPiece);
      sound.playRotate();
      lastActionWasRotateRef.current = true;

      // If grounded, reset lock timer
      const isGrounded = !isValidPosition(gridRef.current, result.newPiece.shape, result.newPiece.x, result.newPiece.y + 1);
      if (isGrounded && lockResetsRef.current < MAX_LOCK_RESETS) {
        lockResetsRef.current++;
        if (lockTimerRef.current) {
          window.clearTimeout(lockTimerRef.current);
          lockTimerRef.current = window.setTimeout(lockPiece, LOCK_DELAY);
        }
      }
    }
  }, [lockPiece]);

  // Soft drop step
  const softDrop = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || statusRef.current !== 'PLAYING') return;

    if (isValidPosition(gridRef.current, piece.shape, piece.x, piece.y + 1)) {
      const updated = { ...piece, y: piece.y + 1 };
      currentPieceRef.current = updated;
      setCurrentPiece(updated);
      sound.playSoftDrop();
      setStats((prev) => ({ ...prev, score: prev.score + SCORE_VALUES.SOFT_DROP_PER_CELL }));
      lastActionWasRotateRef.current = false;
    } else {
      // Reached bottom
      if (!lockTimerRef.current) {
        lockTimerRef.current = window.setTimeout(lockPiece, LOCK_DELAY);
      }
    }
  }, [lockPiece]);

  // Hard drop (instant drop & lock)
  const hardDrop = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || statusRef.current !== 'PLAYING') return;

    const targetY = calculateGhostY(gridRef.current, piece);
    const dropDistance = targetY - piece.y;

    const updated = { ...piece, y: targetY };
    currentPieceRef.current = updated;
    setCurrentPiece(updated);

    sound.playHardDrop();
    setStats((prev) => ({
      ...prev,
      score: prev.score + dropDistance * SCORE_VALUES.HARD_DROP_PER_CELL,
    }));

    lockPiece();
  }, [lockPiece]);

  // Hold piece
  const hold = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || !canHoldRef.current || statusRef.current !== 'PLAYING') return;

    sound.playHold();
    canHoldRef.current = false;
    setCanHold(false);

    const prevHold = holdPieceRef.current;
    holdPieceRef.current = piece.type;
    setHoldPiece(piece.type);

    if (prevHold) {
      spawnPiece(prevHold);
    } else {
      spawnPiece();
    }
  }, [spawnPiece]);

  // Start new game
  const startGame = useCallback((selectedMode: GameMode = mode) => {
    const empty = createEmptyGrid();
    gridRef.current = empty;
    setGrid(empty);

    setMode(selectedMode);
    modeRef.current = selectedMode;

    bagRef.current = generateBag();
    nextQueueRef.current = [
      pullNextPiece(),
      pullNextPiece(),
      pullNextPiece(),
      pullNextPiece(),
      pullNextPiece(),
    ];
    setNextQueue([...nextQueueRef.current]);

    holdPieceRef.current = null;
    setHoldPiece(null);
    canHoldRef.current = true;
    setCanHold(true);

    const initialStats: GameStats = {
      score: 0,
      lines: 0,
      level: 1,
      combo: -1,
      maxCombo: 0,
      tetrisCount: 0,
      tSpins: 0,
      piecesPlaced: 0,
      elapsedTime: 0,
      remainingTime: 120000,
      backToBack: false,
    };
    statsRef.current = initialStats;
    setStats(initialStats);

    gameStartTimeRef.current = performance.now();
    pausedTimeOffsetRef.current = 0;
    lastDropTimeRef.current = performance.now();
    lastFrameTimeRef.current = performance.now();

    statusRef.current = 'PLAYING';
    setStatus('PLAYING');

    spawnPiece();
  }, [pullNextPiece, spawnPiece, mode]);

  // Pause / Resume
  const togglePause = useCallback(() => {
    if (statusRef.current === 'PLAYING') {
      statusRef.current = 'PAUSED';
      setStatus('PAUSED');
      pauseStartRef.current = performance.now();
      if (lockTimerRef.current) {
        window.clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
    } else if (statusRef.current === 'PAUSED') {
      pausedTimeOffsetRef.current += performance.now() - pauseStartRef.current;
      lastDropTimeRef.current = performance.now();
      lastFrameTimeRef.current = performance.now();
      statusRef.current = 'PLAYING';
      setStatus('PLAYING');
    }
  }, []);

  // Main 60fps game loop
  useEffect(() => {
    let animId: number;

    const gameLoop = (timestamp: number) => {
      if (statusRef.current === 'PLAYING') {
        const piece = currentPieceRef.current;

        // Update elapsed time
        const elapsed = timestamp - gameStartTimeRef.current - pausedTimeOffsetRef.current;
        setStats((prev) => {
          let remaining = prev.remainingTime;
          if (modeRef.current === 'ULTRA') {
            remaining = Math.max(0, 120000 - elapsed);
            if (remaining <= 0 && statusRef.current === 'PLAYING') {
              statusRef.current = 'VICTORY';
              setStatus('VICTORY');
              sound.playLevelUp();
              saveHighScore({
                id: `${Date.now()}-${Math.random()}`,
                mode: 'ULTRA',
                score: prev.score,
                lines: prev.lines,
                level: prev.level,
                timeMs: 120000,
                date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
              });
            }
          }
          return {
            ...prev,
            elapsedTime: elapsed,
            remainingTime: remaining,
          };
        });

        // Gravity drop
        if (piece) {
          const gravitySpeed = getGravitySpeed(statsRef.current.level);
          const dropInterval = isSoftDroppingRef.current ? Math.min(50, gravitySpeed / 8) : gravitySpeed;

          if (timestamp - lastDropTimeRef.current >= dropInterval) {
            lastDropTimeRef.current = timestamp;

            if (isValidPosition(gridRef.current, piece.shape, piece.x, piece.y + 1)) {
              const updated = { ...piece, y: piece.y + 1 };
              currentPieceRef.current = updated;
              setCurrentPiece(updated);

              if (isSoftDroppingRef.current) {
                sound.playSoftDrop();
                setStats((prev) => ({ ...prev, score: prev.score + SCORE_VALUES.SOFT_DROP_PER_CELL }));
              }
            } else {
              // Touching ground: start or continue lock delay
              if (!lockTimerRef.current) {
                lockTimerRef.current = window.setTimeout(lockPiece, LOCK_DELAY);
              }
            }
          }
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [lockPiece, saveHighScore]);

  // Keyboard controls with DAS (Delayed Auto Shift) & ARR (Auto Repeat Rate)
  useEffect(() => {
    const keysDown = new Set<string>();
    let dasTimer: number | null = null;
    let arrTimer: number | null = null;
    const DAS = 140; // initial delay before repeating
    const ARR = 32;  // repeat rate

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'c', 'C', 'z', 'Z', 'x', 'X', 'p', 'P', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause();
        return;
      }

      if (statusRef.current !== 'PLAYING') return;

      if (keysDown.has(e.code)) return;
      keysDown.add(e.code);

      if (e.code === 'ArrowLeft') {
        moveHorizontally(-1);
        dasTimer = window.setTimeout(() => {
          arrTimer = window.setInterval(() => {
            if (keysDown.has('ArrowLeft')) {
              moveHorizontally(-1);
            }
          }, ARR);
        }, DAS);
      } else if (e.code === 'ArrowRight') {
        moveHorizontally(1);
        dasTimer = window.setTimeout(() => {
          arrTimer = window.setInterval(() => {
            if (keysDown.has('ArrowRight')) {
              moveHorizontally(1);
            }
          }, ARR);
        }, DAS);
      } else if (e.code === 'ArrowUp' || e.code === 'KeyX') {
        rotatePiece('CW');
      } else if (e.code === 'KeyZ' || e.code === 'ControlLeft' || e.code === 'ControlRight') {
        rotatePiece('CCW');
      } else if (e.code === 'ArrowDown') {
        isSoftDroppingRef.current = true;
        softDrop();
      } else if (e.code === 'Space') {
        hardDrop();
      } else if (e.code === 'KeyC' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        hold();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.code);
      if (e.code === 'ArrowDown') {
        isSoftDroppingRef.current = false;
      }
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        if (dasTimer) {
          clearTimeout(dasTimer);
          dasTimer = null;
        }
        if (arrTimer) {
          clearInterval(arrTimer);
          arrTimer = null;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (dasTimer) clearTimeout(dasTimer);
      if (arrTimer) clearInterval(arrTimer);
    };
  }, [moveHorizontally, rotatePiece, softDrop, hardDrop, hold, togglePause]);

  return {
    mode,
    setMode,
    status,
    setStatus,
    grid,
    currentPiece,
    holdPiece,
    canHold,
    nextQueue,
    stats,
    highScores,
    clearEffect,
    startGame,
    togglePause,
    moveHorizontally,
    rotatePiece,
    softDrop,
    hardDrop,
    hold,
  };
}
