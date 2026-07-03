import { useState } from 'react';
import { CatStatus, GameState, Waypoint } from './types';
import { AvatarSelection } from './components/AvatarSelection';
import { Prologue } from './components/Prologue';
import { GameMap } from './components/GameMap';
import { ScenarioDialog } from './components/ScenarioDialog';
import { Ending } from './components/Ending';
import { AVATARS } from './data/storyData';

const INITIAL_STATUS: CatStatus = {
  name: 'Luna',
  avatarId: 'calico',
  energy: 75,
  warmth: 55,
  trust: 25,
  visitedPoints: []
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('SELECTION');
  const [catStatus, setCatStatus] = useState<CatStatus>(INITIAL_STATUS);
  const [catCoords, setCatCoords] = useState<{ x: number; z: number }>({ x: 13.5, z: 75.7 });
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  // Character selection callback
  const handleAvatarSelected = (name: string, avatarId: string) => {
    const avatar = AVATARS.find(a => a.id === avatarId);
    const stats = avatar?.startingStats ?? { energy: 75, warmth: 55, trust: 25 };
    setCatStatus({
      name,
      avatarId,
      energy: stats.energy,
      warmth: stats.warmth,
      trust: stats.trust,
      visitedPoints: []
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

  // Visual novel scenario dialogue completion callback
  const handleScenarioComplete = (statusChanges: { energy: number; warmth: number; trust: number }) => {
    // Apply changes to kitten state safely (clamping between 0% and 100%)
    setCatStatus((prev) => {
      const nextEnergy = Math.min(100, Math.max(0, prev.energy + statusChanges.energy));
      const nextWarmth = Math.min(100, Math.max(0, prev.warmth + statusChanges.warmth));
      const nextTrust = Math.min(100, Math.max(0, prev.trust + statusChanges.trust));
      
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
        visitedPoints: updatedVisited
      };
    });

    if (activeScenarioId === 'house') {
      // Reached Ms. Eleanor's cottage steps and completed the story
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
    setGameState('ENDING');
  };

  // Reset the game to play again
  const handleRestart = () => {
    setCatStatus(INITIAL_STATUS);
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
          />
          <ScenarioDialog 
            scenarioId={activeScenarioId} 
            catName={catStatus.name} 
            avatarId={catStatus.avatarId} 
            onComplete={handleScenarioComplete} 
          />
        </div>
      )}

      {gameState === 'ENDING' && (
        <Ending 
          catName={catStatus.name} 
          avatarId={catStatus.avatarId} 
          onRestart={handleRestart} 
        />
      )}
    </div>
  );
}
