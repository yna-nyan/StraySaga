import React, { useState } from 'react';
import { AVATARS } from '../data/storyData';
import { CatIcon } from './CatIcon';
import { Avatar } from '../types';
import { motion } from 'motion/react';
import { ShieldAlert, Heart, Info, Volume2 } from 'lucide-react';
import { audio } from '../utils/audio';
import { MusicController } from './MusicController';
import backgroundImg from '../assets/Background.png';
import beginJourneyImg from '../assets/Begin_Journey_Button.png';
import nameFieldImg from '../assets/Name_Text_Field.png';
import buttonClickSound from '../utils/Button Sound.mp3';

interface AvatarSelectionProps {
  onSelect: (name: string, avatarId: string) => void;
  hope?: number;
  musicPlaying: boolean;
  setMusicPlaying: (playing: boolean) => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
  musicMuted: boolean;
  setMusicMuted: (muted: boolean) => void;
}

const PawPrint = ({ className, size = 20, style }: { className?: string, size?: number, style?: React.CSSProperties }) => (
  <svg 
    className={className} 
    style={{ width: size, height: size, ...style }} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <ellipse cx="6.5" cy="8.5" rx="1.8" ry="2.2" transform="rotate(-15 6.5 8.5)" />
    <ellipse cx="10.2" cy="5.5" rx="1.9" ry="2.4" transform="rotate(-5 10.2 5.5)" />
    <ellipse cx="14.2" cy="5.5" rx="1.9" ry="2.4" transform="rotate(5 14.2 5.5)" />
    <ellipse cx="17.8" cy="9" rx="1.8" ry="2.2" transform="rotate(18 17.8 9)" />
    <path d="M12 9.2c-2.4 0-4.3 1.6-4.5 3.8-.1.9.4 1.7 1.2 2 1.1.4 2.2.1 3.3.4.6.2.7.7 1 .7s.4-.5 1-.7c1.1-.3 2.2.1 3.3-.4.8-.3 1.3-1.1 1.2-2-.2-2.2-2.1-3.8-4.5-3.8z" />
  </svg>
);

const OrnateCorners: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
  const strokeColor = isSelected ? '#d9a352' : '#8b5d3a';
  return (
    <>
      <svg className="absolute top-2 left-2 w-4 h-4 pointer-events-none opacity-60" viewBox="0 0 10 10" fill="none" stroke={strokeColor} strokeWidth="0.75">
        <path d="M 1 4 L 1 1 L 4 1 M 2 2.5 L 3.5 2.5 M 2.5 2 L 2.5 3.5" strokeLinecap="round" />
        <circle cx="2.5" cy="2.5" r="0.5" fill={strokeColor} />
      </svg>
      <svg className="absolute top-2 right-2 w-4 h-4 pointer-events-none transform rotate-90 opacity-60" viewBox="0 0 10 10" fill="none" stroke={strokeColor} strokeWidth="0.75">
        <path d="M 1 4 L 1 1 L 4 1 M 2 2.5 L 3.5 2.5 M 2.5 2 L 2.5 3.5" strokeLinecap="round" />
        <circle cx="2.5" cy="2.5" r="0.5" fill={strokeColor} />
      </svg>
      <svg className="absolute bottom-2 left-2 w-4 h-4 pointer-events-none transform -rotate-90 opacity-60" viewBox="0 0 10 10" fill="none" stroke={strokeColor} strokeWidth="0.75">
        <path d="M 1 4 L 1 1 L 4 1 M 2 2.5 L 3.5 2.5 M 2.5 2 L 2.5 3.5" strokeLinecap="round" />
        <circle cx="2.5" cy="2.5" r="0.5" fill={strokeColor} />
      </svg>
      <svg className="absolute bottom-2 right-2 w-4 h-4 pointer-events-none transform rotate-180 opacity-60" viewBox="0 0 10 10" fill="none" stroke={strokeColor} strokeWidth="0.75">
        <path d="M 1 4 L 1 1 L 4 1 M 2 2.5 L 3.5 2.5 M 2.5 2 L 2.5 3.5" strokeLinecap="round" />
        <circle cx="2.5" cy="2.5" r="0.5" fill={strokeColor} />
      </svg>
    </>
  );
};

const OrnateCornersLarge = () => (
  <>
    <svg className="absolute top-1.5 left-1.5 w-6 h-6 text-[#9c6b43]/80 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M 2 12 L 2 2 L 12 2 M 4 4 L 8 4 M 4 4 L 4 8" strokeLinecap="round" />
      <circle cx="4" cy="4" r="1" fill="currentColor" />
    </svg>
    <svg className="absolute top-1.5 right-1.5 w-6 h-6 text-[#9c6b43]/80 pointer-events-none transform rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M 2 12 L 2 2 L 12 2 M 4 4 L 8 4 M 4 4 L 4 8" strokeLinecap="round" />
      <circle cx="4" cy="4" r="1" fill="currentColor" />
    </svg>
    <svg className="absolute bottom-1.5 left-1.5 w-6 h-6 text-[#9c6b43]/80 pointer-events-none transform -rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M 2 12 L 2 2 L 12 2 M 4 4 L 8 4 M 4 4 L 4 8" strokeLinecap="round" />
      <circle cx="4" cy="4" r="1" fill="currentColor" />
    </svg>
    <svg className="absolute bottom-1.5 right-1.5 w-6 h-6 text-[#9c6b43]/80 pointer-events-none transform rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M 2 12 L 2 2 L 12 2 M 4 4 L 8 4 M 4 4 L 4 8" strokeLinecap="round" />
      <circle cx="4" cy="4" r="1" fill="currentColor" />
    </svg>
  </>
);

export const AvatarSelection: React.FC<AvatarSelectionProps> = ({
  onSelect,
  hope = 0,
  musicPlaying,
  setMusicPlaying,
  musicVolume,
  setMusicVolume,
  musicMuted,
  setMusicMuted
}) => {
  const [selectedId, setSelectedId] = useState<string>('calico');
  const [customName, setCustomName] = useState<string>('Luna');
  const [audioPromptShown, setAudioPromptShown] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'details' | 'stats' | 'journey'>('details');

  const selectedAvatar = AVATARS.find(a => a.id === selectedId) || AVATARS[0];

  const playTabSound = () => {
    try {
      const fx = new Audio(buttonClickSound);
      fx.volume = 0.6;
      fx.play();
    } catch (err) {
      console.warn("Audio element playback failed:", err);
    }
  };

  const handleTabChange = (tab: 'details' | 'stats' | 'journey') => {
    setActiveTab(tab);
    playTabSound();
  };

  const handleAvatarChange = (avatar: Avatar) => {
    setSelectedId(avatar.id);
    setCustomName(avatar.name);
    audio.playMeow(1.2);
  };

  const handleStart = () => {
    const finalName = customName.trim() || selectedAvatar.name;
    onSelect(finalName, selectedId);
  };

  const enableAudio = () => {
    audio.setMute(false);
    audio.playMeow(1.1);
    setMusicPlaying(true);
    setAudioPromptShown(false);
  };

  const renderCard = (avatar: Avatar) => {
    const isSelected = avatar.id === selectedId;
    const displayBreed = avatar.breed === 'Calico' ? 'LUNA' : avatar.breed === 'Bombay Black' ? 'SHADOW' : avatar.breed === 'White Cat' ? 'COOKIE' : avatar.breed.toUpperCase();

    return (
      <button
        key={avatar.id}
        id={`avatar-btn-${avatar.id}`}
        onClick={() => handleAvatarChange(avatar)}
        className={`relative p-3 border-2 transition-all flex flex-col items-center justify-between text-center cursor-pointer w-full h-full overflow-hidden rounded-lg ${
          isSelected 
            ? 'bg-gradient-to-b from-[#fffbf0] to-[#f4e4c9] text-editorial-ink border-[#ffe395]' 
            : 'bg-gradient-to-b from-[#eadecc] to-[#cfba9e] text-editorial-ink border-[#5d3d28]/60 hover:border-[#ffd875] hover:brightness-105'
        }`}
        style={isSelected ? {
          boxShadow: 'inset 0 0 15px rgba(255, 240, 180, 0.6), 0 0 20px rgba(255, 216, 117, 0.7)'
        } : {}}
      >
        <div className="absolute inset-1.5 border border-[#8b5d3a]/20 rounded-md pointer-events-none"></div>

        <OrnateCorners isSelected={isSelected} />

        {isSelected && (
          <div className="absolute top-2.5 right-[-6px] h-6 flex items-center z-30">
            <div className="relative bg-gradient-to-r from-[#5a8f1c] to-[#3f6212] text-white text-[9px] font-sans font-bold px-3 py-1 border-y border-r border-[#ffd875] shadow-md flex items-center gap-1 pl-4"
                 style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% 100%, 8px 100%, 0% 50%)' }}>
              <span className="text-[9px]">✓</span>
              <span>Selected</span>
            </div>
            <div className="absolute right-0 bottom-[-4px] w-[6px] h-[4px] bg-[#22400f]" 
                 style={{ clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)' }}></div>
          </div>
        )}

        {isSelected && (
          <div className="absolute inset-0 pointer-events-none text-[#734a29]/20">
            <PawPrint size={22} className="absolute top-4 left-4 transform -rotate-12" />
            <PawPrint size={14} className="absolute top-12 left-3 transform rotate-6" />
            <PawPrint size={18} className="absolute top-16 right-3 transform rotate-20" />
            <PawPrint size={15} className="absolute bottom-14 right-4 transform -rotate-10" />
            <PawPrint size={22} className="absolute bottom-4 right-4 transform rotate-15" />
            <PawPrint size={16} className="absolute bottom-4 left-5 transform -rotate-25" />
          </div>
        )}

        <div className="flex-grow flex items-center justify-center z-10 pointer-events-none my-1">
          <CatIcon 
            avatarId={avatar.id} 
            type="portrait" 
            size={96} 
            className={`transition-all ${isSelected ? 'scale-105 brightness-105' : 'opacity-95'}`}
          />
        </div>
        
        <div className="relative z-20 w-full shrink-0">
          <span className="font-sans font-black uppercase text-sm tracking-wider block leading-none mb-0.5 text-[#422a1d]">
            {displayBreed}
          </span>
          <span className="text-[10px] font-sans opacity-75 block font-medium text-[#5c3e2b]">
            Name: {isSelected ? customName : avatar.name}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="saga-screen h-screen max-h-screen text-editorial-ink flex flex-col justify-between p-4 md:p-6 relative overflow-hidden font-serif select-none bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImg})` }} id="avatar-selection-screen">
      {/* Background Music Controller */}
      <div className="absolute top-4 left-4 z-30">
        <MusicController
          playing={musicPlaying}
          setPlaying={setMusicPlaying}
          volume={musicVolume}
          setVolume={setMusicVolume}
          muted={musicMuted}
          setMuted={setMusicMuted}
          theme="dark"
        />
      </div>
      {/* Header */}
      <header className="max-w-6xl mx-auto w-full flex flex-row justify-between items-center z-10 gap-4 pb-3 mb-3 shrink-0" id="game-header">
        <div className="text-left">
          <span className="hidden md:block text-[10px] uppercase tracking-[0.28em] font-sans font-black text-[#f4c37c]">Stray Saga</span>
          <motion.h1 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="brand-title text-4xl md:text-7xl font-black tracking-normal uppercase leading-none"
          >
            Stray Saga
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2 }}
            className="text-xs md:text-base italic font-medium mt-0.5 text-[#f8e5bd]"
          >
            From alley to forever home.
          </motion.p>
          {hope > 0 && (
            <p className="text-[10px] md:text-xs font-sans font-black uppercase tracking-wider mt-1 text-[#f4c37c]">
              Hope Wallet: {hope} - starting warmth improves every 20 Hope
            </p>
          )}
        </div>

        {/* Campaign Info Badge */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-right flex flex-col items-end"
        >
          <span className="text-[8px] uppercase tracking-[0.2em] font-sans block mb-0.5 font-bold text-[#f4c37c]">Campaign Status</span>
          <span className="saga-badge px-3 py-1 text-[9px] font-sans uppercase tracking-widest font-black flex items-center gap-1.5">
            <Heart className="w-2.5 h-2.5 fill-red-500 text-red-500 animate-pulse" />
            Adopt Don't Shop
          </span>
        </motion.div>
      </header>

      {/* Main Panel Layout */}
      <main className="max-w-6xl mx-auto w-full flex-grow flex flex-col lg:flex-row items-stretch justify-center gap-4 my-2 z-10 overflow-hidden h-0" id="selection-main">
        <div className="w-full lg:w-5/12 flex flex-col h-full overflow-hidden">
          <div className="choose-stray-container flex flex-col h-full bg-[#2c1a11]/90 border-2 border-[#5d3d28] rounded-xl overflow-hidden relative shadow-2xl">
            <OrnateCornersLarge />
            <div className="panel-header shrink-0 bg-[#21130b] border-b border-[#5d3d28] px-4 py-2.5 flex items-center gap-2">
              <span className="header-icon text-[#d4af37] text-xs">■</span>
              <span className="header-title font-sans font-black text-xs text-[#ebd5b3] tracking-wider">1. CHOOSE YOUR STRAY COMPANION</span>
            </div>

            <div className="panel-content flex-grow p-4 overflow-hidden">
              <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full w-full" id="avatar-grid">
                {AVATARS.map((avatar) => renderCard(avatar))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Selected Profile Deck */}
        <div className="w-full lg:w-7/12 flex flex-col gap-4 justify-between overflow-hidden">
          <div className="flex flex-col md:flex-row gap-4 flex-grow overflow-hidden h-0">
            <div className="parchment-panel p-4 flex flex-col gap-4 md:w-1/2 justify-between shrink-0">
              <div className="flex flex-col gap-2">
                <label htmlFor="cat-name-input" className="text-[10px] uppercase tracking-[0.15em] font-sans font-black text-editorial-ink">
                  Give your kitten a name:
                </label>
                <div className="relative">
                  <input
                      id="cat-name-input"
                      type="text"
                      maxLength={12}
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Enter cat name..."
                      className="w-full border-none px-4 py-1.5 text-sm font-sans font-bold text-[#f5f5f5] focus:outline-none focus:border-editorial-ochre transition-all tracking-wide pr-8 uppercase"
                      style={{ backgroundImage: `url(${nameFieldImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: 'transparent' }}
                    />
                  <Heart className="absolute right-2.5 top-2.5 text-editorial-ink/40 w-4 h-4" />
                </div>
                <p className="text-[10px] text-editorial-ink/75 font-sans leading-relaxed">
                  This identity will carry through their survival struggle and onto their engraved food bowl when successfully adopted.
                </p>
              </div>

              {/* Enhanced Action Tabs with Sound Execution */}
              <div className="flex justify-start border-b border-[#8b5d3a]/40 shrink-0">
                <button 
                  onClick={() => handleTabChange('details')}
                  className={`rpg-tab ${activeTab === 'details' ? 'active' : ''}`}
                >
                  DETAILS
                </button>
                <button 
                  onClick={() => handleTabChange('stats')}
                  className={`rpg-tab ${activeTab === 'stats' ? 'active' : ''}`}
                >
                  STATS
                </button>
                <button 
                  onClick={() => handleTabChange('journey')}
                  className={`rpg-tab ${activeTab === 'journey' ? 'active' : ''}`}
                >
                  JOURNEY
                </button>
              </div>
            </div>

            {/* Right Box: Dynamic Metric Display Panel */}
            <div className="flex-grow md:w-1/2 flex flex-col overflow-hidden h-full">
              {activeTab === 'details' && (
                <motion.div 
                  key={`details-${selectedId}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="parchment-panel p-4 flex-grow flex flex-col justify-between overflow-y-auto h-full"
                >
                  <div>
                    <h2 className="text-[10px] uppercase tracking-[0.2em] font-sans font-black border-b border-editorial-ink pb-1 mb-2">
                      Kitten Profile Details
                    </h2>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-1.5 bg-editorial-bg border border-editorial-ink">
                        <CatIcon avatarId={selectedId} type="portrait" size={32} />
                      </div>
                      <div>
                        <span className="text-[9px] font-sans uppercase tracking-widest text-editorial-ochre font-bold block">Selected Stray</span>
                        <h3 className="text-lg font-bold text-editorial-ink leading-tight mt-0.5">{customName || selectedAvatar.name}</h3>
                        <p className="text-[10px] italic font-medium text-editorial-ink/70 mt-0.5 leading-none">{selectedAvatar.breed}</p>
                      </div>
                    </div>

                    <p className="text-xs text-editorial-ink leading-relaxed font-serif italic my-2">
                      "{selectedAvatar.description}"
                    </p>
                    <div className="mt-3 bg-editorial-bg border border-editorial-ink/20 p-2">
                      <span className="text-[9px] font-sans uppercase tracking-widest text-editorial-ochre font-bold block">
                        Archetype
                      </span>
                      <p className="text-xs font-sans font-black text-editorial-ink mt-0.5">{selectedAvatar.archetype}</p>
                      <p className="text-[10px] font-sans text-editorial-ink/75 leading-relaxed mt-1">{selectedAvatar.trait}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'stats' && (
                <motion.div 
                  key={`stats-${selectedId}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="parchment-panel p-5 flex-grow flex flex-col justify-start gap-4 overflow-y-auto h-full"
                >
                  <div>
                    <h2 className="text-[10px] uppercase tracking-[0.2em] font-sans font-black border-b border-editorial-ink pb-1 mb-4">
                      Kitten Survival Indicators
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-sans font-bold uppercase text-editorial-ink">Energy</span>
                          <span className="text-xs font-sans font-bold text-editorial-ochre">{selectedAvatar.startingStats.energy}%</span>
                        </div>
                        <div className="w-full bg-[#3a1c10]/20 h-2.5 rounded-full overflow-hidden border border-[#5d3d28]/35">
                          <div className="bg-[#b97843] h-full rounded-full transition-all duration-500" style={{ width: `${selectedAvatar.startingStats.energy}%` }}></div>
                        </div>
                        <p className="text-[9px] font-sans text-editorial-ink/75 mt-1">Determines capacity to travel and escape danger. Depletes on movement.</p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-sans font-bold uppercase text-editorial-ink">Warmth</span>
                          <span className="text-xs font-sans font-bold text-[#b91c1c]">{selectedAvatar.startingStats.warmth}%</span>
                        </div>
                        <div className="w-full bg-[#3a1c10]/20 h-2.5 rounded-full overflow-hidden border border-[#5d3d28]/35">
                          <div className="bg-[#b91c1c] h-full rounded-full transition-all duration-500" style={{ width: `${selectedAvatar.startingStats.warmth}%` }}></div>
                        </div>
                        <p className="text-[9px] font-sans text-editorial-ink/75 mt-1">Protects against cold winter rain. Slipping below 20% incurs freeze danger.</p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-sans font-bold uppercase text-editorial-ink">Trust</span>
                          <span className="text-xs font-sans font-bold text-emerald-700">{selectedAvatar.startingStats.trust}%</span>
                        </div>
                        <div className="w-full bg-[#3a1c10]/20 h-2.5 rounded-full overflow-hidden border border-[#5d3d28]/35">
                          <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${selectedAvatar.startingStats.trust}%` }}></div>
                        </div>
                        <p className="text-[9px] font-sans text-editorial-ink/75 mt-1">Built through gentle human contact. Required to accept adoption at the cottage steps.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'journey' && (
                <motion.div 
                  key={`journey-${selectedId}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="parchment-panel p-5 flex-grow flex flex-col justify-start gap-3 overflow-y-auto h-full"
                >
                  <div>
                    <h2 className="text-[10px] uppercase tracking-[0.2em] font-sans font-black border-b border-editorial-ink pb-1 mb-3">
                      Narrative Roadmap
                    </h2>
                    <p className="text-[11px] text-editorial-ink font-serif italic mb-4">
                      Guide your stray companion through the neighborhood alleys to find their forever home.
                    </p>
                    <div className="space-y-3 font-sans text-xs">
                      <div className="flex gap-2.5 items-start">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0"></div>
                        <div>
                          <strong className="text-editorial-ink font-bold">1. Alleys & Rivals</strong>
                          <p className="text-[10px] text-editorial-ink/75">Avoid territorial strays guarding trash bins.</p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-2 h-2 rounded-full bg-amber-600 mt-1 shrink-0"></div>
                        <div>
                          <strong className="text-editorial-ink font-bold">2. Water & Food</strong>
                          <p className="text-[10px] text-editorial-ink/75">Locate park benches and puddles to maintain vital stats.</p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0"></div>
                        <div>
                          <strong className="text-editorial-ink font-bold">3. Humans & Trust</strong>
                          <p className="text-[10px] text-editorial-ink/75">Earn trust through gentle contact to facilitate adoption.</p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-2 h-2 rounded-full bg-red-600 mt-1 shrink-0"></div>
                        <div>
                          <strong className="text-editorial-ink font-bold">4. The Cottage Door</strong>
                          <p className="text-[10px] text-editorial-ink/75">Ms. Eleanor's cottage steps await. Reach it before energy drops to zero.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Action Interface Area */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch shrink-0">
            <div className="bg-[#120b08]/80 border border-dashed border-[#f4c37c]/50 p-3 flex gap-2.5 text-[#f8e5bd] text-[10px] leading-relaxed md:w-1/2 items-center">
              <ShieldAlert className="w-4 h-4 text-editorial-ochre shrink-0" />
              <div className="font-sans">
                <strong className="text-[#ffd18a] font-bold">The Hard Reality:</strong> Shelter cats need our advocacy. Saving virtual lives builds real awareness.
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03, filter: 'brightness(1.15)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              id="start-journey-btn"
              className="md:w-1/2 cursor-pointer focus:outline-none aspect-[900/280]"
              style={{
                backgroundImage: `url(${beginJourneyImg})`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: 'transparent',
                border: 'none',
              }}
            >
              <span className="sr-only">Begin The Journey</span>
            </motion.button>
          </div>
        </div>
      </main>

      {/* Footer Details */}
      <footer className="max-w-6xl mx-auto w-full z-10 flex flex-row justify-between items-center text-[#f8e5bd]/75 font-sans text-[8px] uppercase tracking-[0.2em] border-t border-[#f4c37c]/35 pt-2 mt-2 shrink-0" id="selection-footer">
        <div className="flex items-center gap-1.5">
          <Info className="w-3 text-editorial-ochre" />
          <span>STRAY SAGA MMXXVI &bull; Advocacy Simulation</span>
        </div>
        <div>
          <span>Stop buying, start adopting. Saving lives.</span>
        </div>
      </footer>

      {/* Audio Consent Modal */}
      {audioPromptShown && (
        <div className="fixed inset-0 bg-editorial-ink/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="parchment-panel p-6 md:p-8 max-w-md text-center flex flex-col items-center text-editorial-ink">
            <div className="w-16 h-16 bg-editorial-beige border border-editorial-ink flex items-center justify-center mb-4 text-editorial-ochre">
              <Volume2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-serif mb-2">Soundtrack Recommended</h3>
            <p className="text-editorial-ink/80 font-sans text-sm mb-6 leading-relaxed">
              Stray Saga utilizes client-side synthesized meows, purrs, rain showers, and cozy fireplace crackles. We suggest turning sound on for an atmospheric narrative experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={enableAudio}
                className="saga-button flex-1 font-sans font-bold py-2.5 px-4 cursor-pointer transition-colors"
              >
                Enable Audio
              </button>
              <button
                onClick={() => setAudioPromptShown(false)}
                className="flex-1 bg-editorial-beige hover:bg-editorial-bg text-editorial-ink font-sans font-bold py-2.5 px-4 border border-editorial-ink cursor-pointer transition-colors"
              >
                Keep Muted
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
