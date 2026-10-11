# JAMRUSH: Deadline Panic — Implementation Plan

## Product direction
A short, replayable English-language indie game-jam management strategy game. The player is a solo designer working beside an overworked buddy, racing a real-time deadline while turning a compact brief into a shippable game. The experience is deliberately readable and fast: every click spends a scarce resource, creates a visible consequence, or opens a story beat.

## Implementation approach
- **Runtime:** Three.js/Vite/TypeScript starter retained. Three.js renders a procedural desktop studio backdrop made from original primitive geometry (no licensed IP or external gameplay art). DOM overlays own all dense strategy UI so it remains crisp, accessible, keyboard/gamepad navigable, and responsive on landscape phones.
- **Authoritative simulation:** `src/gamejam.ts` owns run state, phase transitions, action costs, countdown, feature/bug data, rival progress, random events, scoring, restart, and persistence of the local best score. Presentation code reads state and never decides rewards.
- **Input:** Clickable action buttons and feature cards, keyboard shortcuts `1–8`, `P`/`Escape` pause, `R` restart from terminal screens, drag-and-drop bug triage, touch-friendly targets, and a lightweight gamepad polling layer that navigates focused controls and activates with A/Enter.
- **Feedback:** Web Audio API synthesizes short original UI/action tones and a low-intensity generative pulse; CSS particles, stat pulses, phase transitions, buddy reactions, warning strips, and a restrained Three.js camera nudge provide game-jam energy without hiding information.
- **Responsive layout:** Desktop uses a three-column studio dashboard; landscape phone collapses to a two-row layout with horizontally scrollable work cards, compact metrics, and full-screen modals. All controls remain available through touch/click and keyboard.
- **Delivery:** Static SPA build (`pnpm build` → `dist`) with `manus-routes.json`, game-specific favicon/share metadata, no server/database, and Vercel-friendly root configuration.

## Design system
- **Design movement:** Neon risograph studio / playful software zine. The interface should feel taped together by a clever team one hour before submission: paper tabs, ink outlines, CRT glow, sticker-like badges, and high-contrast status colors.
- **Core principles:** (1) Read the deadline first. (2) Every resource has a visible tradeoff. (3) Messy systems should still be legible. (4) Celebrate scrappy progress.
- **Color philosophy:** Ink navy is the calm desk under pressure; acid lime means ship-worthy confidence; coral warns that a choice will hurt; electric cyan marks systems and bugs; warm paper cards make planning feel tactile.
- **Layout paradigm:** An offset studio desk: a narrow phase rail anchors the left, the central workbench holds the brief and actions, and a right-hand signal stack shows buddy/rivals. On phones, the rail becomes a top ticker and the signal stack becomes a bottom drawer.
- **Signature elements:** deadline stamp with scanline ticks; hand-labeled sticky cards; the buddy's speech bubble and “ship it / fix it” reaction badges.
- **Interaction philosophy:** Buttons feel like physical desk controls. Hover/focus raises a card and reveals its consequence. Destructive or risky work uses coral warnings; restorative actions use mint. Bug triage physically drags a card into the lane that can solve it.
- **Animation:** 140–260ms springy micro-interactions; phase transitions use a quick camera bump and paper shuffle; particles are small and purposeful; reduced motion disables camera shake, looping background bob, and large transforms.
- **Typography:** Bundled ManusCC0 display face for chunky headings and labels; bundled ManusCC0 regular/medium for body copy. Uppercase micro-labels are tracked and short; numbers use tabular figures.
- **Brand essence:** “A frantic little postmortem you can win.” Personality: scrappy, warm, kinetic.
- **Brand voice:** Headlines sound like a teammate with a marker in hand. Example lines: “SHIP THE WEIRD THING.” / “One more fix. Probably.”
- **Wordmark/logo:** JAMRUSH is a slanted deadline stamp with a split lightning cursor through the A; the in-game mark is drawn in CSS/HTML rather than a stock logo.
- **Signature brand color:** Acid lime `#c9ff5a`, used only for confirmed progress and the ship button.

## Project structure
- `src/main.ts`: bootstraps the app and binds the canvas/root.
- `src/gamejam.ts`: game state, simulation, UI template, input, event cards, scoring, audio, and procedural Three.js studio backdrop.
- `src/styles/main.css`: responsive visual system and animation/accessibility rules.
- `public/manus-routes.json`: static route declaration.
- `assets/share/`: game-specific favicon and optional share metadata assets.
- Existing starter engine/game modules remain available for reference and template compatibility, but the new loop is isolated in `gamejam.ts`.

## Serving and persistence
The game is a client-only static SPA: no account, server, database, payment, or online leaderboard. Local best score and first-play tutorial dismissal use `localStorage`; a run can always be restarted locally. Vite emits portable relative asset paths for Vercel/static hosting.
