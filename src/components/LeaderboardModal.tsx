import { useState, useEffect } from 'react';
import { GameMode, HighScoreRecord } from '../types/tetris';
import { X, Trophy, Trash2, Globe, User, RefreshCw } from 'lucide-react';
import { subscribeGlobalScores, GlobalScoreRecord } from '../services/scoreService';

interface LeaderboardModalProps {
  records: HighScoreRecord[];
  isOpen: boolean;
  onClose: () => void;
  onClearRecords: () => void;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
}

export function LeaderboardModal({
  records,
  isOpen,
  onClose,
  onClearRecords,
}: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<GameMode>('MARATHON');
  const [scope, setScope] = useState<'GLOBAL' | 'LOCAL'>('GLOBAL');
  const [globalScores, setGlobalScores] = useState<GlobalScoreRecord[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || scope !== 'GLOBAL') return;

    setLoadingGlobal(true);
    const unsubscribe = subscribeGlobalScores(activeTab, (scores) => {
      setGlobalScores(scores);
      setLoadingGlobal(false);
    });

    return () => unsubscribe();
  }, [isOpen, scope, activeTab]);

  if (!isOpen) return null;

  const localFiltered = records
    .filter((r) => r.mode === activeTab)
    .sort((a, b) => {
      if (activeTab === 'SPRINT') {
        return a.timeMs - b.timeMs;
      }
      return b.score - a.score;
    })
    .slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100">순위표 & 최고 기록</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global vs Local Scope Selector */}
        <div className="flex items-center justify-center gap-2 px-6 pt-3 pb-1">
          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl w-full">
            <button
              onClick={() => setScope('GLOBAL')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                scope === 'GLOBAL'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>글로벌 랭킹 (Firebase)</span>
            </button>
            <button
              onClick={() => setScope('LOCAL')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                scope === 'LOCAL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>내 로컬 기록</span>
            </button>
          </div>
        </div>

        {/* Segmented Mode Selector */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setActiveTab('MARATHON')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'MARATHON'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              마라톤
            </button>
            <button
              onClick={() => setActiveTab('SPRINT')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'SPRINT'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              40줄 스프린트
            </button>
            <button
              onClick={() => setActiveTab('ULTRA')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'ULTRA'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2분 울트라
            </button>
          </div>
        </div>

        {/* Records List */}
        <div className="p-4 max-h-72 overflow-y-auto min-h-[220px]">
          {scope === 'GLOBAL' ? (
            loadingGlobal && globalScores.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                <span>글로벌 랭킹을 불러오는 중...</span>
              </div>
            ) : globalScores.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                아직 글로벌 기록이 없습니다. 게임을 완료하여 첫 번째 주인공이 되어보세요!
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {globalScores.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2.5 px-2 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono-num font-bold text-xs w-5 text-center ${
                          idx === 0
                            ? 'text-amber-400'
                            : idx === 1
                            ? 'text-slate-300'
                            : idx === 2
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      {item.userPhoto ? (
                        <img
                          src={item.userPhoto}
                          alt={item.userName}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-cyan-400 font-bold shrink-0">
                          {item.userName[0]?.toUpperCase() || 'P'}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-200 text-xs">
                          {item.userName}
                        </div>
                        <div className="font-mono-num font-bold text-cyan-400 text-xs">
                          {activeTab === 'SPRINT'
                            ? formatDuration(item.timeMs)
                            : `${item.score.toLocaleString()} 점`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono-num text-slate-400 block">
                        Lv.{item.level}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {item.lines}줄
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : localFiltered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              아직 로컬 기록이 없습니다. 게임을 시작해보세요!
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {localFiltered.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2.5 px-2 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono-num font-bold text-xs w-5 text-center ${
                        idx === 0
                          ? 'text-amber-400'
                          : idx === 1
                          ? 'text-slate-300'
                          : idx === 2
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-mono-num font-bold text-slate-200">
                        {activeTab === 'SPRINT'
                          ? formatDuration(item.timeMs)
                          : `${item.score.toLocaleString()} 점`}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.date} · {item.lines}줄 클리어
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono-num text-slate-400">
                      Lv.{item.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/60">
          {scope === 'LOCAL' && localFiltered.length > 0 ? (
            <button
              onClick={onClearRecords}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>로컬 기록 초기화</span>
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
