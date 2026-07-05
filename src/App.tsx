import { useState } from 'react';
import { CatStatus, GameState, InventoryItem, Waypoint } from './types';
import { AvatarSelection } from './components/AvatarSelection';
import { Prologue } from './components/Prologue';
import { GameMap } from './components/GameMap';
import { ScenarioDialog } from './components/ScenarioDialog';
import { Ending } from './components/Ending';
import { AVATARS } from './data/storyData';

const INITIAL_STATUS: CatStatus = {
  name: 'Luna',
  avatarId: 'calico',
  archetypeId: 'forager',
  archetype: 'The Adaptable Forager',
  energy: 95,
  maxEnergy: 95,
  warmth: 55,
  trust: 25,
  ap: 95,
  turn: 1,
  hope: 0,
  inventory: [],
  hypothermia: false,
  visitedPoints: [],
  collectedTreats: []
};

const clampStat = (value: number, max = 100) => Math.min(max, Math.max(0, value));

const getStoredHope = () => {
  if (typeof window === 'undefined') return 0;
  return Number(window.localStorage.getItem('straySagaHope') || 0);
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('SELECTION');
  const [catStatus, setCatStatus] = useState<CatStatus>({ ...INITIAL_STATUS, hope: getStoredHope() });
  const [catCoords, setCatCoords] = useState<{ x: number; z: number }>({ x: 13.5, z: 75.7 });
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [endingMode, setEndingMode] = useState<'adopted' | 'defeated'>('adopted');

  // Character selection callback
  const handleAvatarSelected = (name: string, avatarId: string) => {
    const avatar = AVATARS.find(a => a.id === avatarId);
    const stats = avatar?.startingStats ?? { energy: 75, warmth: 55, trust: 25 };
    const hope = getStoredHope();
    const warmthBoost = Math.min(20, Math.floor(hope / 20) * 5);
    const startingWarmth = clampStat(stats.warmth + warmthBoost);
    setCatStatus({
      name,
      avatarId,
      archetypeId: avatar?.archetypeId ?? 'forager',
      archetype: avatar?.archetype ?? 'The Adaptable Forager',
      energy: stats.energy,
      maxEnergy: stats.energy,
      warmth: startingWarmth,
      trust: stats.trust,
      ap: stats.energy,
      turn: 1,
      hope,
      inventory: [],
      hypothermia: false,
      visitedPoints: [],
      collectedTreats: []
    });
    setCatCoords({ x: 13.5, z: 75.7 });
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
    const baseCost = terrain === 'complex' ? 18 : 10;
    const turns = Math.max(1, Math.ceil(distance / 18));
    const apCost = baseCost * turns;
    const warmthDrain = 4 * turns;

    setCatStatus((prev) => {
      const hypothermia = prev.hypothermia || prev.warmth - warmthDrain <= 0;
      const recoveryPenalty = hypothermia ? 0.5 : 1;
      const nextEnergy = clampStat(prev.energy - apCost, prev.maxEnergy);
      const nextWarmth = clampStat(prev.warmth - warmthDrain);
      const nextAp = clampStat(prev.ap - apCost + 5 * recoveryPenalty, prev.maxEnergy);

      if (nextEnergy <= 0) {
        const earnedHope = Math.max(1, Math.floor(prev.trust / 5) + prev.visitedPoints.length * 2);
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
        ? statusChanges.trust * 2
        : statusChanges.trust;
      const rivalWarmthChange = prev.archetypeId === 'cautious' && activeScenarioId === 'rival' && statusChanges.warmth < 0
        ? Math.ceil(statusChanges.warmth / 2)
        : statusChanges.warmth;
      const nextEnergy = clampStat(prev.energy + statusChanges.energy, prev.maxEnergy);
      const nextWarmth = clampStat(prev.warmth + rivalWarmthChange);
      const nextTrust = clampStat(prev.trust + trustGain);
      const inventory: InventoryItem[] = [...prev.inventory];

      if (activeScenarioId === 'food' && inventory.length < 3) {
        inventory.push({ id: `fish-${Date.now()}`, name: 'Discarded Fish Skeleton', kind: 'consumable', effectLabel: '+25 Energy', energy: 25 });
        if (prev.archetypeId === 'forager' && inventory.length < 3) {
          inventory.push({ id: `cardboard-${Date.now()}`, name: 'Dry Cardboard Sheet', kind: 'consumable', effectLabel: '+30 Warmth', warmth: 30 });
        }
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
      return {
        ...prev,
        energy: clampStat(prev.energy + (item.energy ?? 0), prev.maxEnergy),
        warmth: clampStat(prev.warmth + (item.warmth ?? 0)),
        inventory: prev.inventory.filter((entry) => entry.id !== itemId),
        hypothermia: item.warmth ? false : prev.hypothermia
      };
    });
  };

  const handleCollectTreat = (item: { id: string; name: string; effectLabel: string; energy: number }) => {
    setCatStatus((prev) => {
      if (prev.inventory.some(inv => inv.id === item.id)) {
        return prev;
      }
      const newItem: InventoryItem = {
        id: item.id,
        name: item.name,
        kind: 'consumable',
        effectLabel: item.effectLabel,
        energy: item.energy
      };
      return {
        ...prev,
        inventory: [...prev.inventory, newItem],
        collectedTreats: [...(prev.collectedTreats || []), item.id]
      };
    });
  };

  // Reset the game to play again
  const handleRestart = () => {
    setCatStatus({ ...INITIAL_STATUS, hope: getStoredHope() });
    setCatCoords({ x: 13.5, z: 75.7 });
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
          onCollectTreat={handleCollectTreat}
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
            onCollectTreat={() => {}}
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
