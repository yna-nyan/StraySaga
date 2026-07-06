import React, { useEffect, useState, useRef } from 'react';
import { CatIcon } from './CatIcon';
import { motion } from 'motion/react';
import { audio } from '../utils/audio';
import { Heart, RefreshCw, Sparkles, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { MusicController } from './MusicController';

import adoptBtnBg from '../assets/Adopt_Cat_Button.png'; 
import tipsBtnBg from '../assets/Adoption_Tips_Button.png'; 

interface EndingProps {
  catName: string;
  avatarId: string;
  onRestart: () => void;
  musicPlaying: boolean;
  setPlaying?: never; // enforce types
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
  musicMuted: boolean;
  setMusicMuted: (muted: boolean) => void;
  setMusicPlaying: (playing: boolean) => void;
}

interface Ember {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  alpha: number;
  decay: number;
  color: string;
}

export const Ending: React.FC<EndingProps> = ({
  catName,
  avatarId,
  onRestart,
  musicPlaying,
  setMusicPlaying,
  musicVolume,
  setMusicVolume,
  musicMuted,
  setMusicMuted
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(audio.getMuted());
  const [showTips, setShowTips] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Play fireplace crackles and cozy purrs
    audio.playFireplace();
    audio.playPurr();
    
    const fireplaceInterval = setInterval(() => {
      audio.playFireplace();
    }, 2500);

    const purrInterval = setInterval(() => {
      audio.playPurr();
    }, 4500);

    return () => {
      clearInterval(fireplaceInterval);
      clearInterval(purrInterval);
    };
  }, []);

  // Smooth Canvas-based Fireplace Ember Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let embers: Ember[] = [];

    // Fit canvas sizing accurately to parent bounds
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = [
      'rgba(245, 158, 11, ',  // Amber-500
      'rgba(249, 115, 22, ',  // Orange-500
      'rgba(234, 179, 8, ',   // Yellow-500
      'rgba(239, 68, 68, '    // Red-500
    ];

    const createEmber = (): Ember => {
      return {
        x: Math.random() * canvas.width,
        // Start below or at the very bottom edge of the viewport
        y: canvas.height + Math.random() * 20,
        size: Math.random() * 2.5 + 0.5,
        // Upward floating speed
        speedY: -(Math.random() * 1.5 + 0.8),
        // Slight horizontal drift for natural disperse sway
        speedX: (Math.random() - 0.5) * 0.8,
        alpha: Math.random() * 0.5 + 0.5,
        // Slower decay yields continuous smooth climbing
        decay: Math.random() * 0.003 + 0.002,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    };

    // Pre-populate system slightly so it looks active instantly
    for (let i = 0; i < 40; i++) {
      const ember = createEmber();
      ember.y = Math.random() * canvas.height; // Distribute heightwise
      embers.push(ember);
    }

    // High performance 60fps animation loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Keep spawning new sparks to keep a dense rising stream
      if (embers.length < 85) {
        embers.push(createEmber());
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        
        // Update physics positions
        e.y += e.speedY;
        e.x += e.speedX;
        
        // Disperse horizontally more aggressively the higher they float
        e.speedX += (Math.random() - 0.5) * 0.05; 
        
        // Decay opacity slowly
        e.alpha -= e.decay;

        // Clean up out of bounds or invisible particles
        if (e.alpha <= 0 || e.y < -10 || e.x < -10 || e.x > canvas.width + 10) {
          embers.splice(i, 1);
          continue;
        }

        // Draw smooth fuzzy circular sparks
        ctx.save();
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fillStyle = `${e.color}${e.alpha})`;
        // Optional soft blur effect for glow aesthetic
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(249, 115, 22, 0.4)';
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const toggleMute = () => {
    const nextMute = !isMuted;
    audio.setMute(nextMute);
    setIsMuted(nextMute);
  };

  return (
    <div className="saga-screen h-screen h-[100dvh] text-editorial-ink flex flex-col justify-between p-4 md:p-8 relative overflow-hidden font-sans select-none" id="ending-screen">
      {/* Warm fireplace glow backdrop layout */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[#2a1209]/35 pointer-events-none z-0"></div>
      
      {/* Ultra-Smooth HTML5 Canvas Particle Engine for Dispersing Sparks */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60"
      />

      {/* Header Utilities */}
      <header className="z-30 max-w-6xl mx-auto w-full flex justify-between items-center border-b border-[#f4c37c]/35 pb-2 md:pb-4 shrink-0">
        <div>
          <span className="text-[10px] md:text-xs font-bold tracking-widest text-[#f4c37c] font-mono">SAGA COMPLETE</span>
          <h1 className="brand-title text-2xl md:text-5xl font-black uppercase mt-0.5">A Safe Haven</h1>
        </div>
        <div className="flex items-center gap-3">
          <MusicController
            playing={musicPlaying}
            setPlaying={setMusicPlaying}
            volume={musicVolume}
            setVolume={setMusicVolume}
            muted={musicMuted}
            setMuted={setMusicMuted}
            theme="parchment"
            align="right"
          />
          <button
            onClick={toggleMute}
            className="saga-button p-2 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 md:w-4.5 md:h-4.5" /> : <Volume2 className="w-4 h-4 md:w-4.5 md:h-4.5" />}
          </button>
        </div>
      </header>

      {/* Main Ending Frame */}
      <main className="max-w-6xl mx-auto w-full z-10 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 my-auto overflow-hidden py-2">
        
        {/* Left: Cozy Fireplace Living Room Simulation */}
        <div className="w-full max-w-[440px] lg:w-[460px] p-[16px] relative flex flex-col items-center justify-center h-auto aspect-[4/3] lg:h-[360px] shrink-0 rounded-[4px] bg-[#2d170b] border-t-2 border-l-2 border-[#412413] border-b-2 border-r-2 border-[#160a03] shadow-[0_16px_30px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-4px_10px_rgba(0,0,0,0.8)] before:absolute before:inset-[3px] before:border before:border-[#1c0e06] before:pointer-events-none">

          {/* Inner Parchment Canvas Panel */}
          <div className="w-full h-full p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden bg-[#e9dbbe] border-t border-l border-[#bda883] border-b border-r border-[#fbf2dd] shadow-[inset_0_4px_12px_rgba(43,23,10,0.35)] rounded-[2px]">
            
            {/* ===== INSIDE SWIRLY CORNERS ===== */}
            {/* Left Top Swirly Corner */}
            <div className="absolute top-1 left-1 w-14 h-14 pointer-events-none z-20 overflow-visible">
              <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
                <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
                <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
                <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
              </svg>
            </div>
            
            {/* Right Top Swirly Corner */}
            <div className="absolute top-1 right-1 w-14 h-14 pointer-events-none z-20 overflow-visible transform scale-x-[-1]">
              <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
                <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
                <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
                <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
              </svg>
            </div>
            
            {/* Left Bottom Swirly Corner */}
            <div className="absolute bottom-1 left-1 w-14 h-14 pointer-events-none z-20 overflow-visible transform scale-y-[-1]">
              <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
                <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
                <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
                <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
              </svg>
            </div>
            
            {/* Right Bottom Swirly Corner */}
            <div className="absolute bottom-1 right-1 w-14 h-14 pointer-events-none z-20 overflow-visible transform scale-x-[-1] scale-y-[-1]">
              <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
                <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
                <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
                <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
              </svg>
            </div>
            {/* ================================= */}

            {/* Glowing radiator behind */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-48 h-12 bg-orange-500/10 blur-xl animate-pulse"></div>
            
            {/* Vector representation of radiator lines */}
            <div className="w-40 h-6 opacity-25 border-b-2 border-dashed border-orange-500 flex justify-between px-4 mb-4 md:mb-6">
              <div className="w-1.5 h-full bg-orange-600"></div>
              <div className="w-1.5 h-full bg-orange-600"></div>
              <div className="w-1.5 h-full bg-orange-600"></div>
              <div className="w-1.5 h-full bg-orange-600"></div>
              <div className="w-1.5 h-full bg-orange-600"></div>
            </div>

            {/* Sleeping Cat bed */}
            <div className="relative scale-90 md:scale-100">
              {/* The plush bed */}
              <ellipse cx="60" cy="70" rx="65" ry="25" fill="#be123c" stroke="#9f1239" strokeWidth="2" className="shadow-lg" />
              <ellipse cx="60" cy="65" rx="55" ry="18" fill="#fda4af" opacity="0.8" />

              {/* Sleeping Cat Icon */}
              <div className="absolute inset-0 transform translate-x-3 translate-y-3">
                <CatIcon avatarId={avatarId} type="sleeping" size={96} />
              </div>
            </div>

            {/* Row Container holding Cat Ending Asset on Left, and Cat Food Bowl on Right */}
            <div className="mt-8 md:mt-12 flex items-center justify-center gap-6 relative scale-90 md:scale-100">
              {/* Cat Ending Icon Asset placed on the left */}
              <img 
                src="src/assets/Cat_Ending_Icon.png" 
                alt="Ending Cat" 
                className="w-16 h-16 object-contain drop-shadow-sm select-none"
              />

              {/* Cat Food Bowl placed on the right */}
              <svg width="100" height="40" viewBox="0 0 100 40" className="overflow-visible">
                {/* Bowl shadow */}
                <ellipse cx="50" cy="32" rx="42" ry="6" fill="rgba(0,0,0,0.3)" />
                {/* Bowl exterior */}
                <path d="M 12 18 Q 12 35 50 35 Q 88 35 88 18 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
                {/* Bowl rim */}
                <ellipse cx="50" cy="18" rx="38" ry="8" fill="#0284c7" />
                {/* Inside food */}
                <ellipse cx="50" cy="18" rx="30" ry="5" fill="#78350f" />
                <circle cx="45" cy="17" r="2.5" fill="#451a03" />
                <circle cx="55" cy="19" r="2" fill="#451a03" />
                
                {/* Engraved custom name */}
                <text x="50" y="28" fill="#e0f2fe" fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="0.05em" fontFamily="monospace">
                  {catName.toUpperCase()}
                </text>
              </svg>

              {/* Small glowing sparkle above bed */}
              <Sparkles className="absolute -top-12 -right-4 w-5 h-5 text-amber-400 animate-pulse" />
            </div>

            <p className="text-[11px] md:text-xs text-editorial-ink/70 text-center font-mono mt-6 md:mt-8 border-t border-editorial-ink/20 pt-3 md:pt-4 w-full line-clamp-2">
              "{catName} is sleeping soundly, listening to the crackling fireplace."
            </p>
          </div>
        </div>

        {/* Right: Campaign message and post-game choices */}
        <div className="flex-1 max-w-xl flex flex-col justify-between gap-4 h-full overflow-hidden">
          <div className="w-full p-[16px] relative flex flex-col h-auto lg:h-full overflow-hidden rounded-[4px] bg-[#2d170b] border-t-2 border-l-2 border-[#412413] border-b-2 border-r-2 border-[#160a03] shadow-[0_16px_30px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-4px_10px_rgba(0,0,0,0.8)] before:absolute before:inset-[3px] before:border before:border-[#1c0e06] before:pointer-events-none">
            
            {/* Inner Parchment Canvas Panel */}
            <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col relative overflow-y-auto max-h-[40vh] lg:max-h-full bg-[#e9dbbe] border-t border-l border-[#bda883] border-b border-r border-[#fbf2dd] shadow-[inset_0_4px_12px_rgba(43,23,10,0.35)] rounded-[2px]">
              
              {/* ===== INSIDE SWIRLY CORNERS ===== */}
              {/* Left Top Swirly Corner */}
              <div className="absolute top-1 left-1 w-14 h-14 pointer-events-none z-20 overflow-visible">
                <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
                  <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
                  <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
                  <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                  <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
                </svg>
              </div>
              
              {/* Right Top Swirly Corner */}
              <div className="absolute top-1 right-1 w-14 h-14 pointer-events-none z-20 overflow-visible transform scale-x-[-1]">
                <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
                  <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
                  <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
                  <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                  <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
                </svg>
              </div>
              
              {/* Left Bottom Swirly Corner */}
              <div className="absolute bottom-1 left-1 w-14 h-14 pointer-events-none z-20 overflow-visible transform scale-y-[-1]">
                <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
                  <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
                  <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
                  <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                  <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
                </svg>
              </div>
              
              {/* Right Bottom Swirly Corner */}
              <div className="absolute bottom-1 right-1 w-14 h-14 pointer-events-none z-20 overflow-visible transform scale-x-[-1] scale-y-[-1]">
                <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
                  <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
                  <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
                  <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                  <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
                </svg>
              </div>
              {/* ================================= */}

              {/* Content Layer */}
              <div className="flex items-center gap-3 mb-3 mt-2">
                <span className="p-2 saga-badge text-[#ffe0ad]">
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                </span>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-editorial-ink font-serif">Stop Buying, Start Adopting</h2>
                  <p className="text-[10px] text-editorial-ochre font-mono mt-0.5">STRAY SAGA CAMPAIGN ADVOCACY</p>
                </div>
              </div>

              <p className="text-editorial-ink text-xs md:text-sm leading-relaxed mb-4 font-sans px-1">
                The game you just played reflects a small portion of the daily struggles of millions of stray animals. Searching for non-contaminated water, fleeing from territorial fighters, relying on dry scraps, and desperately seeking human kindness. 
              </p>

              <div className="space-y-2 text-editorial-ink text-[11px] md:text-xs px-1 pb-2" id="campaign-advocacy-facts">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-editorial-ochre rounded-full shrink-0 mt-1.5"></div>
                  <p><strong>Overcrowded Shelters:</strong> Thousands of kittens await adoption. Buying from pet shops or breeders directly perpetuates commercial mills.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-editorial-ochre rounded-full shrink-0 mt-1.5"></div>
                  <p><strong>Rescue & Restore:</strong> Adopting a shelter pet literally saves a life, opening up shelter space for another stray on a freezing night.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-editorial-ochre rounded-full shrink-0 mt-1.5"></div>
                  <p><strong>Lifetime Loyalty:</strong> Rescued strays form deep bonds of gratitude with their adopters once they realize they are finally safe.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-6 justify-center items-center mt-0 z-20 relative shrink-0">
            <button
              onClick={onRestart}
              id="restart-game-btn"
              className="w-[250px] h-[70px] md:w-[270px] md:h-[76px] cursor-pointer transition-transform duration-200 active:scale-95 bg-[length:100%_100%] bg-center bg-no-repeat drop-shadow-md outline-none border-none p-0"
              style={{ backgroundImage: `url(${adoptBtnBg})` }}
              aria-label="Adopt Another Kitten"
            />

            <button
              onClick={() => setShowTips(!showTips)}
              id="view-adoption-tips-btn"
              className="w-[260px] h-[90px] md:w-[290px] md:h-[91px] cursor-pointer transition-transform duration-200 active:scale-95 bg-[length:100%_100%] bg-center bg-no-repeat drop-shadow-md outline-none border-none p-0"
              style={{ backgroundImage: `url(${tipsBtnBg})` }}
              aria-label="Adoption Guide Tips"
            />
          </div>
        </div>
      </main>

      {/* Adoption Tips Modal */}
      {showTips && (
        <div className="fixed inset-0 bg-[#130b08]/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="parchment-panel p-6 md:p-8 max-w-lg flex flex-col relative">
            {/* Swirly corners */}
            <div className="absolute top-1 left-1 w-14 h-14 pointer-events-none z-20 overflow-visible">
              <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
                <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
                <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
                <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
              </svg>
            </div>
            <div className="absolute top-1 right-1 w-14 h-14 pointer-events-none z-20 overflow-visible transform scale-x-[-1]">
              <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
                <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
                <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
                <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
              </svg>
            </div>
            <div className="absolute bottom-1 left-1 w-14 h-14 pointer-events-none z-20 overflow-visible transform scale-y-[-1]">
              <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
                <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
                <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
                <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
              </svg>
            </div>
            <div className="absolute bottom-1 right-1 w-14 h-14 pointer-events-none z-20 overflow-visible transform scale-x-[-1] scale-y-[-1]">
              <svg width="100%" height="100%" viewBox="0 0 40 40" className="overflow-visible opacity-80">
                <path d="M 2 35 A 33 33 0 0 1 35 2" fill="none" stroke="#7d633a" strokeWidth="1" />
                <path d="M 2 25 A 23 23 0 0 1 25 2" fill="none" stroke="#9e8254" strokeWidth="0.75" />
                <path d="M 2 2 Q 12 2 12 12 Q 12 18 6 18 Q 2 18 2 12 Q 2 8 6 8 Q 9 8 8 11" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <path d="M 2 2 Q 2 12 12 12 Q 18 12 18 6 Q 18 2 12 2 Q 8 2 8 6 Q 8 9 11 8" fill="none" stroke="#7d633a" strokeWidth="0.85" strokeLinecap="round" />
                <circle cx="18" cy="18" r="1.5" fill="#dfbe7b" stroke="#503a15" strokeWidth="0.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-editorial-ink flex items-center gap-2 font-serif">
              <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              How to Help Stray & Shelter Pets
            </h3>

            <div className="space-y-4 text-sm text-editorial-ink overflow-y-auto max-h-[350px] pr-2">
              <div>
                <h4 className="font-bold text-editorial-ink">1. Visit Local Rescue Centers</h4>
                <p className="text-editorial-ink/75 text-xs mt-1">Shelters welcome volunteers! Spend a weekend socializing shy cats or helping clean cages to show them love.</p>
              </div>
              <div>
                <h4 className="font-bold text-editorial-ink">2. Trap-Neuter-Return (TNR)</h4>
                <p className="text-editorial-ink/75 text-xs mt-1">Sponsoring TNR programs in your community prevents feline overpopulation humanely and reduces territorial fights.</p>
              </div>
              <div>
                <h4 className="font-bold text-editorial-ink">3. Support Shelter Donations</h4>
                <p className="text-editorial-ink/75 text-xs mt-1">Shelters are constantly in need of high-quality food, warm blankets, cat beds, and medical supplies.</p>
              </div>
              <div>
                <h4 className="font-bold text-editorial-ink">4. Advocate on Social Media</h4>
                <p className="text-editorial-ink/75 text-xs mt-1">Spread the word! Share profiles of local shelter cats seeking foster or forever homes to increase their adoption odds.</p>
              </div>
            </div>

            <button
              onClick={() => setShowTips(false)}
              className="saga-button mt-6 font-bold py-2 px-4 cursor-pointer text-center transition-colors text-sm"
            >
              Close Tips
            </button>
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <footer className="max-w-4xl mx-auto w-full text-center text-[#f8e5bd]/70 text-[11px] md:text-xs border-t border-[#f4c37c]/35 pt-3 mt-2 z-10 shrink-0">
        <span>Stray Saga &copy; 2026. Stand with animal shelter advocates everywhere. Stop buying, start adopting.</span>
      </footer>
    </div>
  );
};