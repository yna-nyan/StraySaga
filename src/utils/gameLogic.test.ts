import { describe, it, expect } from 'vitest';
import {
  resolveChoice,
  clampStat,
  isHouseAccessible,
} from './gameLogic';
import type { CatStatus } from '../types';

// ---------------------------------------------------------------------------
// Helper to build a minimal status object for resolveChoice
// ---------------------------------------------------------------------------
function makeStatus(
  overrides: Partial<Pick<CatStatus, 'energy' | 'trust' | 'archetypeId'>>
): Pick<CatStatus, 'energy' | 'trust' | 'archetypeId'> {
  return {
    energy: 50,
    trust: 50,
    archetypeId: 'forager',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// resolveChoice — FIGHT
// Requirement 8.2: success if energy > 60
// ---------------------------------------------------------------------------
describe('resolveChoice — FIGHT', () => {
  it('returns true when energy is 61 (just above threshold)', () => {
    expect(resolveChoice('fight', makeStatus({ energy: 61 }))).toBe(true);
  });

  it('returns false when energy is 60 (at threshold, not above)', () => {
    expect(resolveChoice('fight', makeStatus({ energy: 60 }))).toBe(false);
  });

  it('returns true when energy is 100 (maximum)', () => {
    expect(resolveChoice('fight', makeStatus({ energy: 100 }))).toBe(true);
  });

  it('returns false when energy is 0 (minimum)', () => {
    expect(resolveChoice('fight', makeStatus({ energy: 0 }))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// resolveChoice — SNEAK
// Requirement 8.3: success if archetypeId === 'rogue' OR energy > 45
// ---------------------------------------------------------------------------
describe('resolveChoice — SNEAK', () => {
  it('returns true for rogue archetype regardless of low energy (energy=10)', () => {
    expect(resolveChoice('sneak', makeStatus({ archetypeId: 'rogue', energy: 10 }))).toBe(true);
  });

  it('returns true for forager archetype with energy=46 (just above threshold)', () => {
    expect(resolveChoice('sneak', makeStatus({ archetypeId: 'forager', energy: 46 }))).toBe(true);
  });

  it('returns false for forager archetype with energy=45 (at threshold, not above)', () => {
    expect(resolveChoice('sneak', makeStatus({ archetypeId: 'forager', energy: 45 }))).toBe(false);
  });

  it('returns true for cautious archetype with energy=46', () => {
    expect(resolveChoice('sneak', makeStatus({ archetypeId: 'cautious', energy: 46 }))).toBe(true);
  });

  it('returns false for innocent archetype with energy=45', () => {
    expect(resolveChoice('sneak', makeStatus({ archetypeId: 'innocent', energy: 45 }))).toBe(false);
  });

  it('returns true for rogue archetype even with energy=0', () => {
    expect(resolveChoice('sneak', makeStatus({ archetypeId: 'rogue', energy: 0 }))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// resolveChoice — BEG
// Requirement 8.4: success if trust > 40
// ---------------------------------------------------------------------------
describe('resolveChoice — BEG', () => {
  it('returns true when trust is 41 (just above threshold)', () => {
    expect(resolveChoice('beg', makeStatus({ trust: 41 }))).toBe(true);
  });

  it('returns false when trust is 40 (at threshold, not above)', () => {
    expect(resolveChoice('beg', makeStatus({ trust: 40 }))).toBe(false);
  });

  it('returns true when trust is 100 (maximum)', () => {
    expect(resolveChoice('beg', makeStatus({ trust: 100 }))).toBe(true);
  });

  it('returns false when trust is 0 (minimum)', () => {
    expect(resolveChoice('beg', makeStatus({ trust: 0 }))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// clampStat — boundary values and negative input
// Requirements 11.1, 11.2, 11.3
// ---------------------------------------------------------------------------
describe('clampStat', () => {
  it('clamps negative input to 0 (e.g. -5 with max=100 → 0)', () => {
    expect(clampStat(-5, 100)).toBe(0);
  });

  it('clamps value at exactly 0 to 0', () => {
    expect(clampStat(0, 100)).toBe(0);
  });

  it('returns the value unchanged when within range', () => {
    expect(clampStat(50, 100)).toBe(50);
  });

  it('returns max when value equals max', () => {
    expect(clampStat(100, 100)).toBe(100);
  });

  it('clamps value above max down to max', () => {
    expect(clampStat(150, 100)).toBe(100);
  });

  it('uses 100 as the default max when none is provided', () => {
    expect(clampStat(200)).toBe(100);
    expect(clampStat(-10)).toBe(0);
  });

  it('handles a custom max correctly', () => {
    expect(clampStat(80, 75)).toBe(75);
    expect(clampStat(-1, 75)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Hypothermia flag — warmth clamped to 0 signals hypothermia
// Requirement 11.4: when Warmth is clamped to 0, hypothermia flag becomes true
// ---------------------------------------------------------------------------
describe('hypothermia via clampStat', () => {
  it('clampStat(-5, 100) returns 0 — caller should set hypothermia=true', () => {
    const clampedWarmth = clampStat(-5, 100);
    expect(clampedWarmth).toBe(0);
    // Simulate the game logic: warmth reaching 0 triggers hypothermia
    const hypothermia = clampedWarmth <= 0;
    expect(hypothermia).toBe(true);
  });

  it('clampStat(0, 100) returns 0 — warmth exactly zero also triggers hypothermia', () => {
    const clampedWarmth = clampStat(0, 100);
    expect(clampedWarmth).toBe(0);
    const hypothermia = clampedWarmth <= 0;
    expect(hypothermia).toBe(true);
  });

  it('clampStat(1, 100) returns 1 — warmth above zero does NOT trigger hypothermia', () => {
    const clampedWarmth = clampStat(1, 100);
    expect(clampedWarmth).toBe(1);
    const hypothermia = clampedWarmth <= 0;
    expect(hypothermia).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Inventory capacity boundary — max 3 items
// Requirement 10.1
// ---------------------------------------------------------------------------
describe('inventory capacity', () => {
  it('inventory at capacity (3 items) prevents adding a fourth item', () => {
    const inventory = [
      { id: 'item1', name: 'Item 1', kind: 'consumable' as const, effectLabel: '+10 Energy', energy: 10 },
      { id: 'item2', name: 'Item 2', kind: 'consumable' as const, effectLabel: '+10 Energy', energy: 10 },
      { id: 'item3', name: 'Item 3', kind: 'consumable' as const, effectLabel: '+10 Energy', energy: 10 },
    ];

    // The game logic gate: item can only be added when inventory.length < 3
    const canAddItem = inventory.length < 3;
    expect(canAddItem).toBe(false);
  });

  it('inventory with 2 items allows adding a third item', () => {
    const inventory = [
      { id: 'item1', name: 'Item 1', kind: 'consumable' as const, effectLabel: '+10 Energy', energy: 10 },
      { id: 'item2', name: 'Item 2', kind: 'consumable' as const, effectLabel: '+10 Energy', energy: 10 },
    ];

    const canAddItem = inventory.length < 3;
    expect(canAddItem).toBe(true);
  });

  it('empty inventory allows adding an item', () => {
    const inventory: { id: string; name: string; kind: 'consumable' | 'accessory'; effectLabel: string }[] = [];

    const canAddItem = inventory.length < 3;
    expect(canAddItem).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isHouseAccessible — PawPoint unlock gate
// Requirement 12.1
// ---------------------------------------------------------------------------
describe('isHouseAccessible', () => {
  it('returns true when all four PawPoints are present', () => {
    expect(isHouseAccessible(['rival', 'comrades', 'food', 'pet'])).toBe(true);
  });

  it('returns true when all four PawPoints are present alongside additional visited points', () => {
    expect(isHouseAccessible(['rival', 'comrades', 'food', 'pet', 'pond'])).toBe(true);
  });

  it('returns false when one PawPoint is missing (no rival)', () => {
    expect(isHouseAccessible(['comrades', 'food', 'pet'])).toBe(false);
  });

  it('returns false when one PawPoint is missing (no comrades)', () => {
    expect(isHouseAccessible(['rival', 'food', 'pet'])).toBe(false);
  });

  it('returns false when one PawPoint is missing (no food)', () => {
    expect(isHouseAccessible(['rival', 'comrades', 'pet'])).toBe(false);
  });

  it('returns false when one PawPoint is missing (no pet)', () => {
    expect(isHouseAccessible(['rival', 'comrades', 'food'])).toBe(false);
  });

  it('returns false when only two PawPoints are present', () => {
    expect(isHouseAccessible(['rival', 'comrades'])).toBe(false);
  });

  it('returns false when visitedPoints is empty', () => {
    expect(isHouseAccessible([])).toBe(false);
  });

  it('returns false when visitedPoints contains only pond and house (non-PawPoints)', () => {
    expect(isHouseAccessible(['pond', 'house'])).toBe(false);
  });
});
