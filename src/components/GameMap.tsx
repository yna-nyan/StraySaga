import React, { useState, useEffect, useRef } from 'react';
import { CatStatus, Waypoint } from '../types';
import { WAYPOINTS } from '../data/storyData';
import { CatIcon } from './CatIcon';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from '../utils/audio';
import {
  Heart,
  Flame,
  Zap,
  CheckCircle2,
  Navigation,
  Volume2,
  VolumeX,
  AlertTriangle,
  Home,
  X,
  PawPrint
} from 'lucide-react';
import { MusicController } from './MusicController';
import { MapEngine, TREAT_LOCATIONS } from '../utils/mapEngine/MapEngine';
import { TreatEncounter } from '../utils/mapEngine/TreatEntity';

interface GameMapProps {
  status: CatStatus;
  initialCoords?: { x: number; z: number };
  onVisitWaypoint: (waypoint: Waypoint) => void;
  onUnlockEnding: () => void;
  onTravelCost: (distance: number, terrain?: 'clear' | 'complex') => void;
  onUseItem: (itemId: string) => void;
  onCollectTreat?: (item: { id: string; name: string; effectLabel: string; energy: number }) => void; 
  musicPlaying: boolean;
  setMusicPlaying: (playing: boolean) => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
  musicMuted: boolean;
  setMusicMuted: (muted: boolean) => void;
}

export const GameMap: React.FC<GameMapProps> = ({
  status,
  initialCoords,
  onVisitWaypoint,
  onUnlockEnding,
  onTravelCost,
  onUseItem,
  onCollectTreat,
  musicPlaying,
  setMusicPlaying,
  musicVolume,
  setMusicVolume,
  musicMuted,
  setMusicMuted
}) => {
  // Sync state coordinates for HUD display
  const [currentX, setCurrentX] = useState<number>(initialCoords?.x ?? 13.5);
  const [currentY, setCurrentY] = useState<number>(initialCoords?.z ?? 75.7);
  const [isTraveling, setIsTraveling] = useState<boolean>(false);
  const [travelTarget, setTravelTarget] = useState<Waypoint | TreatEncounter | null>(null);
  const [nearWaypoint, setNearWaypoint] = useState<Waypoint | null>(null);
  
  // Track collected treats to avoid rendering or interacting with them twice
  const [collectedTreatIds, setCollectedTreatIds] = useState<string[]>(() => {
    return status.collectedTreats ?? [];
  });

  const [activeWaypointId, setActiveWaypointId] = useState<string | null>(null);
  const [activeTreatId, setActiveTreatId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [facingLeft, setFacingLeft] = useState<boolean>(false);
  const thermalDistress = status.warmth < 20;
  const exhausted = status.energy < 30;

  // Quests overlay & button state
  const [questsOpen, setQuestsOpen] = useState<boolean>(false);
  const [questImgSrc, setQuestImgSrc] = useState<string>('/quest.png');
  const [questImgFailed, setQuestImgFailed] = useState<boolean>(false);
  const questDropdownRef = useRef<HTMLDivElement>(null);
  const [instructionExpanded, setInstructionExpanded] = useState<boolean>(true);

  // Zoom control state
  const [zoomLevel, setZoomLevel] = useState<number>(50);

  // HTML Containers & Canvas Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // MapEngine OOP Coordinator Ref
  const engineRef = useRef<MapEngine | null>(null);

  // Close quests panel on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (questsOpen && questDropdownRef.current && !questDropdownRef.current.contains(event.target as Node)) {
        const btn = document.getElementById('quest-button');
        if (btn && btn.contains(event.target as Node)) {
          return;
        }
        setQuestsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [questsOpen]);

  // Mount MapEngine
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const engine = new MapEngine(
      canvasRef.current,
      containerRef.current,
      status,
      { x: initialCoords?.x ?? 13.5, z: initialCoords?.z ?? 75.7 },
      {
        onVisitWaypoint,
        onCollectTreat: (item) => {
          if (onCollectTreat) onCollectTreat(item);
        },
        onTravelCost,
        onCoordsUpdate: (x, z) => {
          setCurrentX(x);
          setCurrentY(z);
        },
        onTravelingState: (traveling, target) => {
          setIsTraveling(traveling);
          setTravelTarget(target);
        },
        onNearWaypointUpdate: (wp) => {
          setNearWaypoint(wp);
        },
        onFacingLeftUpdate: (left) => {
          setFacingLeft(left);
        },
        onMovingStateUpdate: (moving) => {
          setIsMoving(moving);
        },
        onWaypointTriggerError: (msg) => {
          setErrorMessage(msg);
          setTimeout(() => setErrorMessage(null), 5000);
        }
      }
    );

    engineRef.current = engine;

    const handleResize = () => {
      if (containerRef.current && engineRef.current) {
        engineRef.current.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sync status changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateStatus(status);
    }
    setCollectedTreatIds(status.collectedTreats ?? []);
  }, [status]);

  // Sync zoom changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setZoom(zoomLevel);
    }
  }, [zoomLevel]);

  // Sync initialCoords changes
  useEffect(() => {
    if (initialCoords && engineRef.current) {
      engineRef.current.player.x = initialCoords.x;
      engineRef.current.player.z = initialCoords.z;
      setCurrentX(initialCoords.x);
      setCurrentY(initialCoords.z);
    }
  }, [initialCoords]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.max(20, prev - 5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.min(85, prev + 5));
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audio.setMute(nextMute);
  };

  const allWaypointsVisited = ['rival', 'comrades', 'food', 'pet'].every((id) =>
    status.visitedPoints.includes(id)
  );
  const hudEnergySegments = Math.max(0, Math.ceil((status.energy / status.maxEnergy) * 5));
  const hudWarmthSegments = Math.max(0, Math.ceil(status.warmth / 20));
  const hudTrustSegments = Math.max(0, Math.ceil(status.trust / 20));

  return (
    <div className="saga-screen h-screen w-screen relative overflow-hidden" id="gamemap-screen">
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-950/90 border-2 border-red-800 text-red-200 p-4 shadow-[4px_4px_0px_#991b1b] flex items-center gap-3 z-40 text-xs font-sans font-black uppercase tracking-wider absolute top-4 left-1/2 -translate-x-1/2"
            id="map-error-bar"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 animate-pulse" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Side: Floating Stats Panel */}
      <div className="absolute top-[110px] left-4 w-[260px] z-20 bg-[#160d0a]/95 border border-[#4a2e1b] p-3.5 shadow-2xl text-[#ffe0ad] font-sans rounded-xs" id="hud-stats-panel">
        {/* Coordinates & Turn */}
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-[#f4c37c] border-b border-[#4a2e1b]/40 pb-1.5 mb-2">
          <span className="flex items-center gap-1">
            <Navigation className="w-3 h-3 text-[#f4c37c]" />
            X:{currentX} Z:{currentY}
          </span>
          <span>TURN {status.turn}</span>
        </div>

        {/* AP Title & Archetype */}
        <div className="text-[9px] font-black uppercase tracking-wide text-[#ffe0ad]/80 mb-3.5">
          AP {Math.round(status.ap)}/{status.maxEnergy} | {status.archetype}
        </div>

        <div className="space-y-3.5">
          {/* Energy Segment Bar */}
          <div>
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1 text-amber-500">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> ENERGY
              </span>
              <span className="text-[10px] font-black text-amber-500">{status.energy}%</span>
            </div>
            <div className="grid grid-cols-5 gap-0.5 h-2.5 bg-[#0a0503] p-0.5 border border-[#4a2e1b]/60">
              {Array.from({ length: 5 }).map((_, index) => (
                <div 
                  key={index} 
                  className={`h-full ${index < hudEnergySegments ? 'bg-amber-500' : 'bg-[#22130c]'}`}
                ></div>
              ))}
            </div>
          </div>

          {/* Warmth Segment Bar */}
          <div>
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1 text-red-500">
                <Flame className="w-3 h-3 text-red-500 fill-red-500" /> WARMTH
              </span>
              <span className="text-[10px] font-black text-red-500">{status.warmth}%</span>
            </div>
            <div className="grid grid-cols-5 gap-0.5 h-2.5 bg-[#0a0503] p-0.5 border border-[#4a2e1b]/60">
              {Array.from({ length: 5 }).map((_, index) => (
                <div 
                  key={index} 
                  className={`h-full ${index < hudWarmthSegments ? 'bg-orange-500' : 'bg-[#22130c]'}`}
                ></div>
              ))}
            </div>
          </div>

          {/* Trust Segment Bar */}
          <div>
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1 text-purple-400">
                <Heart className="w-3 h-3 text-purple-500 fill-purple-500" /> TRUST
              </span>
              <span className="text-[10px] font-black text-purple-400">{status.trust}%</span>
            </div>
            <div className="grid grid-cols-5 gap-0.5 h-2.5 bg-[#0a0503] p-0.5 border border-[#4a2e1b]/60">
              {Array.from({ length: 5 }).map((_, index) => (
                <div 
                  key={index} 
                  className={`h-full ${index < hudTrustSegments ? 'bg-rose-600' : 'bg-[#22130c]'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full screen Map Canvas Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full z-0 select-none"
        id="map-canvas-container"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0" />

        {/* 3D-to-2D Space Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10">
          
          {/* Active Floating Cat Marker Overlay */}
          <div
            id="active-cat-avatar-marker"
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-[85%] flex flex-col items-center select-none z-20"
          >
            <div className="relative flex flex-col items-center">
              <div
                className={`drop-shadow-[0_8px_6px_rgba(0,0,0,0.25)] transition-transform duration-200 ${
                  isMoving ? (exhausted ? 'animate-[bounce_1.6s_infinite]' : 'animate-bounce') : ''
                } ${thermalDistress ? 'animate-shake' : ''} ${
                  facingLeft ? 'scale-x-[-1]' : 'scale-x-[1]'
                }`}
                style={{ transformOrigin: 'bottom center' }}
              >
                {thermalDistress && (
                  <div className="absolute inset-0 -z-10 rounded-full border border-cyan-200/80 shadow-[0_0_18px_rgba(125,211,252,0.85)] animate-ping"></div>
                )}
                <CatIcon
                  avatarId={status.avatarId}
                  type={thermalDistress ? 'shivering' : 'avatar'}
                  size={144}
                  facingBack={false}
                />
              </div>
              
              <div className="bg-editorial-ink text-editorial-bg text-[8px] font-sans font-black tracking-widest uppercase border border-editorial-ink px-1.5 py-0.5 rounded-xs shadow-md whitespace-nowrap mt-1">
                {status.name}
              </div>
            </div>
          </div>

          {/* Waypoint Clickable HUD Buttons */}
          {WAYPOINTS.map((wp) => {
            const isVisited = status.visitedPoints.includes(wp.id);
            const isActive = activeWaypointId === wp.id;
            
            return (
              <button
                key={wp.id}
                id={`waypoint-${wp.id}`}
                onClick={() => engineRef.current?.startTravel(wp)}
                onMouseEnter={() => {
                  if (!isTraveling) setActiveWaypointId(wp.id);
                }}
                onMouseLeave={() => setActiveWaypointId(null)}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 flex flex-col items-center"
              >
                <div className="relative group">
                  <div className="absolute inset-0 rounded-full bg-editorial-ink/20 scale-125 blur-xs group-hover:scale-150 transition-all"></div>
                  <div className="w-8 h-8 rounded-full border border-editorial-ink flex items-center justify-center bg-editorial-bg hover:bg-editorial-ochre text-editorial-ink hover:text-editorial-bg font-sans font-black text-xs transition-colors shadow-sm">
                    {isVisited ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-800" />
                    ) : wp.id === 'house' ? (
                      <Home className="w-4 h-4 text-rose-700 animate-pulse" />
                    ) : (
                      wp.id.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>

                {isActive && (
                  <div className="absolute top-10 bg-editorial-bg border border-editorial-ink p-2 shadow-md w-32 rounded-xs pointer-events-none text-left z-30">
                    <h4 className="text-[9px] font-sans font-black text-editorial-ochre uppercase tracking-wider">{wp.name}</h4>
                    <p className="text-[8px] leading-tight font-serif text-editorial-ink mt-0.5">{wp.description}</p>
                  </div>
                )}
              </button>
            );
          })}

          {/* Floating DOM interactions for treat items (Marked visually as standalone pawprint indicators) */}
          {TREAT_LOCATIONS.map((treat) => {
            const isCollected = collectedTreatIds.includes(treat.id);
            if (isCollected) return null;
            const isHovered = activeTreatId === treat.id;

            return (
              <div
                key={treat.id}
                id={`treat-node-${treat.id}`}
                onMouseEnter={() => setActiveTreatId(treat.id)}
                onMouseLeave={() => setActiveTreatId(null)}
                onClick={() => engineRef.current?.startTravel(treat)}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center text-amber-600 hover:text-amber-500 cursor-pointer"
              >
                {/* Paw icon explicitly used for treat encounters */}
                <div className="relative p-1.5 bg-amber-950/90 border border-amber-500 rounded-full shadow-lg hover:scale-110 transition-transform">
                  <PawPrint className="w-4 h-4 animate-pulse" />
                </div>

                {isHovered && (
                  <div className="absolute top-9 bg-amber-950 border-2 border-amber-500 p-2 shadow-md w-28 rounded-sm pointer-events-none text-left z-30">
                    <h4 className="text-[9px] font-sans font-black text-amber-400 uppercase tracking-wider">{treat.name} Snack</h4>
                    <p className="text-[8px] leading-tight font-sans text-amber-200 mt-0.5">{treat.effectLabel}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Toolbar - Zoom Adjust Controls */}
        <div className="absolute top-4 left-4 z-30 flex flex-col gap-1.5" id="map-zoom-controls">
          <button
            onClick={handleZoomIn}
            className="bg-editorial-bg hover:bg-editorial-ochre border border-editorial-ink shadow-[2px_2px_0px_#2D2A26] text-editorial-ink w-5 h-5 flex items-center justify-center font-sans font-black text-xs transition-colors cursor-pointer select-none active:bg-editorial-ink active:text-editorial-bg"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-editorial-bg hover:bg-editorial-ochre border border-editorial-ink shadow-[2px_2px_0px_#2D2A26] text-editorial-ink w-5 h-5 flex items-center justify-center font-sans font-black text-xs transition-colors cursor-pointer select-none active:bg-editorial-ink active:text-editorial-bg"
            title="Zoom Out"
          >
            −
          </button>
        </div>

        {/* Toolbar - Mute Sound effects */}
        <div className="absolute top-[68px] left-4 z-30 flex flex-col shadow-[2px_2px_0px_#2D2A26] border border-editorial-ink" id="map-sound-controls">
          <button
            onClick={handleToggleMute}
            className="bg-editorial-bg hover:bg-editorial-ochre text-editorial-ink w-5 h-5 flex items-center justify-center transition-colors cursor-pointer select-none active:bg-editorial-ink active:text-editorial-bg"
            title={isMuted ? 'Unmute game' : 'Mute game'}
          >
            {isMuted ? <VolumeX className="w-3 h-3 text-editorial-ink" /> : <Volume2 className="w-3 h-3 text-editorial-ink" />}
          </button>
        </div>

        {/* Toolbar - Collapsable Instruction box */}
        <div 
          onClick={() => setInstructionExpanded(!instructionExpanded)}
          className="absolute top-4 left-[44px] z-20 bg-editorial-bg/90 backdrop-blur-xs border border-editorial-ink/30 px-3 py-1.5 shadow-xs flex items-center gap-2 max-w-[420px] cursor-pointer hover:bg-[#faf5ec] transition-colors select-none"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-editorial-ochre shrink-0 animate-pulse" />
          {instructionExpanded ? (
            <p className="text-[9.5px] leading-tight font-sans text-editorial-ink font-medium">
              Use <strong>ARROW keys</strong> or <strong>W/A/S/D</strong> to guide {status.name}. Or click nodes to walk automatically. <span className="text-[#b45309] font-black ml-1.5 hover:underline">[COLLAPSE]</span>
            </p>
          ) : (
            <span className="text-[8.5px] font-sans font-black text-editorial-ink uppercase tracking-wider">GUIDE &bull; EXPAND</span>
          )}
        </div>

        {/* Near Waypoint Banner Prompt */}
        <AnimatePresence>
          {nearWaypoint && !isTraveling && (
            <motion.div
              initial={{ opacity: 0, y: 30, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 30, x: '-50%' }}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 parchment-panel px-5 py-3 z-30 flex items-center gap-3"
            >
              <div className="w-2.5 h-2.5 bg-editorial-ochre animate-ping rounded-full shrink-0"></div>
              <span className="text-[10px] font-sans font-black uppercase tracking-wider text-editorial-ink whitespace-nowrap">
                Near {nearWaypoint.name}. Press <span className="px-1.5 py-0.5 bg-editorial-ink text-editorial-bg rounded-sm font-mono text-[9px] mx-0.5">SPACE</span> or <span className="px-1.5 py-0.5 bg-editorial-ink text-editorial-bg rounded-sm font-mono text-[9px] mx-0.5">ENTER</span> to explore!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-traveling overlay block */}
        {isTraveling && travelTarget && (
          <div className="absolute top-4 right-[156px] bg-editorial-bg border border-editorial-ink px-3 py-1.5 z-20 shadow-xs flex items-center gap-2 text-[10px] font-sans font-black text-editorial-ochre uppercase tracking-wider animate-pulse">
            <Navigation className="w-3.5 h-3.5 animate-spin text-editorial-ink" />
            <span>{exhausted ? 'CRAWLING TO' : 'GUIDING TO'}: {travelTarget.name}</span>
          </div>
        )}

        {/* Hypothermia warning overlay */}
        {status.hypothermia && (
          <div className="absolute bottom-4 right-4 z-30 bg-cyan-950/90 border border-cyan-300 text-cyan-100 px-3 py-1.5 text-[9px] font-sans font-black uppercase tracking-wider shadow-md">
            Hypothermia: AP recovery halved
          </div>
        )}

        {/* Bottom Left Soundtrack Controller */}
        <div className="absolute bottom-4 left-4 z-30">
          <MusicController
            playing={musicPlaying}
            setPlaying={setMusicPlaying}
            volume={musicVolume}
            setVolume={setMusicVolume}
            muted={musicMuted}
            setMuted={setMusicMuted}
            theme="map"
            align="left"
            direction="up"
          />
        </div>

        {/* Right Side: Active Quests Toggle Button */}
        <button
          id="quest-button"
          onClick={() => setQuestsOpen(!questsOpen)}
          className="saga-button absolute top-4 right-4 z-30 px-1.5 py-1 transition-all flex items-center justify-between gap-1 cursor-pointer select-none w-[130px] h-10"
          title="View Active Quests"
        >
          <div className="w-6 h-6 flex items-center justify-center shrink-0 bg-editorial-beige border border-editorial-ink/10 relative overflow-hidden rounded-xs p-0.5">
            <img
              src={questImgSrc}
              alt="Quests"
              className={`w-full h-full object-contain transition-transform duration-200 hover:scale-105 ${questImgFailed ? 'opacity-0 absolute' : 'opacity-100'}`}
              onError={() => {
                if (questImgSrc === '/quest.png') {
                  setQuestImgSrc('/quest-1.png');
                } else {
                  setQuestImgFailed(true);
                }
              }}
            />
            {questImgFailed && (
              <CheckCircle2 className="w-3.5 h-3.5 text-editorial-ochre animate-pulse" />
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[6.5px] font-sans font-black text-editorial-ochre uppercase tracking-wider leading-none mb-0.5">ACTIVE</span>
            <span className="text-[9px] font-sans font-black text-editorial-ink leading-none tracking-wide">QUESTS</span>
          </div>
          <span className="bg-editorial-ink text-editorial-bg text-[8px] font-sans font-black px-1 py-0.5 ml-0.5 rounded-xs shrink-0">
            {status.visitedPoints.length}/4
          </span>
          {/* Green Indicator Tag */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border border-emerald-600 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse z-20"></span>
        </button>

        {/* Active Quests & Loot Sidebar Overlay */}
        <AnimatePresence>
          {questsOpen && (
            <motion.div
              ref={questDropdownRef}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="parchment-panel absolute top-[58px] right-4 w-[340px] z-40 p-4 flex flex-col gap-4 text-editorial-ink shadow-2xl"
              id="objectives-widget"
            >
              {/* Header */}
              <div className="border-b border-editorial-ink/20 pb-2 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-editorial-ochre inline-block"></span>
                  <h3 className="text-xs font-sans font-black text-editorial-ochre uppercase tracking-widest">ACTIVE QUESTS</h3>
                </div>
                <button
                  onClick={() => setQuestsOpen(false)}
                  className="text-editorial-ink hover:text-editorial-ochre p-1 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-[10.5px] font-serif text-editorial-ink/80 italic leading-relaxed">
                Ms. Eleanor's cottage steps are locked. You must explore all four outer landmarks before her porch unlocks.
              </p>

              {/* Waypoint Checklist */}
              <ul className="flex flex-col gap-2 font-sans text-xs">
                {WAYPOINTS.filter(wp => wp.id !== 'house' && wp.id !== 'pond').map((wp) => {
                  const isFound = status.visitedPoints.includes(wp.id);
                  return (
                    <li
                      key={wp.id}
                      onClick={() => {
                        if (!isTraveling) {
                          engineRef.current?.startTravel(wp);
                        }
                      }}
                      className="flex items-center gap-2.5 py-1.5 px-1.5 border border-transparent hover:border-editorial-ink/10 hover:bg-[#faf5ec] cursor-pointer transition-all group rounded-sm"
                    >
                      {/* Checkbox circles matching the design: checked teal, unchecked neutral */}
                      <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isFound 
                          ? 'border-teal-600 bg-teal-50 text-teal-600' 
                          : 'border-[#b5a695] bg-[#faf6f0]'
                      }`}>
                        {isFound && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 fill-teal-50" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`font-black text-[9.5px] uppercase tracking-wider block ${
                          isFound ? 'line-through text-stone-500' : 'text-editorial-ink'
                        }`}>
                          {wp.name}
                        </span>
                      </div>
                      {!isFound && (
                        <span className="text-[8px] font-sans font-black text-editorial-ochre opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                          Go &rarr;
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* LOOT / Inventory Section inside sidebar */}
              <div className="border-t border-[#d6c7b3] pt-3 mt-1">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-editorial-ochre mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#b45309] inline-block"></span>
                    LOOT
                  </span>
                  <span>{status.inventory.length}/5</span>
                </div>
                {status.inventory.length > 0 ? (
                  <div className="flex flex-col gap-2 max-h-[190px] overflow-y-auto pr-0.5">
                    {status.inventory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onUseItem(item.id)}
                        className="w-full text-left p-3 border border-[#f4c37c]/35 bg-gradient-to-r from-[#2a170f] to-[#42261a] hover:from-[#3a2217] hover:to-[#523122] transition-colors shadow-md rounded-xs cursor-pointer group flex flex-col justify-center"
                        title={`Consume ${item.name}`}
                      >
                        <span className="font-sans font-black text-[9px] text-[#ffe0ad] tracking-wider block mb-0.5 uppercase">
                          {item.name}
                        </span>
                        <span className="font-sans font-bold text-[8px] text-[#f4c37c]/80 tracking-wide block uppercase">
                          {item.effectLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[9px] font-serif text-editorial-ink/65 italic">
                    No survival loot collected. Explore points of interest!
                  </p>
                )}
              </div>

              {/* Cottage unlock indicator card */}
              <div className={`p-2.5 border flex items-start gap-2.5 mt-1 ${
                allWaypointsVisited 
                  ? 'bg-emerald-50 border-emerald-500/30 text-emerald-800' 
                  : 'bg-[#faeae7] border-[#f3c2bc] text-red-800'
              }`}>
                <div className={`p-1.5 rounded-xs shrink-0 ${allWaypointsVisited ? 'bg-emerald-100 text-emerald-800' : 'bg-[#fcdcd8] text-red-700'}`}>
                  <Home className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[9px] font-sans font-black uppercase tracking-wider block leading-none mb-1">
                    Ms. Eleanor's Cottage
                  </span>
                  <p className="text-[9px] leading-tight font-serif text-stone-700">
                    {allWaypointsVisited 
                      ? "UNLOCKED! Head to the cottage steps (H) for your safe haven."
                      : "LOCKED. Complete all 4 landmarks first."
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};