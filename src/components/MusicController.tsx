import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MusicControllerProps {
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  theme?: 'parchment' | 'dark' | 'map';
  align?: 'left' | 'right';
  direction?: 'up' | 'down';
}

export const MusicController: React.FC<MusicControllerProps> = ({
  playing,
  setPlaying,
  volume,
  setVolume,
  muted,
  setMuted,
  theme = 'parchment',
  align = 'left',
  direction = 'down'
}) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close overlay on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOverlay && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowOverlay(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOverlay]);

  // Styling maps based on theme prop
  const isMap = theme === 'map';
  const isDark = theme === 'dark';

  const getPlayBtnClass = () => {
    if (isMap) {
      return playing
        ? 'bg-editorial-ochre text-editorial-bg hover:bg-editorial-ochre hover:text-editorial-bg w-5 h-5 flex items-center justify-center border border-editorial-ink shadow-[2px_2px_0px_#2D2A26] transition-colors cursor-pointer select-none shrink-0'
        : 'bg-editorial-bg hover:bg-editorial-ochre text-editorial-ink w-5 h-5 flex items-center justify-center border border-editorial-ink shadow-[2px_2px_0px_#2D2A26] transition-colors cursor-pointer select-none shrink-0';
    }
    if (isDark) {
      return playing
        ? 'bg-[#ebd5b3] text-[#2c1a11] hover:bg-[#ebd5b3]/80 border border-[#5d3d28] w-8 h-8 flex items-center justify-center transition-colors cursor-pointer rounded-xs shrink-0'
        : 'bg-[#2c1a11]/90 hover:bg-[#ebd5b3]/30 border border-[#5d3d28] text-[#ebd5b3] w-8 h-8 flex items-center justify-center transition-colors cursor-pointer rounded-xs shrink-0';
    }
    return playing
      ? 'bg-editorial-ochre text-editorial-bg hover:bg-editorial-ochre hover:text-editorial-bg border border-editorial-ink w-8 h-8 flex items-center justify-center transition-colors cursor-pointer rounded-xs shrink-0'
      : 'bg-editorial-bg hover:bg-editorial-ochre border border-editorial-ink text-editorial-ink w-8 h-8 flex items-center justify-center transition-colors cursor-pointer rounded-xs shrink-0';
  };

  const getMuteBtnClass = () => {
    const isActive = muted || volume === 0 || showOverlay;
    if (isMap) {
      return isActive
        ? 'bg-editorial-ochre text-editorial-bg hover:bg-editorial-ochre hover:text-editorial-bg w-5 h-5 flex items-center justify-center border border-editorial-ink shadow-[2px_2px_0px_#2D2A26] transition-colors cursor-pointer select-none shrink-0'
        : 'bg-editorial-bg hover:bg-editorial-ochre text-editorial-ink w-5 h-5 flex items-center justify-center border border-editorial-ink shadow-[2px_2px_0px_#2D2A26] transition-colors cursor-pointer select-none shrink-0';
    }
    if (isDark) {
      return isActive
        ? 'bg-[#ebd5b3] text-[#2c1a11] hover:bg-[#ebd5b3]/80 border border-[#5d3d28] w-8 h-8 flex items-center justify-center transition-colors cursor-pointer rounded-xs shrink-0'
        : 'bg-[#2c1a11]/90 hover:bg-[#ebd5b3]/30 border border-[#5d3d28] text-[#ebd5b3] w-8 h-8 flex items-center justify-center transition-colors cursor-pointer rounded-xs shrink-0';
    }
    return isActive
      ? 'bg-editorial-ochre text-editorial-bg hover:bg-editorial-ochre hover:text-editorial-bg border border-editorial-ink w-8 h-8 flex items-center justify-center transition-colors cursor-pointer rounded-xs shrink-0'
      : 'bg-editorial-bg hover:bg-editorial-ochre border border-editorial-ink text-editorial-ink w-8 h-8 flex items-center justify-center transition-colors cursor-pointer rounded-xs shrink-0';
  };

  const positionClass = direction === 'up' ? 'bottom-7' : 'top-9';
  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  const overlayClass = isDark
    ? `absolute ${positionClass} ${alignClass} bg-[#2c1a11] border-2 border-[#5d3d28] p-3 shadow-2xl rounded-md w-48 z-50 text-[#ebd5b3] font-sans`
    : `absolute ${positionClass} ${alignClass} bg-editorial-bg border border-editorial-ink p-3 shadow-md rounded-xs w-48 z-50 text-editorial-ink font-sans`;

  const labelClass = 'text-[10px] uppercase font-black tracking-wider block mb-1';
  const rangeClass = isDark
    ? 'w-full accent-[#ebd5b3] cursor-pointer h-1 bg-[#5d3d28] rounded-lg appearance-none'
    : 'w-full accent-editorial-ochre cursor-pointer h-1 bg-editorial-ink/20 rounded-lg appearance-none';

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      {/* Play/Pause Button */}
      <button
        onClick={() => setPlaying(!playing)}
        className={getPlayBtnClass()}
        title={playing ? 'Pause Soundtrack' : 'Play Soundtrack'}
      >
        {playing ? (
          <Pause className={isMap ? 'w-2.5 h-2.5' : 'w-4 h-4'} />
        ) : (
          <Play className={isMap ? 'w-2.5 h-2.5 ml-0.5' : 'w-4 h-4 ml-0.5'} />
        )}
      </button>

      {/* Volume/Overlay Control Button */}
      <button
        onClick={() => setShowOverlay(!showOverlay)}
        className={getMuteBtnClass()}
        title="Volume & Mute Options"
      >
        <Music className={isMap ? 'w-2.5 h-2.5' : 'w-4 h-4'} />
      </button>

      {/* Volume & Mute Popover Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0, y: direction === 'up' ? -5 : 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction === 'up' ? -5 : 5 }}
            transition={{ duration: 0.15 }}
            className={overlayClass}
            style={isMap ? (direction === 'up' ? { bottom: '24px', top: 'auto' } : { top: '24px' }) : {}}
          >
            <div className="flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-center gap-1.5 border-b border-current/10 pb-1.5">
                <Music className="w-3.5 h-3.5 text-editorial-ochre shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest">Soundtrack Settings</span>
              </div>

              {/* Volume Slider */}
              <div>
                <div className="flex justify-between items-center text-[9px] font-bold mb-1">
                  <span className={labelClass}>Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (muted && parseFloat(e.target.value) > 0) {
                      setMuted(false);
                    }
                  }}
                  className={rangeClass}
                />
              </div>

              {/* Mute Toggle */}
              <label className="flex items-center gap-2 cursor-pointer py-1 hover:opacity-85 select-none">
                <input
                  type="checkbox"
                  checked={muted}
                  onChange={(e) => setMuted(e.target.checked)}
                  className="rounded-xs focus:ring-0 w-3 h-3 text-editorial-ochre"
                />
                <span className="text-[10px] font-bold uppercase tracking-wider">Mute Soundtrack</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
