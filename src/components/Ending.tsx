import React, { useEffect, useState } from 'react';
import { CatIcon } from './CatIcon';
import { motion } from 'motion/react';
import { audio } from '../utils/audio';
import { Heart, RefreshCw, Sparkles, BookOpen, Volume2, VolumeX } from 'lucide-react';

interface EndingProps {
  catName: string;
  avatarId: string;
  onRestart: () => void;
}

export const Ending: React.FC<EndingProps> = ({ catName, avatarId, onRestart }) => {
  const [isMuted, setIsMuted] = useState<boolean>(audio.getMuted());
  const [showTips, setShowTips] = useState<boolean>(false);

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

  const toggleMute = () => {
    const nextMute = !isMuted;
    audio.setMute(nextMute);
    setIsMuted(nextMute);
  };

  return (
    <div className="saga-screen min-h-screen text-editorial-ink flex flex-col justify-between p-6 md:p-12 relative overflow-hidden font-sans select-none" id="ending-screen">
      {/* Warm fireplace glow backdrop */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[#2a1209]/35 pointer-events-none z-0"></div>
      
      {/* Floating Sparkles in backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute w-2 h-2 bg-amber-400 rounded-full left-1/4 top-1/2 animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute w-2 h-2 bg-orange-400 rounded-full right-1/4 top-1/3 animate-ping" style={{ animationDuration: '4s' }}></div>
        <div className="absolute w-2 h-2 bg-red-400 rounded-full left-1/2 top-2/3 animate-ping" style={{ animationDuration: '5s' }}></div>
      </div>

      {/* Header Utilities */}
      <header className="z-10 max-w-6xl mx-auto w-full flex justify-between items-center border-b border-[#f4c37c]/35 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#f4c37c] font-mono">SAGA COMPLETE</span>
          <h1 className="brand-title text-4xl md:text-6xl font-black uppercase mt-0.5">A Safe Haven</h1>
        </div>
        <button
          onClick={toggleMute}
          className="saga-button p-2 cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
        </button>
      </header>

      {/* Main Ending Frame */}
      <main className="max-w-6xl mx-auto w-full z-10 flex flex-col lg:flex-row items-center justify-center gap-12 my-8">
        {/* Left: Cozy Fireplace Living Room Simulation */}
        <div className="wood-frame w-full lg:w-[480px] p-4 relative flex flex-col items-center justify-center min-h-[360px] overflow-hidden">
          <div className="parchment-panel w-full min-h-[330px] p-8 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Glowing radiator behind */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-48 h-12 bg-orange-500/10 blur-xl animate-pulse"></div>
          
          {/* Vector representation of radiator lines */}
          <div className="w-40 h-8 opacity-25 border-b-2 border-dashed border-orange-500 flex justify-between px-4 mb-8">
            <div className="w-1.5 h-full bg-orange-600"></div>
            <div className="w-1.5 h-full bg-orange-600"></div>
            <div className="w-1.5 h-full bg-orange-600"></div>
            <div className="w-1.5 h-full bg-orange-600"></div>
            <div className="w-1.5 h-full bg-orange-600"></div>
          </div>

          {/* Sleeping Cat bed */}
          <div className="relative">
            {/* The plush bed */}
            <ellipse cx="60" cy="70" rx="65" ry="25" fill="#be123c" stroke="#9f1239" strokeWidth="2" className="shadow-lg" />
            <ellipse cx="60" cy="65" rx="55" ry="18" fill="#fda4af" opacity="0.8" />

            {/* Sleeping Cat Icon */}
            <div className="absolute inset-0 transform translate-x-3 translate-y-3">
              <CatIcon avatarId={avatarId} type="sleeping" size={96} />
            </div>
          </div>

          {/* Cat Food Bowl with Custom Name */}
          <div className="mt-16 flex items-center gap-4 relative">
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

          <p className="text-xs text-editorial-ink/70 text-center font-mono mt-8 border-t border-editorial-ink/20 pt-4 w-full">
            "{catName} is sleeping soundly, listening to the crackling fireplace."
          </p>
          </div>
        </div>

        {/* Right: Campaign message and post-game choices */}
        <div className="flex-1 max-w-xl flex flex-col gap-6">
          <div className="parchment-panel p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 saga-badge text-[#ffe0ad]">
                <Heart className="w-6 h-6 fill-red-500 text-red-500" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-editorial-ink font-serif">Stop Buying, Start Adopting</h2>
                <p className="text-xs text-editorial-ochre font-mono mt-0.5">STRAY SAGA CAMPAIGN ADVOCACY</p>
              </div>
            </div>

            <p className="text-editorial-ink text-sm md:text-base leading-relaxed mb-6 font-sans">
              The game you just played reflects a small portion of the daily struggles of millions of stray animals. Searching for non-contaminated water, fleeing from territorial fighters, relying on dry scraps, and desperately seeking human kindness. 
            </p>

            <div className="space-y-3.5 text-editorial-ink text-xs md:text-sm" id="campaign-advocacy-facts">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-editorial-ochre rounded-full shrink-0 mt-2"></div>
                <p><strong>Overcrowded Shelters:</strong> Thousands of kittens await adoption. Buying from pet shops or breeders directly perpetuates commercial mills.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-editorial-ochre rounded-full shrink-0 mt-2"></div>
                <p><strong>Rescue & Restore:</strong> Adopting a shelter pet literally saves a life, opening up shelter space for another stray on a freezing night.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-editorial-ochre rounded-full shrink-0 mt-2"></div>
                <p><strong>Lifetime Loyalty:</strong> Rescued strays form deep bonds of gratitude with their adopters once they realize they are finally safe.</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onRestart}
              id="restart-game-btn"
              className="saga-button flex-1 font-bold py-3.5 px-6 cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Adopt Another Kitten</span>
            </button>

            <button
              onClick={() => setShowTips(!showTips)}
              id="view-adoption-tips-btn"
              className="saga-button flex-1 font-black py-3.5 px-6 cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Adoption Guide Tips</span>
            </button>
          </div>
        </div>
      </main>

      {/* Adoption Tips Modal */}
      {showTips && (
        <div className="fixed inset-0 bg-[#130b08]/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="parchment-panel p-6 md:p-8 max-w-lg flex flex-col relative">
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
      <footer className="max-w-6xl mx-auto w-full text-center text-[#f8e5bd]/70 text-xs border-t border-[#f4c37c]/35 pt-4 mt-4 z-10">
        <span>Stray Saga &copy; 2026. Stand with animal shelter advocates everywhere. Stop buying, start adopting.</span>
      </footer>
    </div>
  );
};
