# JAMRUSH: Deadline Panic

A frantic indie game-jam management game about scope, bugs, vibes, and shipping. Build a weird little game with Rae before the clock reaches zero.

## Play locally

```bash
pnpm install
pnpm dev
```

Production build:

```bash
pnpm build
pnpm preview
```

The game is a static Vite/Three.js app with no server or database. It is ready for Vercel: import this repository, keep the default framework as Vite/Other, set the build command to `pnpm build`, and set the output directory to `dist`.

## Controls

- `1–9`: choose a desk action
- `Q`: open bug triage
- `P` or `Escape`: pause
- `R`: restart from results
- Mouse/touch: click cards, drag bugs to the matching lane
- Gamepad: D-pad navigates, A activates, B backs out

All characters, visuals, sounds, and writing are original and created for this game.
