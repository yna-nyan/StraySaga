import { useEffect, useRef, useState } from 'react';
import { CatStatus, GameState, Hazard, InventoryItem, Waypoint } from './types';
import { AvatarSelection } from './components/AvatarSelection';
import { Prologue } from './components/Prologue';
import { GameMap } from './components/GameMap';
import { ScenarioDialog } from './components/ScenarioDialog';
import { Ending } from './components/Ending';
import { AVATARS, WAYPOINTS } from './data/storyData';
import {
  clampStat,
  computeTurns,
  computeEnergyCost,
  computeWarmthDrain,
  computeHopeEarned,
  computeWarmthBonus,
  applyCautiousWarmthPenalty,
  applyInnocentTrustBonus,
} from './utils/gameLogic';

const INITIAL_STATUS: CatStatus = {
  name: 'Luna',
  avatarId: 'calico',
  archetypeId: 'forager',
  archetype: 'The Adaptable Forager',
  energy: 100,
  maxEnergy: 100,
  warmth: 55,
  trust: 25,
  ap: 100,
  turn: 1,
  hope: 0,
  inventory: [],
  hypothermia: false,
  visitedPoints: []
};

const createInitialHazards = (): Hazard[] => [
  {
    id: 'rival-cat',
    name: 'Rival Cat',
    x: 27,
    y: 45,
    route: ['rival', 'comrades', 'pond', 'food'],
    routeIndex: 0,
    color: '#ef6f38',
    penalty: { energy: -5, warmth: -8 }
  },
  {
    id: 'barking-dog',
    name: 'Barking Dog',
    x: 66,
    y: 58.6,
    route: ['pet', 'food', 'pond', 'comrades'],
    routeIndex: 0,
    color: '#8b5cf6',
    penalty: { energy: -5, warmth: -10 }
  }
];

const getStoredHope = () => {
  if (typeof window === 'undefined') return 0;
  return Number(window.localStorage.getItem('straySagaHope') || 0);
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('SELECTION');
  const [catStatus, setCatStatus] = useState<CatStatus>({ ...INITIAL_STATUS, hope: getStoredHope() });
  const [catCoords, setCatCoords] = useState<{ x: number; z: number }>({ x: 13.5, z: 75.7 });
  const [hazards, setHazards] = useState<Hazard[]>(createInitialHazards);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [endingMode, setEndingMode] = useState<'adopted' | 'defeated'>('adopted');
  const hazardStepRef = useRef(Math.floor(catStatus.turn / 2));

  useEffect(() => {
    const hazardStep = Math.floor(catStatus.turn / 2);
    if (hazardStep <= hazardStepRef.current) return;

    hazardStepRef.current = hazardStep;
    setHazards((current) => current.map((hazard) => {
      // Find next route index, skipping 'house' and the waypoint the cat is actively interacting with
      let nextRouteIndex = (hazard.routeIndex + 1) % hazard.route.length;
      let attempts = 0;
      while (
        (hazard.route[nextRouteIndex] === 'house' || hazard.route[nextRouteIndex] === activeScenarioId) &&
        attempts < hazard.route.length
      ) {
        nextRouteIndex = (nextRouteIndex + 1) % hazard.route.length;
        attempts++;
      }
      // If all waypoints in the route are blocked, stay in place
      if (attempts >= hazard.route.length) return hazard;
      const nextWaypoint = WAYPOINTS.find((wp) => wp.id === hazard.route[nextRouteIndex]);
      return nextWaypoint
        ? { ...hazard, x: nextWaypoint.x, y: nextWaypoint.y, routeIndex: nextRouteIndex }
        : hazard;
    }));
  }, [catStatus.turn, activeScenarioId]);

  // Character selection callback
  const handleAvatarSelected = (name: string, avatarId: string) => {
    const avatar = AVATARS.find(a => a.id === avatarId);
    const stats = avatar?.startingStats ?? { energy: 75, warmth: 55, trust: 25 };
    const hope = getStoredHope();
    const warmthBoost = computeWarmthBonus(hope);
    const startingWarmth = clampStat(stats.warmth + warmthBoost);
    setCatStatus({
      name,
      avatarId,
      archetypeId: avatar?.archetypeId ?? 'forager',
      archetype: avatar?.archetype ?? 'The Adaptable Forager',
      energy: stats.energy,
      maxEnergy: 100,
      warmth: startingWarmth,
      trust: stats.trust,
      ap: 100,
      turn: 1,
      hope,
      inventory: [],
      equippedAccessoryId: undefined,
      hypothermia: false,
      visitedPoints: []
    });
    setCatCoords({ x: 13.5, z: 75.7 });
    hazardStepRef.current = 0;
    setHazards(createInitialHazards());
    setGameState('PROLOGUE');
  };

  // Prologue completion callback
  const handlePrologueComplete = () => {
    setGameState('EXPLORATION');
  };

  // Interactive waypoint selected on map
  const handleVisitWaypoint = (waypoint: Waypoint) => {
    setCatCoords({ x: waypoint.x, z: waypoint.y });
    setActiveScenarioId(waypoint.scenarioId);
    setGameState('SCENARIO');
  };

  const handleTravelCost = (distance: number, terrain: 'clear' | 'complex' = 'clear') => {
    const turns = computeTurns(distance);
    const apCost = computeEnergyCost(distance, terrain);
    const warmthDrain = computeWarmthDrain(distance);

    setCatStatus((prev) => {
      const hypothermia = prev.hypothermia || prev.warmth - warmthDrain <= 0;
      const recoveryPenalty = hypothermia ? 0.5 : 1;
      const nextEnergy = clampStat(prev.energy - apCost, prev.maxEnergy);
      const nextWarmth = clampStat(prev.warmth - warmthDrain);
      const nextAp = clampStat(prev.ap - apCost + 5 * recoveryPenalty, prev.maxEnergy);

      if (nextEnergy <= 0) {
        const earnedHope = computeHopeEarned(prev.trust, prev.visitedPoints.length);
        const totalHope = prev.hope + earnedHope;
        window.localStorage.setItem('straySagaHope', String(totalHope));
        setEndingMode('defeated');
        setGameState('ENDING');
        setActiveScenarioId(null);
        return { ...prev, energy: 0, warmth: nextWarmth, ap: nextAp, turn: prev.turn + turns, hope: totalHope, hypothermia };
      }

      return {
        ...prev,
        energy: nextEnergy,
        warmth: nextWarmth,
        ap: nextAp,
        turn: prev.turn + turns,
        hypothermia
      };
    });
  };

  // Visual novel scenario dialogue completion callback
  const handleScenarioComplete = (statusChanges: { energy: number; warmth: number; trust: number }) => {
    // Apply changes to kitten state safely (clamping between 0% and 100%)
    setCatStatus((prev) => {
      const trustGain = prev.archetypeId === 'innocent' && statusChanges.trust > 0
        ? applyInnocentTrustBonus(statusChanges.trust)
        : statusChanges.trust;
      const equippedAccessory = prev.inventory.find((item) => item.id === prev.equippedAccessoryId && item.kind === 'accessory');
      const modifiedTrustGain = trustGain > 0
        ? Math.ceil(trustGain * (equippedAccessory?.trustMultiplier ?? 1))
        : trustGain;
      const rivalWarmthChange = prev.archetypeId === 'cautious' && activeScenarioId === 'rival' && statusChanges.warmth < 0
        ? applyCautiousWarmthPenalty(statusChanges.warmth)
        : statusChanges.warmth;
      const nextEnergy = clampStat(prev.energy + statusChanges.energy, prev.maxEnergy);
      const nextWarmth = clampStat(prev.warmth + rivalWarmthChange);
      const nextTrust = clampStat(prev.trust + modifiedTrustGain);
      const inventory: InventoryItem[] = [...prev.inventory];

      if (activeScenarioId === 'food' && inventory.length < 3) {
        inventory.push({ id: `fish-${Date.now()}`, name: 'Discarded Fish Skeleton', kind: 'consumable', effectLabel: '+75 Energy', energy: 75 });
        if (prev.archetypeId === 'forager' && inventory.length < 3) {
          inventory.push({ id: `cardboard-${Date.now()}`, name: 'Dry Cardboard Sheet', kind: 'consumable', effectLabel: '+30 Warmth', warmth: 30 });
        }
      }

      if (activeScenarioId === 'pet' && !inventory.some((item) => item.id === 'lost-red-collar')) {
        inventory.push({
          id: 'lost-red-collar',
          name: 'Lost Red Collar',
          kind: 'accessory',
          effectLabel: '+10% Trust gains',
          trustMultiplier: 1.1
        });
      }
      
      const updatedVisited = [...prev.visitedPoints];
      // Do not add 'pond' or 'house' to the paw print checklist, only actual paws (rival, comrades, food, pet)
      if (activeScenarioId && activeScenarioId !== 'pond' && activeScenarioId !== 'house' && !updatedVisited.includes(activeScenarioId)) {
        updatedVisited.push(activeScenarioId);
      }

      return {
        ...prev,
        energy: nextEnergy,
        warmth: nextWarmth,
        trust: nextTrust,
        inventory,
        hypothermia: prev.hypothermia || nextWarmth <= 0,
        visitedPoints: updatedVisited
      };
    });

    if (activeScenarioId === 'house') {
      // Reached Ms. Eleanor's cottage steps and completed the story
      setEndingMode('adopted');
      setGameState('ENDING');
      setActiveScenarioId(null);
    } else {
      // Resume exploring
      setGameState('EXPLORATION');
      setActiveScenarioId(null);
    }
  };

  // Unlocking ending triggers from map (backup shortcut)
  const handleUnlockEnding = () => {
    setEndingMode('adopted');
    setGameState('ENDING');
  };

  const handleUseItem = (itemId: string) => {
    setCatStatus((prev) => {
      const item = prev.inventory.find((entry) => entry.id === itemId);
      if (!item) return prev;
      if (item.kind === 'accessory') {
        return {
          ...prev,
          equippedAccessoryId: prev.equippedAccessoryId === item.id ? undefined : item.id
        };
      }
      return {
        ...prev,
        energy: clampStat(prev.energy + (item.energy ?? 0), prev.maxEnergy),
        warmth: clampStat(prev.warmth + (item.warmth ?? 0)),
        inventory: prev.inventory.filter((entry) => entry.id !== itemId),
        hypothermia: item.warmth ? false : prev.hypothermia
      };
    });
  };

  const handleHazardCollision = (hazard: Hazard) => {
    setCatStatus((prev) => {
      const nextEnergy = clampStat(prev.energy + hazard.penalty.energy, prev.maxEnergy);
      const nextWarmth = clampStat(prev.warmth + hazard.penalty.warmth);
      if (nextEnergy <= 0) {
        const earnedHope = computeHopeEarned(prev.trust, prev.visitedPoints.length);
        const totalHope = prev.hope + earnedHope;
        window.localStorage.setItem('straySagaHope', String(totalHope));
        setEndingMode('defeated');
        setGameState('ENDING');
        setActiveScenarioId(null);
        return { ...prev, energy: 0, warmth: nextWarmth, hope: totalHope, hypothermia: prev.hypothermia || nextWarmth <= 0 };
      }

      return {
        ...prev,
        energy: nextEnergy,
        warmth: nextWarmth,
        hypothermia: prev.hypothermia || nextWarmth <= 0
      };
    });
  };

  // Reset the game to play again
  const handleRestart = () => {
    setCatStatus({ ...INITIAL_STATUS, hope: getStoredHope() });
    setCatCoords({ x: 13.5, z: 75.7 });
    hazardStepRef.current = 0;
    setHazards(createInitialHazards());
    setGameState('SELECTION');
    setActiveScenarioId(null);
  };

  return (
    <div 
      className="min-h-screen text-zinc-100 bg-cover bg-center bg-no-repeat bg-fixed" 
      style={{ backgroundImage: "url('/under_base.png')", backgroundColor: '#121214' }}
      id="stray-saga-game-root"
    >
      {gameState === 'SELECTION' && (
        <AvatarSelection onSelect={handleAvatarSelected} />
      )}

      {gameState === 'PROLOGUE' && (
        <Prologue 
          catName={catStatus.name} 
          avatarId={catStatus.avatarId} 
          onComplete={handlePrologueComplete} 
        />
      )}

      {gameState === 'EXPLORATION' && (
        <GameMap 
          status={catStatus} 
          initialCoords={catCoords}
          onVisitWaypoint={handleVisitWaypoint} 
          onUnlockEnding={handleUnlockEnding} 
          onTravelCost={handleTravelCost}
          onUseItem={handleUseItem}
          hazards={hazards}
          onHazardCollision={handleHazardCollision}
        />
      )}

      {gameState === 'SCENARIO' && activeScenarioId && (
        <div className="relative">
          {/* Map is kept visible in background during dialogue overlay for spatial coherence */}
          <GameMap 
            status={catStatus} 
            initialCoords={catCoords}
            onVisitWaypoint={() => {}} 
            onUnlockEnding={() => {}} 
            onTravelCost={() => {}}
            onUseItem={() => {}}
            hazards={hazards}
            onHazardCollision={() => {}}
          />
          <ScenarioDialog 
            scenarioId={activeScenarioId} 
          catName={catStatus.name} 
          avatarId={catStatus.avatarId} 
          status={catStatus}
          onComplete={handleScenarioComplete} 
        />
        </div>
      )}

      {gameState === 'ENDING' && (
        <Ending 
          catName={catStatus.name} 
          avatarId={catStatus.avatarId} 
          mode={endingMode}
          hope={catStatus.hope}
          onRestart={handleRestart} 
        />
      )}
    </div>
  );
}
