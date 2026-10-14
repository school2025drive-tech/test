import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Pause, Play } from 'lucide-react';
import { sound } from '../utils/audio';

interface AudioControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
  gameStatus: string;
}

export function AudioControls({
  isPaused,
  onTogglePause,
  gameStatus,
}: AudioControlsProps) {
  const [sfx, setSfx] = useState<boolean>(sound.sfxEnabled);
  const [bgm, setBgm] = useState<boolean>(sound.bgmEnabled);
  const [volume, setVolume] = useState<number>(sound.volume);

  const toggleSfx = () => {
    const next = !sfx;
    setSfx(next);
    sound.setSfxEnabled(next);
  };

  const toggleBgm = () => {
    const next = !bgm;
    setBgm(next);
    sound.setBgmEnabled(next);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    sound.setVolume(val);
  };

  useEffect(() => {
    // If game pauses, stop BGM if desired or lower volume
    if (isPaused && bgm) {
      sound.stopBgm();
    } else if (!isPaused && bgm && gameStatus === 'PLAYING') {
      sound.startBgm();
    }
  }, [isPaused, bgm, gameStatus]);

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-400">오디오 및 설정</span>
        {gameStatus === 'PLAYING' || gameStatus === 'PAUSED' ? (
          <button
            onClick={onTogglePause}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isPaused ? '계속하기' : '일시정지'}</span>
          </button>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        {/* SFX Toggle */}
        <button
          onClick={toggleSfx}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
            sfx
              ? 'bg-slate-800 text-cyan-300 border-slate-700'
              : 'bg-slate-950/60 text-slate-500 border-slate-900'
          }`}
          title="효과음 켜기/끄기"
        >
          {sfx ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>SFX {sfx ? 'ON' : 'OFF'}</span>
        </button>

        {/* BGM Toggle */}
        <button
          onClick={toggleBgm}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
            bgm
              ? 'bg-slate-800 text-purple-300 border-slate-700'
              : 'bg-slate-950/60 text-slate-500 border-slate-900'
          }`}
          title="클래식 테마 배경음악 켜기/끄기"
        >
          <Music className="w-3.5 h-3.5" />
          <span>BGM {bgm ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Volume Slider */}
      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
        <span>음량</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          aria-label="음량 조절"
        />
        <span className="font-mono-num w-7 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
}
