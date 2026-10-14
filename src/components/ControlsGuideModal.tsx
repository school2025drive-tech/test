import { X, Keyboard, Smartphone } from 'lucide-react';

interface ControlsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ControlsGuideModal({ isOpen, onClose }: ControlsGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">조작 방법 및 가이드</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm max-h-[75vh] overflow-y-auto">
          {/* Keyboard Controls */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-slate-500" />
              키보드 조작
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-400">좌 / 우 이동</span>
                <span className="font-mono-num font-semibold text-slate-200">← / →</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-400">소프트 드롭</span>
                <span className="font-mono-num font-semibold text-slate-200">↓</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-400">하드 드롭</span>
                <span className="font-mono-num font-semibold text-cyan-400">Space</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-400">시계방향 회전</span>
                <span className="font-mono-num font-semibold text-purple-400">↑ / X</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-400">반시계 회전</span>
                <span className="font-mono-num font-semibold text-purple-400">Z / Ctrl</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-400">블록 홀드</span>
                <span className="font-mono-num font-semibold text-amber-400">C / Shift</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 col-span-2">
                <span className="text-slate-400">일시 정지</span>
                <span className="font-mono-num font-semibold text-slate-200">P / ESC</span>
              </div>
            </div>
          </div>

          {/* Touch Controls */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider mb-2 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-500" />
              모바일 & 터치 조작
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              화면 하단의 터치 패드를 이용해 방향 이동, 회전, 즉시 낙하(DROP), 홀드(HOLD)를
              터치할 수 있으며 햅틱 진동 피드백이 제공됩니다.
            </p>
          </div>

          {/* Official SRS Rules */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider mb-2">
              정통 테트리스 가이드라인 규칙
            </h3>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
              <li>
                <strong className="text-slate-300">7-Bag 시스템:</strong> 7가지 블록이 한 묶음으로 골고루 배정되어 긴 블록 기근이 없습니다.
              </li>
              <li>
                <strong className="text-slate-300">SRS 회전 및 월킥:</strong> 벽에 닿아 있거나 바닥에 닿은 상태에서도 회전 킥이 적용되어 부드러운 컨트롤이 가능합니다.
              </li>
              <li>
                <strong className="text-slate-300">락 딜레이 (Lock Delay):</strong> 바닥 접촉 후 0.5초의 유예 시간이 주어지며 이동이나 회전 시 최대 15회까지 연장됩니다.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
