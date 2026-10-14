import { GameMode } from '../types/tetris';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

interface TopBarProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onOpenLeaderboard: () => void;
  onOpenGuide: () => void;
  onStartNewGame: () => void;
}

export function TopBar({
  currentMode,
  onSelectMode,
  onOpenLeaderboard,
  onOpenGuide,
  onStartNewGame,
}: TopBarProps) {
  const { user, loginWithGoogle, logout } = useAuth();

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <a
          href="/"
          className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-[2px] bg-cyan-400 inline-block shadow-sm shadow-cyan-400" />
          <span>Tetris Arcade</span>
        </a>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectMode('MARATHON')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentMode === 'MARATHON' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          마라톤
        </button>
        <button
          onClick={() => onSelectMode('SPRINT')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentMode === 'SPRINT' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          스프린트 (40줄)
        </button>
        <button
          onClick={() => onSelectMode('ULTRA')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentMode === 'ULTRA' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          울트라 (2분)
        </button>
        <button
          onClick={onOpenLeaderboard}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          순위표
        </button>
        <button
          onClick={onOpenGuide}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          조작법
        </button>
      </nav>

      {/* Zone 3: 1 primary action button + User Auth */}
      <div className="flex items-center gap-3 shrink-0">
        {user ? (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 py-1 px-2.5 rounded-lg text-xs">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-5 h-5 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-cyan-400" />
            )}
            <span className="text-slate-300 font-medium max-w-[90px] truncate hidden sm:inline">
              {user.displayName || '플레이어'}
            </span>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-slate-300 transition-colors ml-1"
              title="로그아웃"
              aria-label="로그아웃"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <LogIn className="w-3.5 h-3.5 text-cyan-400" />
            <span>로그인</span>
          </button>
        )}

        <button
          onClick={onStartNewGame}
          className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-md shadow-cyan-950"
        >
          새 게임 시작
        </button>
      </div>
    </header>
  );
}
