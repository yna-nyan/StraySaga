import React, { useEffect, useState } from 'react';
import { CatIcon } from './CatIcon';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from '../utils/audio';
import { VolumeX, Volume2, ArrowRight } from 'lucide-react';

interface PrologueProps {
  catName: string;
  avatarId: string;
  onComplete: () => void;
}

export const Prologue: React.FC<PrologueProps> = ({ catName, avatarId, onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const [flashScreen, setFlashScreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(audio.getMuted());

  useEffect(() => {
    audio.playTrafficAmbience();
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        audio.playCarHorn();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [step, onComplete]);

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
      audio.playMeow(1.3);
    } else {
      setFlashScreen(true);
      audio.playMeow(1.1);
      setTimeout(() => {
        onComplete();
      }, 1800);
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    audio.setMute(nextMute);
    setIsMuted(nextMute);
  };

  return (
    <div className="saga-screen min-h-screen text-editorial-ink flex flex-col justify-between p-6 md:p-12 relative overflow-hidden font-serif select-none" id="prologue-screen">
      {/* Background Graphic Lines to emulate editorial print page columns */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5 flex justify-between px-16">
        <div className="w-[1px] h-full bg-editorial-ink"></div>
        <div className="w-[1px] h-full bg-editorial-ink"></div>
        <div className="w-[1px] h-full bg-editorial-ink"></div>
      </div>

      {/* Utilities */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
        <button
          onClick={toggleMute}
          className="saga-button p-2 transition-colors cursor-pointer"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
        </button>
      </div>

      {/* Header Info */}
      <div className="z-10 max-w-4xl mx-auto w-full text-center mt-4">
        <span className="text-[10px] font-sans font-black tracking-[0.2em] text-[#f4c37c] uppercase">Stray Saga &bull; Act I</span>
        <h2 className="brand-title text-4xl md:text-6xl font-black tracking-normal uppercase mt-2">Leaving the Alley</h2>
        <div className="w-24 h-0.5 bg-[#f4c37c] mx-auto mt-4"></div>
      </div>

      {/* Narrative & Character Frame */}
      <div className="z-10 max-w-4xl mx-auto w-full flex-grow flex flex-col md:flex-row items-center justify-center gap-8 my-8" id="prologue-narrative-container">
        {/* Shivering Kitten Representation */}
        <div className="wood-frame w-48 h-48 flex items-center justify-center relative p-4">
          {/* Rain / Dew Particle Effects */}
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
            <div className="absolute w-0.5 h-6 bg-editorial-ink left-10 top-0 animate-rain"></div>
            <div className="absolute w-0.5 h-6 bg-editorial-ink left-24 top-0 animate-rain" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute w-0.5 h-6 bg-editorial-ink right-12 top-0 animate-rain" style={{ animationDelay: '0.8s' }}></div>
          </div>

          <CatIcon avatarId={avatarId} type="shivering" size={120} />
          
          <div className="saga-badge absolute -bottom-3 px-3 py-1 text-[9px] font-sans uppercase font-bold tracking-wider">
            {catName} (Shivering)
          </div>
        </div>

        {/* Text Story Frame */}
        <div className="parchment-panel flex-1 p-6 md:p-8 max-w-2xl">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div
                key="narrative-text"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="text-[10px] font-sans font-black text-editorial-ochre uppercase tracking-widest">The Scene Setting</div>
                <p className="text-editorial-ink text-base md:text-lg leading-relaxed font-sans">
                  Morning light hits the freezing asphalt. The dark alley opens toward the busy edge of the main road, where cars rush past like roaring, blurred giants. 
                </p>
                <p className="text-editorial-ink text-base md:text-lg leading-relaxed font-sans italic font-medium">
                  <strong>{catName}</strong> stands at the threshold, her small frame shivering against the cold wind and the violent vibration of the passing street traffic.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="monologue-text"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="text-[10px] font-sans font-black text-editorial-ochre uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-editorial-ink rounded-full"></span>
                  <span>{catName} (Inner Thoughts)</span>
                </div>
                <p className="text-editorial-ink text-lg md:text-xl font-medium leading-relaxed italic border-l-4 border-editorial-ochre pl-4 py-1 font-serif">
                  "The big metal beasts are so loud today. The ground shakes underneath my paws. My tummy is making that empty, angry rumbling sound again... I have to cross. I have to find something to eat. Just keep moving, little paws. Don't look at the wheels."
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls inside box */}
          <div className="mt-8 flex justify-end border-t border-editorial-ink/10 pt-4">
            <button
              onClick={handleNext}
              id="prologue-next-btn"
              className="saga-button font-sans font-black py-2.5 px-6 transition-all cursor-pointer flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              <span>{step === 0 ? 'Read Monologue' : 'Face the Street'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ground Line */}
      <div className="h-16 wood-frame z-10 flex items-center justify-between px-8 text-[#ffe0ad] font-sans text-[10px] uppercase tracking-[0.2em]">
        <span>CHAPTER I: THE ALLEYWAY</span>
        <span>BAKER'S NOOK</span>
      </div>

      {/* Screen Flash Transition "Start the Journey" */}
      <AnimatePresence>
        {flashScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 saga-screen z-50 flex flex-col items-center justify-center text-[#ffe0ad] font-black border-8 border-editorial-ink"
          >
            <motion.h1
              initial={{ scale: 0.8, letterSpacing: '0.1em' }}
              animate={{ scale: [1, 1.1, 1], letterSpacing: '0.2em' }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="brand-title text-4xl md:text-7xl uppercase tracking-widest font-black text-center font-serif"
            >
              Start Journey
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xs md:text-sm font-sans font-bold tracking-[0.2em] text-editorial-ochre uppercase mt-4"
            >
              Explore the city map and gather clues to survive...
			</motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
