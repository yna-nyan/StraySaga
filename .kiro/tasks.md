# Implementation Plan: StraySaga Project Spec

## Overview

This plan addresses two tracks of work: (1) code quality and testability improvements for the existing implementation, and (2) planned new features (AI dialogue, expanded endings). The first track extracts pure logic into a testable module and adds a Vitest + fast-check test suite. The second track wires in the Google Generative AI integration and differentiates the ending screen using final run stats.

---

## Tasks

- [ ] 1. Extract pure game logic to `src/utils/gameLogic.ts`
  - [x] 1.1 Create `src/utils/gameLogic.ts` with all five travel cost formulas and helper functions
    - Implement `computeTurns(distance: number): number`
    - Implement `computeEnergyCost(distance: number, terrain: 'clear' | 'complex'): number`
    - Implement `computeWarmthDrain(distance: number): number`
    - Implement `computeHopeEarned(trust: number, visitedCount: number): number`
    - Implement `computeWarmthBonus(hope: number): number`
    - Implement `clampStat(value: number, max?: number): number`
    - Implement `resolveChoice(choiceId: 'fight' | 'sneak' | 'beg', status: Pick<CatStatus, 'energy' | 'trust' | 'archetypeId'>): boolean`
    - Implement `applyCautiousWarmthPenalty(negativeDelta: number): number`
    - Implement `applyInnocentTrustBonus(positiveDelta: number): number`
    - Implement `isHouseAccessible(visitedPoints: string[]): boolean`
    - Export all functions from the module
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 2.6, 13.4, 13.1, 11.1, 11.2, 11.3, 8.2, 8.3, 8.4, 9.2, 9.3, 12.1_

  - [ ] 1.2 Refactor `App.tsx` to import and use functions from `src/utils/gameLogic.ts`
    - Replace inline travel cost calculations in `handleTravelCost` with `computeTurns`, `computeEnergyCost`, `computeWarmthDrain`
    - Replace inline Hope formula in `handleTravelCost` and `handleHazardCollision` with `computeHopeEarned`
    - Replace inline warmth bonus formula in avatar initialization with `computeWarmthBonus`
    - Replace inline `clampStat` logic with the extracted function
    - Replace archetype modifier logic with `applyCautiousWarmthPenalty` and `applyInnocentTrustBonus`
    - Replace house unlock check with `isHouseAccessible`
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 2.6, 9.2, 9.3, 12.1_

  - [ ] 1.3 Refactor `ScenarioDialog.tsx` to use `resolveChoice` from `src/utils/gameLogic.ts`
    - Replace inline choice resolution logic with `resolveChoice`
    - Ensure stat deltas remain hardcoded in the dialog component as before
    - _Requirements: 8.2, 8.3, 8.4_

- [x] 2. Set up Vitest test framework
  - [x] 2.1 Install Vitest, `@vitest/ui`, and `fast-check` as dev dependencies
    - Add `"vitest": "^1.6.0"`, `"@vitest/ui": "^1.6.0"`, `"fast-check": "^3.20.0"` to `devDependencies` in `package.json`
    - Add `"test": "vitest --run"` and `"test:ui": "vitest --ui"` scripts to `package.json`
    - Add `test` configuration block to `vite.config.ts` with `environment: 'node'`
    - _Requirements: 17.1, 20.5_

- [ ] 3. Write unit tests for game logic

  - [ ] 3.1 Create `src/utils/gameLogic.test.ts` with example-based unit tests
    - Write tests for `resolveChoice` covering all FIGHT boundary values (energy=61 → true, energy=60 → false)
    - Write tests for `resolveChoice` covering all SNEAK boundary values (rogue+energy=10 → true, forager+energy=46 → true, forager+energy=45 → false)
    - Write tests for `resolveChoice` covering BEG boundary values (trust=41 → true, trust=40 → false)
    - Write tests for hypothermia flag: `clampStat(-5, 100)` → 0, verify `warmth <= 0` triggers `hypothermia`
    - Write tests for `clampStat` at max boundary and negative input
    - Write tests for inventory capacity: at-capacity boundary (3 items)
    - Write tests for `isHouseAccessible` with all four PawPoints present vs. subsets
    - _Requirements: 17.2, 17.3, 17.4, 17.5, 8.2, 8.3, 8.4, 12.1, 12.2_

  - [ ] 3.2 Write property test for stat clamping (Property 1)
    - **Property 1: Stat clamping always produces in-range values**
    - **Validates: Requirements 11.1, 11.2, 11.3, 10.7**
    - Use `fc.float({ min: -1000, max: 1000 })` and `fc.float({ min: 0, max: 1000 })` as arbitraries
    - Assert `result >= 0 && result <= max` for all inputs across 1000 runs

  - [ ] 3.3 Write property test for travel cost formulas (Property 2)
    - **Property 2: Travel cost formula correctness**
    - **Validates: Requirements 5.1, 5.2, 5.3, 17.2**
    - Use `fc.float({ min: 0, max: 200 })` and `fc.constantFrom('clear', 'complex')` as arbitraries
    - Assert that `computeTurns`, `computeEnergyCost`, and `computeWarmthDrain` match the canonical formulas across 500 runs

  - [ ] 3.4 Write property test for Hope warmth bonus (Property 3)
    - **Property 3: Hope bonus formula correctness**
    - **Validates: Requirements 2.6, 13.4**
    - Use `fc.integer({ min: 0, max: 10000 })` as arbitrary
    - Assert `bonus >= 0 && bonus <= 20` and exact formula match across 500 runs

  - [ ] 3.5 Write property test for defeat Hope formula (Property 4)
    - **Property 4: Defeat Hope formula correctness**
    - **Validates: Requirements 5.5, 13.1**
    - Use `fc.integer({ min: 0, max: 100 })` and `fc.integer({ min: 0, max: 4 })` as arbitraries
    - Assert `hope >= 1` and exact formula match across 500 runs

  - [ ] 3.6 Write property test for cautious archetype warmth penalty (Property 5)
    - **Property 5: Cautious archetype halves rival warmth penalty**
    - **Validates: Requirements 9.3**
    - Use `fc.integer({ min: -100, max: -1 })` as arbitrary
    - Assert `result === Math.ceil(negativeDelta / 2)` across 500 runs

  - [ ] 3.7 Write property test for innocent archetype trust bonus (Property 6)
    - **Property 6: Innocent archetype doubles positive Trust gains**
    - **Validates: Requirements 9.2**
    - Use `fc.integer({ min: 1, max: 100 })` as arbitrary
    - Assert `result === positiveTrustDelta * 2` across 500 runs

  - [ ] 3.8 Write property test for PawPoint unlock gate (Property 7)
    - **Property 7: PawPoint gate requires all four points**
    - **Validates: Requirements 12.1, 12.2**
    - Use `fc.subarray(['rival', 'comrades', 'food', 'pet'])` as arbitrary
    - Assert `isHouseAccessible(visitedPoints) === allFourPresent` across 100 runs

- [ ] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement AI dialogue integration

  - [x] 5.1 Create `src/utils/aiDialogue.ts` with the `generateContextualLine` function
    - Import `@google/genai` and read `VITE_GEMINI_API_KEY` from `import.meta.env`
    - Implement `generateContextualLine(status: CatStatus, scenarioId: string): Promise<string>` with a 3-second `AbortController` timeout
    - Return `null` on any error (network failure, timeout, quota exceeded, missing API key)
    - Construct a prompt that includes the Cat's name, archetype display label, energy, warmth, and trust
    - Export the function
    - _Requirements: 16.1, 16.2, 16.3_

  - [ ] 5.2 Integrate `generateContextualLine` into `ScenarioDialog.tsx`
    - Call `generateContextualLine` in a `useEffect` on mount, passing `scenarioId` and current `status` prop
    - On success, prepend the returned string as a `ScenarioLine` of type `thought` before the last static line in the scenario's line array
    - On failure or `null` return, continue with the original static lines without any error shown
    - _Requirements: 16.1, 16.2, 16.4_

- [ ] 6. Implement expanded ending differentiation

  - [ ] 6.1 Update `App.tsx` to pass final stats to the `Ending` component
    - Add `finalStats` prop shape: `{ energy: number; warmth: number; trust: number; turn: number; visitedPoints: string[]; earnedHope: number; hypothermia: boolean }` to `Ending.tsx`'s props interface
    - Capture and pass `catStatus` values at the moment of entering the ENDING state
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

  - [ ] 6.2 Update `Ending.tsx` to display differentiated content based on `finalStats`
    - In the `defeated` ending: render final Energy, Warmth, Trust, turn count, and earned Hope beneath the main message
    - In the `adopted` ending: render a summary list of visited PawPoints and final Trust level
    - WHERE `finalStats.trust > 80` in the `adopted` ending: render a "Strong Bond" narrative paragraph
    - WHERE `finalStats.hypothermia === true` in the `adopted` ending: render a "Survived the Cold" badge element
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [ ] 7. Accessibility and responsive improvements

  - [ ] 7.1 Verify and fix keyboard focus styles on interactive elements
    - Audit all interactive buttons, waypoint markers, and form inputs to confirm no native focus ring is suppressed without a custom replacement
    - Add `focus-visible:ring` classes where default ring is removed (e.g., Tailwind `outline-none` without a substitute)
    - _Requirements: 19.5_

  - [ ] 7.2 Verify screen reader labels on `AvatarSelection` inputs and buttons
    - Confirm `id="cat-name-input"` is present and has a matching `<label>` or `aria-label`
    - Confirm "Begin The Journey" button has a `<span className="sr-only">` label
    - _Requirements: 19.3, 19.4_

- [ ] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP — core logic extraction (Task 1) and unit tests (Task 3.1) are not optional and must run first
- The Vitest framework must be set up (Task 2) before any test files can be created (Tasks 3.x)
- `gameLogic.ts` must be complete (Task 1.1) before `gameLogic.test.ts` can import from it (Task 3)
- AI dialogue requires `VITE_GEMINI_API_KEY` to be set in a local `.env` file; the feature degrades silently without it
- Property tests (Tasks 3.2–3.8) use `fast-check` which must be installed as part of Task 2.1
- Each property test task corresponds to one of the seven correctness properties in the design document
- The expanded ending tasks (6.1, 6.2) can be done in a single pass since both files are in scope together

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "5.1"] },
    { "id": 3, "tasks": ["5.2", "6.1", "7.1", "7.2"] },
    { "id": 4, "tasks": ["6.2"] }
  ]
}
```
