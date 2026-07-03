export interface AvatarStartingStats {
  energy: number;
  warmth: number;
  trust: number;
}

export interface Avatar {
  id: string;
  name: string;
  breed: string;
  description: string;
  color: string; // Tailind bg class
  textColor: string;
  accentColor: string;
  portraitSvg: string; // custom cute SVG representing the cat
  startingStats: AvatarStartingStats;
}

export type GameState = 'INTRO' | 'SELECTION' | 'PROLOGUE' | 'EXPLORATION' | 'SCENARIO' | 'ENDING';

export interface CatStatus {
  name: string;
  avatarId: string;
  energy: number; // 0 - 100
  warmth: number; // 0 - 100
  trust: number;  // 0 - 100
  visitedPoints: string[]; // list of visited point IDs
}

export interface ScenarioLine {
  speaker: string;
  text: string;
  type: 'speech' | 'thought' | 'narration' | 'scene' | 'audio';
  action?: string; // special triggers
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  pawColor: 'blue' | 'orange' | 'green' | 'purple' | 'yellow' | 'red';
  lines: ScenarioLine[];
}

export interface Waypoint {
  id: string;
  name: string;
  description: string;
  x: number; // percentage coordinate on map 0-100
  y: number; // percentage coordinate on map 0-100
  color: string; // CSS color or Tailwind class
  glowColor: string;
  type: 'rival' | 'pond' | 'comrades' | 'food' | 'pet' | 'house';
  scenarioId: string;
}
