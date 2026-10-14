import { useState, useEffect } from 'react';
import { GameMode, GameStats, GameStatus } from '../types/tetris';
import { RotateCcw, Trophy, Award, CheckCircle2, LogIn, CloudUpload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitGlobalScore } from '../services/scoreService';

interface GameOverModalProps {
  status: GameStatus;
  mode: GameMode;
  stats: GameStats;
  onRestart: () => void;
  onOpenLeaderboard: () => void;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
}

export function GameOverModal({
  status,
  mode,
  stats,
  onRestart,
  onOpenLeaderboard,
}: GameOverModalProps) {
  const { user, loginWithGoogle } = useAuth();
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if ((status === 'GAME_OVER' || status === 'VICTORY') && user && !submitted && !submitting && stats.score > 0) {
      setSubmitting(true);
      submitGlobalScore({
        mode,
        score: stats.score,
        lines: stats.lines,
        level: stats.level,
        timeMs: stats.elapsedTime,
      })
        .then(() => {
          setSubmitted(true);
        })
        .catch((err) => {
          console.error('Failed to submit score:', err);
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  }, [status, user, submitted, submitting, mode, stats]);

  // Reset submitted state when game restarts
  useEffect(() => {
    if (status === 'PLAYING') {
      setSubmitted(false);
      setSubmitting(false);
    }
  }, [status]);

  if (status !== 'GAME_OVER' && status !== 'VICTORY') return null;

  const isVictory = status === 'VICTORY';
  const modeName =
    mode === 'MARATHON' ? '마라톤' : mode === 'SPRINT' ? '40줄 스프린트' : '2분 울트라';

  const handleManualSubmit = async () => {
    if (!user) {
      await loginWithGoogle();
      return;
    }
    setSubmitting(true);
    try {
      await submitGlobalScore({
        mode,
        score: stats.score,
        lines: stats.lines,
        level: stats.level,
        timeMs: stats.elapsedTime,
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col p-6 text-center">
        {/* Icon & Title */}
        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-slate-800 border border-slate-700/80">
          {isVictory ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          ) : (
            <Award className="w-6 h-6 text-rose-400" />
          )}
        </div>

        <h2 className="text-xl font-bold text-slate-100">
          {isVictory ? '목표 달성!' : '게임 오버'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">{modeName} 모드 결과</p>

        {/* Primary Score */}
        <div className="my-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 tracking-wider">최종 점수</div>
          <div className="text-3xl font-extrabold font-mono-num text-amber-400 mt-1">
            {stats.score.toLocaleString()}
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-2 gap-2 text-left mb-4">
          <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/50">
            <span className="text-[11px] text-slate-400 block">클리어한 줄</span>
            <span className="text-sm font-bold font-mono-num text-slate-200">
              {stats.lines} 줄
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/50">
            <span className="text-[11px] text-slate-400 block">최대 콤보</span>
            <span className="text-sm font-bold font-mono-num text-slate-200">
              {stats.maxCombo > 0 ? `${stats.maxCombo} Combo` : '-'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/50">
            <span className="text-[11px] text-slate-400 block">테트리스 (4줄)</span>
            <span className="text-sm font-bold font-mono-num text-cyan-400">
              {stats.tetrisCount} 회
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/50">
            <span className="text-[11px] text-slate-400 block">플레이 시간</span>
            <span className="text-sm font-bold font-mono-num text-emerald-400">
              {formatDuration(stats.elapsedTime)}
            </span>
          </div>
        </div>

        {/* Firebase Global Leaderboard Status */}
        <div className="mb-5">
          {submitted ? (
            <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>글로벌 랭킹(Firebase)에 등록 완료되었습니다!</span>
            </div>
          ) : user ? (
            submitting ? (
              <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-950/50 border border-slate-800/60 text-xs text-slate-400">
                <CloudUpload className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                <span>글로벌 랭킹 등록 중...</span>
              </div>
            ) : null
          ) : (
            <button
              onClick={handleManualSubmit}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google 로그인하고 글로벌 랭킹 등록</span>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 플레이</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>순위표 보기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
