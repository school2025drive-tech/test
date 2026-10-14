import { useState } from 'react';
import { useTetris } from './hooks/useTetris';
import { GameMode } from './types/tetris';
import { TopBar } from './components/TopBar';
import { TetrisBoard } from './components/TetrisBoard';
import { HoldQueue } from './components/HoldQueue';
import { NextQueue } from './components/NextQueue';
import { GameHUD } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { AudioControls } from './components/AudioControls';
import { TitleMenu } from './components/TitleMenu';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ControlsGuideModal } from './components/ControlsGuideModal';
import { GameOverModal } from './components/GameOverModal';
import { PiecePreview } from './components/PiecePreview';

export default function App() {
  const {
    mode,
    setMode,
    status,
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
  } = useTetris();

  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleSelectMode = (newMode: GameMode) => {
    setMode(newMode);
    if (status === 'PLAYING' || status === 'PAUSED') {
      startGame(newMode);
    }
  };

  const handleClearRecords = () => {
    localStorage.removeItem('tetris_arcade_high_scores_v1');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Bar following 3-Zone Contract */}
      <TopBar
        currentMode={mode}
        onSelectMode={handleSelectMode}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onStartNewGame={() => startGame(mode)}
      />

      {/* Main Content Arena */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-5xl mx-auto">
        {status === 'TITLE' ? (
          <TitleMenu
            selectedMode={mode}
            onSelectMode={setMode}
            onStartGame={() => startGame(mode)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Mobile Compact HUD (< md screens) */}
            <div className="flex md:hidden items-center justify-between w-full max-w-[320px] mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold">HOLD</span>
                <PiecePreview type={holdPiece} dimmed={!canHold} size="sm" />
              </div>

              <div className="text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">SCORE</span>
                <span className="text-base font-bold font-mono-num text-amber-400">
                  {stats.score.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold">NEXT</span>
                <PiecePreview type={nextQueue[0] || null} size="sm" />
              </div>
            </div>

            {/* Main Desktop & Tablet Game Layout */}
            <div className="flex items-start justify-center gap-4 sm:gap-6 w-full max-w-4xl">
              {/* Left Column: Hold & Audio */}
              <div className="hidden md:flex flex-col gap-4 w-44 shrink-0">
                <HoldQueue holdPiece={holdPiece} canHold={canHold} />
                <AudioControls
                  isPaused={status === 'PAUSED'}
                  onTogglePause={togglePause}
                  gameStatus={status}
                />
              </div>

              {/* Center Column: 10x20 Game Board */}
              <div className="flex flex-col items-center shrink-0">
                <TetrisBoard
                  grid={grid}
                  currentPiece={currentPiece}
                  clearEffect={clearEffect}
                  isPaused={status === 'PAUSED'}
                />

                {/* Touch Controls for Mobile / Tablets */}
                <div className="w-full mt-3">
                  <TouchControls
                    onMoveLeft={() => moveHorizontally(-1)}
                    onMoveRight={() => moveHorizontally(1)}
                    onSoftDrop={softDrop}
                    onHardDrop={hardDrop}
                    onRotateCW={() => rotatePiece('CW')}
                    onRotateCCW={() => rotatePiece('CCW')}
                    onHold={hold}
                    disabled={status !== 'PLAYING'}
                  />
                </div>
              </div>

              {/* Right Column: Next Queue & HUD */}
              <div className="hidden md:flex flex-col gap-4 w-48 shrink-0">
                <NextQueue queue={nextQueue} />
                <GameHUD mode={mode} stats={stats} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <LeaderboardModal
        records={highScores}
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        onClearRecords={handleClearRecords}
      />

      <ControlsGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <GameOverModal
        status={status}
        mode={mode}
        stats={stats}
        onRestart={() => startGame(mode)}
        onOpenLeaderboard={() => {
          setIsLeaderboardOpen(true);
        }}
      />
    </div>
  );
}
