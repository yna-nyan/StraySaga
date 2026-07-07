# Requirements Document

## Introduction

StraySaga is a browser-based advocacy-driven RPG built with React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, and Three.js. The player controls a stray cat navigating a dangerous urban environment through five game states (SELECTION → PROLOGUE → EXPLORATION → SCENARIO → ENDING), managing three survival stats (Energy, Warmth, Trust), making branching dialogue choices, and ultimately reaching Ms. Eleanor's house to achieve adoption. The game carries an "adopt don't shop" advocacy message at the conclusion.

This requirements document serves a dual purpose: it is both a complete specification of the system's existing behavior (source of truth is the codebase, not the PDF PRDs) and a roadmap of planned improvements. Requirements prefixed with **[CURRENT]** reflect what is implemented today; requirements prefixed with **[PLANNED]** reflect gap-filling features to be built.

---

## Glossary

- **Game**: The StraySaga browser application served by the Vite dev server on port 3000.
- **GameState**: The discrete phase the Game is currently in. Valid values: `SELECTION`, `PROLOGUE`, `EXPLORATION`, `SCENARIO`, `ENDING`. (Note: `INTRO` is typed but unused.)
- **Player**: The human operating the browser.
- **Cat**: The player-controlled character represented by a `CatStatus` record.
- **Avatar**: One of the four selectable cat archetypes (calico/Luna, tabby/Buster, black/Shadow, tuxedo/Cookie).
- **Archetype**: A gameplay modifier tied to an Avatar. Valid values: `forager`, `cautious`, `rogue`, `innocent`.
- **CatStatus**: The runtime state record containing `name`, `avatarId`, `archetypeId`, `energy`, `warmth`, `trust`, `ap`, `turn`, `hope`, `inventory`, `equippedAccessoryId`, `hypothermia`, `visitedPoints`.
- **Energy**: A stat (0–100) representing the Cat's movement capacity. Reaching 0 triggers the defeated ending.
- **Warmth**: A stat (0–100) representing the Cat's thermal condition. Dropping to 0 sets the hypothermia flag.
- **Trust**: A stat (0–100) representing the Cat's comfort with humans. Required ≥ 40 for the "beg" choice at the rival waypoint.
- **Hope**: A meta-currency integer persisted in `localStorage` key `straySagaHope`. Accumulated across playthroughs and used to boost starting Warmth on the next run.
- **AP (Action Points)**: An internal stamina reserve that recovers partially each turn, used to regulate movement recovery alongside Energy.
- **Hypothermia**: A boolean flag on `CatStatus` set when Warmth reaches 0. Halves AP recovery rate.
- **Inventory**: A list of up to 3 `InventoryItem` records. Items are either `consumable` (used once) or `accessory` (equipped for passive effects).
- **Waypoint**: A named interactive location on the map with a `(x, y)` coordinate (0–100 scale). The six waypoints are: `rival`, `pond`, `comrades`, `food`, `pet`, `house`.
- **Scenario**: A visual novel dialogue sequence triggered when the Cat visits a Waypoint. Each Scenario consists of sequential `ScenarioLine` records and an optional `choices` array.
- **ScenarioLine**: A single line of dialogue with a `speaker`, `text`, `type` (`speech` | `thought` | `narration` | `scene` | `audio`), and optional `action` for audio triggers.
- **Choice**: A branching action at the rival Scenario with three options: `fight`, `sneak`, `beg`. Each has a stat-gated success condition and distinct success/failure text.
- **Hazard**: A moving patrol entity (rival cat or barking dog) that follows a predefined route. Collision with the Cat applies an `energy` and `warmth` penalty.
- **HUD**: The heads-up display overlay on the map showing Energy, Warmth, Trust bars and current coordinates.
- **TravelCost**: The Energy and Warmth drain applied when the Cat moves between positions, computed from Euclidean distance and terrain type.
- **PawPoint**: One of the four required visited locations (rival, comrades, food, pet) that must be completed before the house Waypoint unlocks.
- **Ending**: The final screen shown after the Cat reaches Ms. Eleanor's house (adopted) or Energy reaches 0 (defeated).
- **AudioManager**: The `audio` singleton in `src/utils/audio.ts` that synthesizes all sound effects via the Web Audio API.

---

## Requirements

### Requirement 1 — Game State Machine

**User Story:** As a developer, I want the game to progress through well-defined states, so that each phase renders exactly the correct UI and transitions deterministically.

#### Acceptance Criteria

1. THE Game SHALL initialize to the `SELECTION` GameState on first load.
2. WHEN the Player selects an Avatar and submits a name, THE Game SHALL transition to the `PROLOGUE` GameState and pass the chosen `name` and `avatarId` to `CatStatus`.
3. WHEN the Player completes the Prologue sequence, THE Game SHALL transition to the `EXPLORATION` GameState.
4. WHEN the Player initiates travel to a Waypoint and the Cat arrives, THE Game SHALL transition to the `SCENARIO` GameState and render the matching Scenario overlay on top of the map.
5. WHEN a Scenario completes and the active Waypoint is not `house`, THE Game SHALL transition back to the `EXPLORATION` GameState.
6. WHEN a Scenario completes and the active Waypoint is `house`, THE Game SHALL transition to the `ENDING` GameState with `endingMode` set to `adopted`.
7. WHEN Energy reaches 0 during travel or a hazard collision, THE Game SHALL transition to the `ENDING` GameState with `endingMode` set to `defeated`.
8. WHEN the Player presses the restart button on the Ending screen, THE Game SHALL reset all CatStatus fields and hazard positions and transition to the `SELECTION` GameState.
9. [PLANNED] WHEN the Game is at the `SELECTION` GameState, THE Game SHALL NOT render the `INTRO` GameState, as the `INTRO` state is reserved for a future onboarding sequence and SHALL remain unused until that feature is implemented.

---

### Requirement 2 — Avatar Selection

**User Story:** As a Player, I want to choose a cat avatar with a custom name and see each avatar's stats before starting, so that my choice meaningfully affects gameplay.

#### Acceptance Criteria

1. THE AvatarSelection screen SHALL display all four Avatars (calico, tabby, black, tuxedo) in a 2×2 grid.
2. WHEN the Player selects an Avatar, THE AvatarSelection screen SHALL update the name input field to the Avatar's default name and highlight the selected card.
3. THE AvatarSelection screen SHALL display the selected Avatar's `archetype`, `trait`, and `startingStats` (Energy, Warmth, Trust) in a detail panel.
4. THE name input SHALL accept a maximum of 12 characters and default to the selected Avatar's default name when the field is blank.
5. WHEN the Player presses "Begin The Journey", THE AvatarSelection screen SHALL call the `onSelect` callback with the trimmed name (or default name if blank) and selected `avatarId`.
6. WHEN Hope is greater than 0 at the start of a new run, THE Game SHALL add a Warmth bonus of `floor(hope / 20) * 5` points, clamped to a maximum of 20 additional Warmth, to the Avatar's base starting Warmth.
7. THE AvatarSelection screen SHALL display an audio consent modal on first render; the modal SHALL offer "Enable Audio" and "Keep Muted" options.
8. WHEN the Player selects an Avatar card, THE AvatarSelection screen SHALL play a meow sound effect via the AudioManager.

---

### Requirement 3 — Prologue

**User Story:** As a Player, I want a narrative introduction that sets the scene before exploration begins, so that I understand the Cat's situation and motivation.

#### Acceptance Criteria

1. THE Prologue screen SHALL display a two-step narrative sequence: a scene-setting paragraph followed by the Cat's inner monologue.
2. WHEN the Player clicks "Read Monologue", THE Prologue screen SHALL advance from step 0 to step 1 and play a meow sound effect.
3. WHEN the Player clicks "Face the Street" on step 1, THE Prologue screen SHALL trigger a full-screen flash transition and call `onComplete` after 1800 ms.
4. WHILE the Prologue screen is active, THE AudioManager SHALL play looping traffic ambience and periodic car horn sound effects at random intervals of approximately 4000 ms.
5. THE Prologue screen SHALL support keyboard navigation: pressing `Enter` SHALL advance the step or trigger completion.

---

### Requirement 4 — 3D Exploration Map

**User Story:** As a Player, I want to navigate a 3D top-down map with my cat avatar, so that exploration feels spatial and engaging.

#### Acceptance Criteria

1. THE GameMap SHALL initialize a Three.js `WebGLRenderer` bound to a full-screen canvas with a perspective camera at a default height of 50 units.
2. THE GameMap SHALL render a 100×100 unit ground plane textured with the procedural map canvas (fallback) or `/map/wholemap.png` / `/map/basemap.png` if available.
3. THE GameMap SHALL render each of the six Waypoints as a 3D group containing a rotating flat ring and a floating token card.
4. THE GameMap SHALL render two Hazards (rival cat, barking dog) as HTML overlay markers projected to 3D screen-space coordinates and updated each animation frame.
5. WHEN the Player presses the arrow keys or W/A/S/D, THE Cat SHALL move at a base speed of 0.45 units per frame, reduced to 0.225 units per frame when Energy is below 30.
6. WHILE the Cat is moving, THE GameMap SHALL generate footprint decal meshes at intervals of 2.4 units traveled, alternating left and right paw offsets, and fade each footprint over 160 frames.
7. WHEN the Cat's position comes within 6 units of a Waypoint, THE GameMap SHALL display a proximity banner prompting the Player to press `SPACE` or `ENTER` to interact.
8. WHEN the Player clicks a Waypoint marker or presses `SPACE`/`ENTER` near a Waypoint, THE GameMap SHALL begin auto-travel toward that Waypoint and trigger the `onTravelCost` callback upon arrival.
9. WHEN the Cat's position comes within 5.2 units of a Hazard's current position, THE GameMap SHALL trigger `onHazardCollision` once per unique hazard-route-position combination and display an error banner for 4200 ms.
10. THE GameMap SHALL support zoom controls: the "+" button decreases camera height by 5 units (minimum 20) and the "−" button increases camera height by 5 units (maximum 85).
11. THE GameMap SHALL project all Waypoint markers, Hazard markers, and the Cat avatar overlay to accurate 2D screen coordinates each animation frame.
12. WHEN the `house` Waypoint is clicked and not all four PawPoints have been visited, THE GameMap SHALL display an error message and play a hiss sound effect.
13. IF the `containerRef` or `canvasRef` is unavailable on mount, THEN THE GameMap SHALL skip Three.js initialization without throwing an error.
14. WHEN the component unmounts, THE GameMap SHALL cancel the animation frame, remove all event listeners, and dispose all Three.js geometries, materials, and textures.

---

### Requirement 5 — Travel Cost System

**User Story:** As a Player, I want travel between locations to drain my cat's stats proportionally to distance, so that route planning matters.

#### Acceptance Criteria

1. WHEN the Cat completes auto-travel to a Waypoint, THE Game SHALL compute travel turns as `max(1, ceil(distance / 18))` where distance is the Euclidean distance traveled.
2. THE Game SHALL compute Energy cost as `baseCost * turns`, where `baseCost` is 8 for terrain type `complex` (rival and pond Waypoints) and 5 for terrain type `clear`.
3. THE Game SHALL compute Warmth drain as `4 * turns` per travel segment.
4. WHEN the Cat moves manually (keyboard), THE Game SHALL accumulate manual travel distance and call `onTravelCost` once every 18 accumulated units.
5. WHEN Energy after applying travel cost would fall to 0 or below, THE Game SHALL award Hope equal to `max(1, floor(trust / 5) + visitedPoints.length * 2)`, persist the updated Hope total to `localStorage`, set `endingMode` to `defeated`, and transition to the `ENDING` GameState.
6. WHEN Warmth after applying travel cost would fall to 0 or below, THE Game SHALL set the `hypothermia` flag on `CatStatus` to `true`.
7. WHILE `hypothermia` is `true`, THE Game SHALL apply a 0.5 recovery multiplier to AP regeneration.

---

### Requirement 6 — Hazard Patrol System

**User Story:** As a Player, I want roaming hazards to create dynamic danger on the map, so that navigation requires attention beyond just stat management.

#### Acceptance Criteria

1. THE Game SHALL initialize two Hazards on EXPLORATION start: `rival-cat` (orange, patrol route: rival → comrades → pond → food) and `barking-dog` (purple, patrol route: pet → food → pond → comrades).
2. WHEN `catStatus.turn` advances by 2 full turns, THE Game SHALL advance each Hazard by one step along its patrol route.
3. WHILE a Hazard's next route position is `house` or matches the active `scenarioId`, THE Game SHALL skip that position and advance to the next valid route index.
4. IF all positions in a Hazard's route are blocked, THEN THE Hazard SHALL remain at its current position.
5. WHEN the Cat comes within 5.2 units of a Hazard, THE Game SHALL apply the Hazard's `penalty` (rival-cat: −5 Energy / −8 Warmth; barking-dog: −5 Energy / −10 Warmth) to `CatStatus`.
6. IF the Energy penalty would bring Energy to 0 or below, THEN THE Game SHALL award Hope, persist it to `localStorage`, and transition to the `ENDING` GameState with mode `defeated`.

---

### Requirement 7 — Visual Novel Scenario System

**User Story:** As a Player, I want immersive dialogue scenes at each Waypoint that reveal the cat's world and affect my stats, so that the narrative feels alive and consequential.

#### Acceptance Criteria

1. WHEN the `SCENARIO` GameState is active, THE ScenarioDialog SHALL render a full-screen overlay on top of the frozen map background.
2. THE ScenarioDialog SHALL display one `ScenarioLine` at a time and reveal its text character-by-character at a rate of one character per 30 ms.
3. WHEN the Player clicks the overlay or presses `Enter` while text is still revealing, THE ScenarioDialog SHALL immediately display the complete line text.
4. WHEN the Player presses `Enter` or clicks "Next" after the full line is displayed and more lines remain, THE ScenarioDialog SHALL advance to the next `ScenarioLine`.
5. WHEN a `ScenarioLine` with `type` set to `audio` is displayed, THE ScenarioDialog SHALL trigger the corresponding `AudioManager` method mapped to the line's `action` field.
6. WHEN the final line of a non-rival Scenario is displayed, THE ScenarioDialog SHALL show the "Resume Journey" button and the stat impact preview.
7. WHEN the Player presses "Resume Journey", THE ScenarioDialog SHALL call `onComplete` with the hardcoded stat delta for that scenario (rival: −25 Energy / −15 Warmth; pond: +20 Energy; comrades: −10 Energy / +40 Warmth / +20 Trust; food: +40 Energy; pet: +20 Warmth / +60 Trust; house: +100 Energy / +100 Warmth / +100 Trust).
8. THE ScenarioDialog SHALL render a speaker portrait for each recognized speaker (the Cat, Narrator, Ginger Rival, Black Kitten, Kind Human, Ms. Eleanor); unrecognized speakers SHALL render no portrait.

---

### Requirement 8 — Branching Choice System (Rival Waypoint)

**User Story:** As a Player, I want branching choices at the rival encounter that test my stats, so that my avatar selection and prior decisions have tangible outcomes.

#### Acceptance Criteria

1. WHEN the rival Scenario's final line is reached, THE ScenarioDialog SHALL display three choice buttons: FIGHT, SNEAK, and BEG, each with its requirement label.
2. WHEN the Player selects FIGHT, THE Game SHALL evaluate success as `energy > 60`; on success THE Game SHALL display the fight success text and play a purr sound; on failure THE Game SHALL display the fight failure text and play a hiss sound.
3. WHEN the Player selects SNEAK, THE Game SHALL evaluate success as `archetypeId === 'rogue'` OR `energy > 45`; on success THE Game SHALL display the sneak success text; on failure THE Game SHALL display the sneak failure text.
4. WHEN the Player selects BEG, THE Game SHALL evaluate success as `trust > 40`; on success THE Game SHALL display the beg success text; on failure THE Game SHALL display the beg failure text.
5. WHEN a choice result is displayed, THE ScenarioDialog SHALL replace the choice buttons with the result text panel.
6. AFTER a choice result is displayed, THE ScenarioDialog SHALL allow the Player to press "Resume Journey" to complete the Scenario with the standard rival stat deltas.
7. [PLANNED] WHEN the Player visits any non-rival Waypoint that currently has no branching choices (pond, comrades, food, pet), THE Game SHALL present at least one branching choice with a stat-gated success condition and distinct outcome text.

---

### Requirement 9 — Archetype Passive Effects

**User Story:** As a Player, I want my chosen avatar's archetype to modify gameplay outcomes passively, so that different avatars feel meaningfully distinct throughout the run.

#### Acceptance Criteria

1. WHEN the `food` Scenario completes and the Cat's `archetypeId` is `forager` and Inventory size is less than 3, THE Game SHALL add one "Dry Cardboard Sheet" consumable (+30 Warmth) to Inventory in addition to the standard fish item.
2. WHEN the `comrades` or `pet` Scenario completes with a positive Trust delta and the Cat's `archetypeId` is `innocent`, THE Game SHALL double the Trust gain.
3. WHEN the `rival` Scenario completes with a negative Warmth delta and the Cat's `archetypeId` is `cautious`, THE Game SHALL reduce the Warmth penalty to `ceil(originalPenalty / 2)`.
4. WHEN the Cat's `archetypeId` is `rogue` and the SNEAK choice is selected at the rival Waypoint, THE sneak check SHALL automatically succeed regardless of current Energy.

---

### Requirement 10 — Inventory and Item System

**User Story:** As a Player, I want to collect and use items found during exploration, so that I have tactical options to manage dwindling stats.

#### Acceptance Criteria

1. THE Inventory SHALL hold a maximum of 3 items simultaneously.
2. WHEN the `food` Scenario completes and Inventory size is less than 3, THE Game SHALL add one "Discarded Fish Skeleton" consumable (+75 Energy) to Inventory.
3. WHEN the `pet` Scenario completes and Inventory does not already contain the "Lost Red Collar" accessory, THE Game SHALL add one "Lost Red Collar" accessory (Trust multiplier: 1.10) to Inventory.
4. WHEN the Player uses a `consumable` item, THE Game SHALL apply the item's `energy` and `warmth` deltas to `CatStatus`, remove the item from Inventory, and clear the `hypothermia` flag if the item has a positive Warmth value.
5. WHEN the Player equips an `accessory` item, THE Game SHALL set `equippedAccessoryId` to that item's `id`; re-equipping the same item SHALL toggle it off.
6. WHILE the "Lost Red Collar" is equipped, THE Game SHALL multiply all positive Trust gains by 1.10, rounded up to the nearest integer.
7. IF a consumable item would raise Energy above `maxEnergy` or any stat above 100, THEN THE Game SHALL clamp the resulting stat to the applicable maximum.

---

### Requirement 11 — Stat Clamping and Hypothermia

**User Story:** As a developer, I want all stat modifications to be bounded safely, so that no stat ever goes out of range and game-ending conditions trigger predictably.

#### Acceptance Criteria

1. THE Game SHALL clamp Energy to the range [0, `maxEnergy`] after every modification.
2. THE Game SHALL clamp Warmth to the range [0, 100] after every modification.
3. THE Game SHALL clamp Trust to the range [0, 100] after every modification.
4. WHEN Warmth is clamped to 0, THE Game SHALL set the `hypothermia` flag to `true`.
5. WHEN a consumable with a positive Warmth value is used, THE Game SHALL set the `hypothermia` flag to `false` regardless of the resulting Warmth value.

---

### Requirement 12 — PawPoint Unlock Gate

**User Story:** As a Player, I want the final cottage to be gated behind completing all four story waypoints, so that the narrative arc is experienced in full before the ending.

#### Acceptance Criteria

1. THE Game SHALL require the four PawPoints (rival, comrades, food, pet) to all appear in `visitedPoints` before the `house` Waypoint is accessible.
2. WHEN the `house` Waypoint is activated while any PawPoint is unvisited, THE GameMap SHALL display a descriptive error message and play a hiss sound effect without triggering travel.
3. WHEN all four PawPoints are visited, THE quests panel SHALL update to show the cottage as "UNLOCKED".
4. THE pond and house Waypoints SHALL NOT be added to `visitedPoints`, as they are not PawPoints tracked by the quests checklist.

---

### Requirement 13 — Hope Meta-Progression

**User Story:** As a Player, I want failures to accumulate lasting progress that benefits future runs, so that the game feels fair even after defeat.

#### Acceptance Criteria

1. WHEN the `ENDING` GameState is entered with mode `defeated`, THE Game SHALL compute earned Hope as `max(1, floor(trust / 5) + visitedPoints.length * 2)` and add it to the stored Hope total.
2. THE Game SHALL persist the updated Hope total to `localStorage` under the key `straySagaHope` immediately upon entering the defeated ending.
3. WHEN the `SELECTION` GameState initializes, THE Game SHALL read the Hope total from `localStorage` and display it in the game header if it is greater than 0.
4. WHEN a new run begins, THE Game SHALL compute a starting Warmth bonus of `min(20, floor(hope / 20) * 5)` and add it to the selected Avatar's base starting Warmth.

---

### Requirement 14 — Ending Screen

**User Story:** As a Player, I want a distinct and meaningful ending screen that reinforces the adoption advocacy message, so that I leave the game with the campaign's message.

#### Acceptance Criteria

1. THE Ending screen SHALL display different content for the `adopted` and `defeated` ending modes.
2. WHEN `endingMode` is `adopted`, THE Ending screen SHALL render the Cat sleeping in Ms. Eleanor's living room with a food bowl engraved with the Cat's name.
3. WHILE the Ending screen is active, THE AudioManager SHALL play looping fireplace crackle and purr sound effects.
4. THE Ending screen SHALL display the "Stop Buying, Start Adopting" advocacy panel with at least three advocacy fact items.
5. WHEN the Player clicks "Adopt Another Kitten", THE Game SHALL call the `onRestart` callback.
6. WHEN the Player clicks "Adoption Guide Tips", THE Ending screen SHALL display a modal with at least four adoption tip items.

---

### Requirement 15 — Audio System

**User Story:** As a Player, I want synthesized sound effects and ambient music that respond to game events, so that the atmosphere is immersive without requiring external audio files.

#### Acceptance Criteria

1. THE AudioManager SHALL synthesize all sound effects using the Web Audio API and SHALL NOT depend on any external audio asset files, with the sole exception of the button-click MP3 used in AvatarSelection.
2. WHEN the Player grants audio consent on the AvatarSelection screen, THE AudioManager SHALL resume its AudioContext and play a confirmation meow.
3. WHEN the AudioManager's `setAmbientZone` method is called with a new zone value, THE AudioManager SHALL crossfade between ambient layers (alley, sanctuary, cottage) over 1.4 seconds.
4. WHEN the Player toggles mute, THE AudioManager SHALL suspend or resume the AudioContext accordingly and update the mute state persistently within the session.
5. THE AudioManager SHALL provide the following named sound effects: `playMeow`, `playPurr`, `playHiss`, `playWaterLap`, `playCarHorn`, `playFireplace`, `playDoorCreak`, `playTrafficAmbience`.

---

### Requirement 16 — [PLANNED] AI-Generated Dialogue

**User Story:** As a Player, I want dynamically generated dialogue lines from the Google Generative AI integration, so that each playthrough feels fresh and responsive to my cat's name and archetype.

#### Acceptance Criteria

1. [PLANNED] WHEN a Scenario is triggered, THE Game SHALL request a contextual dialogue line from the Google Generative AI API using the Cat's name, archetype, current Energy, Warmth, and Trust as prompt context.
2. [PLANNED] IF the AI API call fails or exceeds a 3-second timeout, THEN THE Game SHALL fall back to the static `storyData.ts` dialogue without visible error to the Player.
3. [PLANNED] THE Game SHALL use the `@google/genai` package already listed in `package.json` for all AI requests.
4. [PLANNED] WHERE AI dialogue is enabled, THE ScenarioDialog SHALL insert the AI-generated line as an additional `ScenarioLine` of type `thought` before the final static line of each scenario.

---

### Requirement 17 — [PLANNED] Test Framework

**User Story:** As a developer, I want a test suite that covers core game logic, so that refactoring or new features can be validated without manual regression.

#### Acceptance Criteria

1. [PLANNED] THE project SHALL include a test framework configuration (Vitest recommended) with at least one test file per core logic module.
2. [PLANNED] THE test suite SHALL cover the travel cost computation function: given known distance and terrain inputs, THE function SHALL return the expected Energy and Warmth deltas.
3. [PLANNED] THE test suite SHALL cover stat clamping: given any numeric input, THE clamping function SHALL return a value within [0, maximum].
4. [PLANNED] THE test suite SHALL cover the Hope bonus calculation: given known Hope values, THE starting Warmth bonus SHALL match the expected formula output.
5. [PLANNED] THE test suite SHALL cover each Choice resolution: given known stat values and avatar archetypes, each of the three rival choices SHALL return the expected success/failure boolean.

---

### Requirement 18 — [PLANNED] Expanded Ending Differentiation

**User Story:** As a Player, I want the ending screen to reflect my specific run's stats and journey, so that reaching the goal feels personal rather than generic.

#### Acceptance Criteria

1. [PLANNED] WHEN `endingMode` is `defeated`, THE Ending screen SHALL display the Cat's final Energy, Warmth, Trust, and turn count alongside the earned Hope amount.
2. [PLANNED] WHEN `endingMode` is `adopted`, THE Ending screen SHALL display a summary of which PawPoints the Cat visited and the final trust level attained.
3. [PLANNED] WHERE the Cat's final Trust is greater than 80 in the `adopted` ending, THE Ending screen SHALL display an additional "Strong Bond" narrative line unique to high-trust runs.
4. [PLANNED] WHERE the Cat's `hypothermia` flag is `true` at the end of an `adopted` run, THE Ending screen SHALL display an additional "Survived the Cold" badge.

---

### Requirement 19 — Responsive Rendering and Accessibility

**User Story:** As a Player using any screen size, I want the game to render correctly and be navigable without a mouse, so that the experience is accessible to a broad audience.

#### Acceptance Criteria

1. THE Game SHALL handle browser window resize events and update the Three.js renderer size and camera aspect ratio accordingly.
2. THE GameMap SHALL prevent default browser scroll behavior for arrow key and WASD inputs to avoid page scrolling during gameplay.
3. THE AvatarSelection screen SHALL expose a labeled text input (`id="cat-name-input"`) for screen readers.
4. THE "Begin The Journey" button SHALL include a visually hidden `sr-only` label for screen reader accessibility.
5. WHEN any interactive button or waypoint marker receives keyboard focus, THE Game SHALL not disable or override the native focus ring unless a custom focus style is applied.
6. THE Game SHALL render correctly at viewport widths down to 375 px (mobile portrait).

---

### Requirement 20 — Build and Development Environment

**User Story:** As a developer, I want a reliable build and lint pipeline, so that code quality issues surface before shipping.

#### Acceptance Criteria

1. THE project SHALL use Vite 6 as the build tool with the `@vitejs/plugin-react` plugin.
2. WHEN `npm run lint` is executed, THE TypeScript compiler SHALL check all files with `tsc --noEmit` and exit with code 0 if no type errors exist.
3. WHEN `npm run build` is executed, THE Vite bundler SHALL produce a `dist/` directory containing production-ready assets.
4. THE project SHALL use Tailwind CSS 4 via the `@tailwindcss/vite` plugin for utility-class styling.
5. [PLANNED] WHEN `npm test` is executed, THE test runner SHALL execute all unit tests and exit with code 0 if all tests pass.
