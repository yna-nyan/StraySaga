import type { CatStatus } from '../types';

/**
 * Computes the number of turns required to travel a given distance.
 * Formula: max(1, ceil(distance / 18))
 */
export function computeTurns(distance: number): number {
  return Math.max(1, Math.ceil(distance / 18));
}

/**
 * Computes the energy cost for traveling a given distance over a terrain type.
 * Formula: baseCost * computeTurns(distance)
 *   baseCost = 8 for 'complex' terrain (rival, pond waypoints)
 *   baseCost = 5 for 'clear' terrain
 */
export function computeEnergyCost(distance: number, terrain: 'clear' | 'complex'): number {
  const baseCost = terrain === 'complex' ? 8 : 5;
  return baseCost * computeTurns(distance);
}

/**
 * Computes the warmth drain for traveling a given distance.
 * Formula: 4 * computeTurns(distance)
 */
export function computeWarmthDrain(distance: number): number {
  return 4 * computeTurns(distance);
}

/**
 * Computes the Hope earned on defeat.
 * Formula: max(1, floor(trust / 5) + visitedCount * 2)
 */
export function computeHopeEarned(trust: number, visitedCount: number): number {
  return Math.max(1, Math.floor(trust / 5) + visitedCount * 2);
}

/**
 * Computes the starting Warmth bonus from accumulated Hope.
 * Formula: min(20, floor(hope / 20) * 5)
 */
export function computeWarmthBonus(hope: number): number {
  return Math.min(20, Math.floor(hope / 20) * 5);
}

/**
 * Clamps a stat value to the range [0, max].
 * Defaults max to 100 if not provided.
 */
export function clampStat(value: number, max: number = 100): number {
  return Math.min(max, Math.max(0, value));
}

/**
 * Resolves whether a given choice succeeds based on the cat's current status.
 *
 * FIGHT: succeeds if energy > 60
 * SNEAK: succeeds if archetypeId === 'rogue' OR energy > 45
 * BEG:   succeeds if trust > 40
 */
export function resolveChoice(
  choiceId: 'fight' | 'sneak' | 'beg',
  status: Pick<CatStatus, 'energy' | 'trust' | 'archetypeId'>
): boolean {
  switch (choiceId) {
    case 'fight':
      return status.energy > 60;
    case 'sneak':
      return status.archetypeId === 'rogue' || status.energy > 45;
    case 'beg':
      return status.trust > 40;
  }
}

/**
 * Applies the Cautious archetype's warmth penalty reduction.
 * Halves the negative delta, rounding toward zero (ceiling).
 * Formula: ceil(negativeDelta / 2)
 *
 * @param negativeDelta - A negative number representing the warmth penalty.
 * @returns The reduced (less severe) warmth penalty, still negative.
 */
export function applyCautiousWarmthPenalty(negativeDelta: number): number {
  return Math.ceil(negativeDelta / 2);
}

/**
 * Applies the Innocent archetype's trust bonus doubling.
 * Formula: positiveDelta * 2
 *
 * @param positiveDelta - A positive number representing the trust gain.
 * @returns The doubled trust gain.
 */
export function applyInnocentTrustBonus(positiveDelta: number): number {
  return positiveDelta * 2;
}

/**
 * Checks whether the house waypoint is accessible.
 * Requires all four PawPoints to be present in visitedPoints:
 * 'rival', 'comrades', 'food', 'pet'
 */
export function isHouseAccessible(visitedPoints: string[]): boolean {
  const required = ['rival', 'comrades', 'food', 'pet'];
  return required.every(id => visitedPoints.includes(id));
}
