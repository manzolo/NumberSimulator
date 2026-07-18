# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

EDU-NUM · Number Playground — an interactive lab that teaches how computers represent numbers (base conversion, binary add/subtract, two's complement, shifts/masks, fixed-point, IEEE-754, ASCII/UTF-8). The user writes one small command; a hand-written engine executes it as a stream of micro-ops and the UI animates every bit. Part of the EDU-* family of sibling labs (EDU-16, EDU-NET, EDU-SQL, EDU-CRYPTO, …), whose conventions this repo deliberately mirrors.

**Zero build, zero dependencies, pure static site, ES modules.** There is no bundler, transpiler, or package to install.

## Commands

```
npm run serve        # python3 -m http.server 8000  (ES modules need a server; file:// won't work)
npm test             # node --test tests/*.test.js — bits, engine, DSL, all 14 levels
npm run e2e          # headless-Chrome smoke test (tools/e2e.mjs); needs Chrome/Chromium on PATH or CHROME_BIN
```

Run a single test file / test by name:

```
node --test tests/engine.test.js
node --test --test-name-pattern="two's complement" tests/bits.test.js
```

Deploys to GitHub Pages from `main`/root as-is (`.nojekyll`, all paths relative).

## Architecture

The hard rule, inherited from the sibling labs: **`js/core/` is DOM-free, dependency-free, and deterministic** (same command + same inputs ⇒ same trace, no `Math.random`, no `Date`). This is what makes the engine testable headless and lets the exact same code both animate the steps and grade the answer.

### The pipeline (source → animation + verdict)

1. **`core/parser.js`** — parses the single-command DSL into a `{op, key, base?, operands, flags, width?}` object. One program = one line (`#` comments allowed). `OPS` is the grammar table; `CAPS` the numeric limits. Errors are language-neutral `{code, args}` objects, localized later.
2. **`core/engine.js`** — the facade shared by UI and tests. `buildRun()` does parse → `allowed[]` whitelist check → build executor → wrap in `NumSim`. `runHeadless()` runs it to completion with no animation. **The `allowed[]` filter is enforced here** (not display-only), so app and tests reject a forbidden command identically — one of the anti-cheat levers.
3. **`core/executor.js`** — `NumExecutor` runs one parsed command as a generator: each `tick(emit)` resumes `_run()` once and emits language-neutral events (`input`, `note`, `bit`, `carry`, `field`, `digit`, `done`). One `_op_<name>` generator method per DSL op. The terminal `done` event carries the canonical `result.answer` that the verifier compares.
4. **`core/bits.js`** — pure conversion helpers (value⇄bits, base formatting, two's complement, IEEE-754 via `DataView`, UTF-8 via encode). Integers go through `BigInt` internally so widths up to 64 bits stay exact. Tests pin these against JS built-ins (`BigInt.toString`, `DataView`, `TextEncoder`).
5. **`core/sim.js`** — `NumSim`, the stepper. `stepOnce()` = one micro-op; `advanceTo(t)`, `finalState()`, `halted`/`error` flags. Folds in the clock (monotonic seq, append-only `trace`, `emit()` fan-out). **Budget exhaustion is a normal outcome** (`result.outcome === 'budget'`), not `sim.error` — a pathological width surfaces as the tick counter crossing the budget line.

### UI layer

- **`js/main.js`** — the orchestrator. Wires the engine to the DOM through the Player's event stream: build → run → verify against every case. Owns machine state (`currentId`, `level`, `sim`, `selectedCase`, `machineStale`), navigation (`select`, hash routing), toolbar/shortcuts (Ctrl+Enter run, F8 step), the beginner primer and help overlays.
- **`js/player.js`** — playback controller (never touches the DOM). Time is an integer tick counter; `SPEEDS` maps a slider index to ticks-per-wall-ms, with a `'turbo'` mode that spins in chunks via rAF. Honors `prefers-reduced-motion`.
- **`js/ui/*.js`** — one factory per panel (`bitGrid`, `resultPanel`, `eventlog`, `casesPanel`, `levelPanel`, `levelSelect`, `editor`). They subscribe to the event stream; `bitGrid.onEvent(evt)` is where bits/carries/fields animate.
- **`js/storage.js`** — persistence under the `numsim.` namespace; degrades to in-memory `Map` on failure (private mode / quota).
- **`js/i18n.js` + `js/strings/{en,it,intro}.js`** — `t(key, ...args)` for chrome strings (flat per-language dicts), `tr({en, it})` for inline level content. Language priority: `?lang=` URL param > localStorage > browser language > English; the URL is kept in sync as a shareable link.

### Levels (the curriculum)

- **`js/levels/level01.js` … `level14.js`** — one file per level, listed in teaching order by **`js/levels/index.js`**. Each exports a default level object (`id`, bilingual `title`/`text`/`goal`/`hints`, `allowed[]`, `start` starter script, `makeCases()`) and a named `solution` (the reference command).
- **`js/levels/generators.js`** — `d(vars, visible?)` builds a dataset; `cases({solution, datasets})` computes each `expected` answer by running the reference `solution` **through the same engine**, so expected values always match engine semantics.
- **`js/levels/verify.js`** — `verifyCase`/`verifyAll` run the user's command through `runHeadless` on every case and compare `result.answer` by deep-equal (`JSON.stringify`).
- **`js/levels/sandbox.js`** — the free-play mode (no cases, no `allowed[]`).

### Anti-cheat model (central design constraint)

Each level runs the user's command over several datasets — some **visible**, some **hidden** and populated with different values. Commands reference inputs by name (`x`, `a`, `b`, `n`, …), so a hardcoded literal answer passes the visible case but fails the hidden ones. `tests/levels.test.js` asserts this contract for every level: reference solution passes ALL cases, the `start` command does NOT already pass, hardcoded answers fail hidden cases, and `makeCases()` is deterministic.

## Conventions when editing

- **Never import the DOM into `js/core/`** and never introduce nondeterminism there — tests and grading depend on both.
- **Adding a DSL op:** add it to `OPS` (and `CAPS` if it has numeric limits) in `parser.js`, add a `_op_<name>` generator in `executor.js` emitting the standard event vocabulary, add any pure math to `bits.js`, and pin it in `tests/bits.test.js` / `tests/engine.test.js` against a JS built-in where possible.
- **Adding a level:** create `levelNN.js` exporting a default object + a `solution`, register it in `levels/index.js` and `tests/solutions.js`. It must satisfy the level contract in `tests/levels.test.js` (bilingual, starter fails, hidden cases defeat hardcoding).
- All user-facing text is bilingual (en/it). Chrome strings go in `strings/en.js` + `strings/it.js`; per-level text stays inline as `{en, it}`. Engine errors/notes are `{code, args}` resolved through `t()` at display time — never bake English into the engine.
