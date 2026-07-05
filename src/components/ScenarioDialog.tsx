import React, { useState, useEffect } from 'react';
import { CatStatus, Scenario, ScenarioChoice, ScenarioLine } from '../types';
import { SCENARIOS } from '../data/storyData';
import { CatIcon } from './CatIcon';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from '../utils/audio';
import { resolveChoice as resolveChoiceLogic } from '../utils/gameLogic';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ScenarioDialogProps {
  scenarioId: string;
  catName: string;
  avatarId: string;
  status: CatStatus;
  onComplete: (statusChanges: { energy: number; warmth: number; trust: number }) => void;
}

export const ScenarioDialog: React.FC<ScenarioDialogProps> = ({
  scenarioId,
  catName,
  avatarId,
  status,
  onComplete
}) => {
  const [lineIndex, setLineIndex] = useState<number>(0);
  const [visibleChars, setVisibleChars] = useState<number>(0);
  const [choiceResult, setChoiceResult] = useState<string | null>(null);
  const scenario: Scenario = SCENARIOS[scenarioId] || SCENARIOS.rival;

  const currentLine: ScenarioLine = scenario.lines[lineIndex];

  function formatSpeaker(speaker: string) {
    return speaker.replace('{{name}}', catName);
  }

  function formatText(text: string) {
    return text.replace(/{{name}}/g, catName);
  }

  const formattedLineText = currentLine ? formatText(currentLine.text) : '';
  const lineComplete = visibleChars >= formattedLineText.length;

  useEffect(() => {
    if (currentLine && currentLine.type === 'audio' && currentLine.action) {
      triggerAudioAction(currentLine.action);
    }
  }, [lineIndex]);

  useEffect(() => {
    setVisibleChars(0);
    const timer = window.setInterval(() => {
      setVisibleChars((prev) => {
        if (prev >= formattedLineText.length) {
          window.clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 30);

    return () => {
      window.clearInterval(timer);
    };
  }, [formattedLineText]);

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
  }, [lineIndex, scenario.lines.length, scenarioId, onComplete]);

  const triggerAudioAction = (action: string) => {
    switch (action) {
      case 'hiss':
        audio.playHiss();
        break;
      case 'purr':
        audio.playPurr();
        break;
      case 'water_lap':
        audio.playWaterLap();
        break;
      case 'door_open':
        audio.playDoorCreak();
        break;
      case 'fireplace':
        audio.playFireplace();
        break;
      default:
        break;
    }
  };

  const handleNext = () => {
    if (!lineComplete) {
      setVisibleChars(formattedLineText.length);
      return;
    }

    if (lineIndex === scenario.lines.length - 1 && scenario.choices?.length && !choiceResult) {
      return;
    }

    if (lineIndex < scenario.lines.length - 1) {
      setLineIndex(prev => prev + 1);
    } else {
      const changes = getScenarioStatsChanges(scenarioId);
      onComplete(changes);
    }
  };

  const getScenarioStatsChanges = (id: string) => {
    switch (id) {
      case 'rival':
        return { energy: -25, warmth: -15, trust: 0 };
      case 'pond':
        return { energy: 20, warmth: 0, trust: 0 };
      case 'comrades':
        return { energy: -10, warmth: 40, trust: 20 };
      case 'food':
        return { energy: 40, warmth: 0, trust: 0 };
      case 'pet':
        return { energy: 0, warmth: 20, trust: 60 };
      case 'house':
        return { energy: 100, warmth: 100, trust: 100 };
      default:
        return { energy: 0, warmth: 0, trust: 0 };
    }
  };

  const statsChanges = getScenarioStatsChanges(scenarioId);

  const resolveChoice = (choice: ScenarioChoice) => {
    const success = resolveChoiceLogic(choice.id as 'fight' | 'sneak' | 'beg', {
      energy: status.energy,
      trust: status.trust,
      archetypeId: status.archetypeId,
    });

    setChoiceResult(formatText(success ? choice.successText : choice.failureText));
    if (success) {
      audio.playPurr();
    } else {
      audio.playHiss();
    }
  };

  const renderPortrait = (speaker: string) => {
    const formatted = formatSpeaker(speaker);
    if (formatted === catName) {
      let expression: 'portrait' | 'scared' | 'shivering' | 'sleeping' = 'portrait';
      if (scenarioId === 'rival' && lineIndex < 8) expression = 'scared';
      if (scenarioId === 'comrades' && lineIndex < 4) expression = 'shivering';
      if (scenarioId === 'house') expression = 'sleeping';

      return (
        <div className="parchment-panel w-24 h-24 p-2 flex items-center justify-center relative">
          <CatIcon avatarId={avatarId} type={expression} size={80} />
          <div className="absolute -bottom-2.5 bg-editorial-ink border border-editorial-ink px-2 py-0.5 text-[9px] font-sans font-black text-editorial-bg uppercase tracking-wider">
            YOU
          </div>
        </div>
      );
    }

    if (speaker === 'Narrator' || speaker === 'System') {
      return (
        <div className="parchment-panel w-24 h-24 p-2 flex items-center justify-center text-editorial-ochre shadow-inner relative">
          <Sparkles className="w-8 h-8 animate-pulse text-editorial-ochre" />
          <div className="absolute -bottom-2.5 bg-editorial-bg border border-editorial-ink px-2 py-0.5 text-[9px] font-sans font-black text-editorial-ink uppercase tracking-wider">
            SCENE
          </div>
        </div>
      );
    }

    if (speaker === 'Ginger Rival') {
      return (
        <div className="parchment-panel w-24 h-24 p-2 flex items-center justify-center relative">
          <svg width="72" height="72" viewBox="0 0 100 100" className="overflow-visible">
            <ellipse cx="50" cy="85" rx="35" ry="8" fill="rgba(0,0,0,0.1)" />
            <path d="M 12 40 L 5 15 L 32 30 Z" fill="#A67C52" />
            <path d="M 88 40 L 95 15 L 68 30 Z" fill="#A67C52" />
            <ellipse cx="50" cy="48" rx="36" ry="28" fill="#A67C52" />
            <path d="M 28 35 L 38 45 M 34 33 L 34 45" stroke="#991b1b" strokeWidth="2.5" />
            <ellipse cx="32" cy="45" rx="6" ry="4" fill="#2D2A26" />
            <line x1="32" y1="41" x2="32" y2="49" stroke="#ffffff" strokeWidth="1.5" />
            
            <ellipse cx="68" cy="45" rx="6" ry="4" fill="#2D2A26" />
            <line x1="68" y1="41" x2="68" y2="49" stroke="#ffffff" strokeWidth="1.5" />
            <polygon points="46,55 54,55 50,59" fill="#991b1b" />
            <path d="M 40 62 Q 50 67 60 62" stroke="#2D2A26" strokeWidth="3" fill="none" strokeLinecap="round" />
            <polygon points="44,61 46,65 48,61" fill="#ffffff" />
            <polygon points="52,61 54,65 56,61" fill="#ffffff" />
          </svg>
          <div className="absolute -bottom-2.5 bg-red-700 border border-editorial-ink px-2 py-0.5 text-[9px] font-sans font-black text-white uppercase tracking-wider">
            RIVAL
          </div>
        </div>
      );
    }

    if (speaker === 'Black Kitten') {
      return (
        <div className="parchment-panel w-24 h-24 p-2 flex items-center justify-center relative">
          <CatIcon avatarId="black" type="shivering" size={72} />
          <div className="absolute -bottom-2.5 bg-editorial-ink border border-editorial-ink px-2 py-0.5 text-[9px] font-sans font-black text-editorial-bg uppercase tracking-wider">
            STRAY
          </div>
        </div>
      );
    }

    if (speaker === 'Kind Human') {
      return (
        <div className="parchment-panel w-24 h-24 p-2 flex items-center justify-center relative overflow-hidden">
          <svg width="64" height="64" viewBox="0 0 100 100">
            <circle cx="50" cy="35" r="18" fill="#A67C52" opacity="0.8" />
            <path d="M 20 85 C 20 60, 80 60, 80 85 Z" fill="#A67C52" opacity="0.8" />
            <path d="M 50 15 Q 60 5, 50 -5 Q 40 5, 50 15 Z" fill="#A67C52" opacity="0.3" className="animate-pulse" />
          </svg>
          <div className="absolute -bottom-2.5 bg-editorial-ink border border-editorial-ink px-2 py-0.5 text-[9px] font-sans font-black text-editorial-bg uppercase tracking-wider">
            HUMAN
          </div>
        </div>
      );
    }

    if (speaker === 'Ms. Eleanor') {
      return (
        <div className="parchment-panel w-24 h-24 p-2 flex items-center justify-center relative overflow-hidden">
          <svg width="64" height="64" viewBox="0 0 100 100">
            <circle cx="50" cy="18" r="12" fill="#E6E2D3" />
            <circle cx="50" cy="35" r="18" fill="#A67C52" opacity="0.8" />
            <circle cx="43" cy="35" r="5" stroke="#2D2A26" strokeWidth="2" fill="none" />
            <circle cx="57" cy="35" r="5" stroke="#2D2A26" strokeWidth="2" fill="none" />
            <line x1="48" y1="35" x2="52" y2="35" stroke="#2D2A26" strokeWidth="2" />
            <path d="M 15 85 C 15 55, 85 55, 85 85 Z" fill="#2D2A26" />
          </svg>
          <div className="absolute -bottom-2.5 bg-editorial-ochre border border-editorial-ink px-2 py-0.5 text-[9px] font-sans font-black text-editorial-bg uppercase tracking-wider">
            SAVIOR
          </div>
        </div>
      );
    }

    return null;
  };

  const isNarrative = currentLine.type === 'scene' || currentLine.type === 'audio';

  return (
    <div
      className="fixed inset-0 bg-[#130b08]/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:p-8 select-none"
      id="scenario-overlay"
      onClick={() => {
        if (!lineComplete) setVisibleChars(formattedLineText.length);
      }}
    >
      <div className="wood-frame p-3 max-w-2xl w-full flex flex-col relative overflow-hidden animate-fade-in" id="scenario-card">
        <div className="parchment-panel p-5 md:p-7 flex flex-col relative overflow-hidden">
        {/* Top Accent Strip */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${
          scenario.pawColor === 'blue' ? 'bg-editorial-ink' :
          scenario.pawColor === 'orange' ? 'bg-editorial-ochre' :
          scenario.pawColor === 'green' ? 'bg-emerald-700' :
          scenario.pawColor === 'purple' ? 'bg-rose-700' :
          scenario.pawColor === 'yellow' ? 'bg-amber-600' : 'bg-editorial-ink'
        }`}></div>

        {/* Narrative Scenario Header */}
        <div className="flex justify-between items-center border-b border-editorial-ink/20 pb-4 mb-6">
          <div>
            <span className="text-[10px] font-sans font-black text-editorial-ochre uppercase tracking-widest">{scenario.subtitle}</span>
            <h3 className="text-xl font-bold font-serif text-editorial-ink mt-0.5">{scenario.title}</h3>
          </div>
          <span className="text-[10px] font-sans font-black bg-editorial-bg border border-editorial-ink px-2.5 py-1 text-editorial-ink">
            {lineIndex + 1} / {scenario.lines.length}
          </span>
        </div>

        {/* Dialogue Narrative Row */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 min-h-[140px] my-4" id="scenario-body">
          {/* Left: Speaker Portrait */}
          <div className="shrink-0 flex justify-center w-full md:w-auto">
            {renderPortrait(currentLine.speaker)}
          </div>

          {/* Right: Dialogue text */}
          <div className="flex-1 flex flex-col justify-center text-center md:text-left">
            <h4 className="text-[10px] font-sans font-black text-editorial-ochre uppercase tracking-widest mb-1.5">
              {formatSpeaker(currentLine.speaker)}
            </h4>
            
            {isNarrative ? (
              <p className="text-editorial-ink text-sm md:text-base leading-relaxed italic font-serif" id="scenario-narrator-line">
                {formattedLineText.slice(0, visibleChars)}
              </p>
            ) : currentLine.type === 'thought' ? (
              <p className="text-editorial-ink/90 text-sm md:text-base font-serif italic leading-relaxed pl-3 border-l-2 border-editorial-ochre" id="scenario-thought-line">
                "{formattedLineText.slice(0, visibleChars)}"
              </p>
            ) : (
              <p className="text-editorial-ink text-sm md:text-base font-sans font-medium leading-relaxed" id="scenario-dialogue-line">
                "{formattedLineText.slice(0, visibleChars)}"
              </p>
            )}
          </div>
        </div>

        {lineIndex === scenario.lines.length - 1 && scenario.choices?.length && (
          <div className="border-t border-editorial-ink/15 pt-4">
            {choiceResult ? (
              <div className="bg-editorial-bg border border-editorial-ink/30 p-3 text-xs md:text-sm font-serif italic text-editorial-ink">
                {choiceResult}
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-2">
                {scenario.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      resolveChoice(choice);
                    }}
                    className="saga-button p-3 text-left"
                  >
                    <span className="block text-[10px] font-sans font-black uppercase tracking-widest">{choice.label}</span>
                    <span className="block text-[9px] font-sans text-[#ffe8bd]/80 mt-1 leading-tight">{choice.requirement}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer actions & consequences */}
        <div className="border-t border-editorial-ink/20 pt-4 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Consequences Preview (visible on the last slide) */}
          <div className="text-left font-sans text-xs">
            {lineIndex === scenario.lines.length - 1 && (
              <div>
                <span className="text-[10px] font-black text-editorial-ochre uppercase tracking-widest block mb-1">Impact of Choices:</span>
                <div className="flex gap-3 text-[10px] font-black uppercase">
                  {statsChanges.energy !== 0 && (
                    <span className={statsChanges.energy > 0 ? 'text-emerald-800' : 'text-red-700'}>
                      Energy {statsChanges.energy > 0 ? `+${statsChanges.energy}` : statsChanges.energy}%
                    </span>
                  )}
                  {statsChanges.warmth !== 0 && (
                    <span className={statsChanges.warmth > 0 ? 'text-emerald-800' : 'text-red-700'}>
                      Warmth {statsChanges.warmth > 0 ? `+${statsChanges.warmth}` : statsChanges.warmth}%
                    </span>
                  )}
                  {statsChanges.trust !== 0 && (
                    <span className={statsChanges.trust > 0 ? 'text-purple-800' : 'text-red-700'}>
                      Trust {statsChanges.trust > 0 ? `+${statsChanges.trust}` : statsChanges.trust}%
                    </span>
                  )}
                  {statsChanges.energy === 0 && statsChanges.warmth === 0 && statsChanges.trust === 0 && (
                    <span className="text-editorial-ink/60">Balance maintained</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            id="scenario-next-btn"
            className="saga-button w-full sm:w-auto font-sans font-black text-[10px] uppercase tracking-wider py-2.5 px-6 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{!lineComplete ? 'Reveal Text' : lineIndex === scenario.lines.length - 1 ? 'Resume Journey' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
