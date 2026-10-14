import { GameMode } from '../types/tetris';
import { Play, Zap, Flame, Clock, Trophy, HelpCircle, LogIn, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TitleMenuProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  onOpenGuide: () => void;
}

export function TitleMenu({
  selectedMode,
  onSelectMode,
  onStartGame,
  onOpenLeaderboard,
  onOpenGuide,
}: TitleMenuProps) {
  const { user, loginWithGoogle } = useAuth();

  const modes: {
    id: GameMode;
    title: string;
    description: string;
    icon: typeof Flame;
    color: string;
    border: string;
  }[] = [
    {
      id: 'MARATHON',
      title: '마라톤 모드',
      description: '클래식 정통 테트리스. 10줄마다 레벨업하며 최고 점수를 갱신하세요.',
      icon: Flame,
      color: 'text-amber-400',
      border: 'border-amber-500/40',
    },
    {
      id: 'SPRINT',
      title: '40줄 스프린트',
      description: '가장 빠른 시간 안에 40줄을 클리어하는 스피드런 기록 모드입니다.',
      icon: Zap,
      color: 'text-cyan-400',
      border: 'border-cyan-500/40',
    },
    {
      id: 'ULTRA',
      title: '2분 울트라',
      description: '2분(120초) 동안 콤보와 테트리스를 노려 최고 점수를 획득하세요.',
      icon: Clock,
      color: 'text-purple-400',
      border: 'border-purple-500/40',
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto py-8 px-4 flex flex-col items-center text-center">
      {/* Brand Title */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-3 h-3 rounded-[3px] bg-cyan-400 inline-block shadow-sm shadow-cyan-400" />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          TETRIS ARCADE
        </h1>
      </div>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        정통 7-Bag 시스템과 SRS 슈퍼 로테이션, Firebase 실시간 글로벌 순위표 지원
      </p>

      {/* User Login Banner */}
      <div className="mb-6">
        {user ? (
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-4 h-4 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>
              <strong className="text-white">{user.displayName || '플레이어'}</strong> 님으로 로그인됨 (클라우드 동기화 활성)
            </span>
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-cyan-400" />
            <span>Google 계정으로 로그인하여 글로벌 순위표에 참가하세요</span>
          </button>
        )}
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-8">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = selectedMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`flex flex-col items-start text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? `bg-slate-900 ${m.border} shadow-lg ring-1 ring-cyan-500/50`
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${m.color}`} />
                <span className="font-bold text-sm text-slate-100">{m.title}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{m.description}</p>
            </button>
          );
        })}
      </div>

      {/* Primary Action Button */}
      <button
        onClick={onStartGame}
        className="w-full sm:w-64 py-3.5 px-6 rounded-xl font-bold text-base text-white bg-cyan-600 hover:bg-cyan-500 shadow-xl shadow-cyan-950/60 transition-all flex items-center justify-center gap-2 transform active:scale-95"
      >
        <Play className="w-5 h-5 fill-current" />
        <span>게임 시작</span>
      </button>

      {/* Secondary Actions */}
      <div className="flex items-center gap-4 mt-6 text-xs text-slate-400">
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>순위표 기록</span>
        </button>
        <span className="text-slate-700">·</span>
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>조작법 안내</span>
        </button>
      </div>
    </div>
  );
}
