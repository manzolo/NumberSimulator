# EDU-NUM · Number Playground

[🇮🇹 Italiano](README.md) · 🇬🇧 English

**▶ Try it online: <https://manzolo.github.io/NumberSimulator/?lang=en>**

An interactive learning path to understand **how computers represent numbers —
every bit, step by step**. You write a small command; a hand-written engine —
no libraries, zero dependencies — runs it and **animates every bit**: cells
light up with their place-value weights, the carry ripples along an addition,
two's complement's flip-and-add-one takes shape, the sign/exponent/mantissa
fields of an IEEE-754 float colour in, a character turns into its UTF-8 bytes.
In the spirit of the collection's cryptography lab, where you watch each byte
transform — here you watch each bit come to life.

It is a sibling of the EDU-* collection, alongside
[EDU-16 ASM Playground](https://github.com/manzolo/AssemblerSimulator),
[EDU-NET](https://github.com/manzolo/NetworkSimulator),
[EDU-REGEX](https://github.com/manzolo/RegexSimulator),
[EDU-SQL](https://github.com/manzolo/SqlSimulator),
[EDU-BRANCH](https://github.com/manzolo/GitBranchingSimulator),
[EDU-CRYPTO](https://github.com/manzolo/CryptoSimulator),
[EDU-NN](https://github.com/manzolo/NeuralSimulator) and
[EDU-ELN](https://github.com/manzolo/ElectronicsSimulator).

## Why a hand-written engine

Owning the engine is the whole point: base conversions, binary addition with
carry, two's complement, IEEE-754 floating point (via `DataView`, exactly what
the hardware stores) and ASCII/UTF-8 encodings all live in `js/core/`, readable
and **pinned in the tests against JavaScript's own built-ins**
(`BigInt.toString`, `DataView`, `TextEncoder`). The engine is deterministic:
same command, same inputs ⇒ same trace. It emits a stream of language-neutral
events (a division, a bit placed, a carry propagated, a field coloured) the UI
subscribes to: one tick = one micro-operation, so you can watch the algorithm
in slow motion or blitz it in turbo.

## Curriculum

**No prerequisites needed**: on the first visit a beginner's primer ("Basics")
opens, explaining from zero — with analogies and a worked numerical example —
what bits, bytes, place value, two's complement, floating point and encodings
are. It stays one click away in the header.

14 guided levels + a free sandbox: place value · decimal→binary (successive
division) · hexadecimal and nibbles · reading a base back · binary addition and
the carry · fixed width and overflow · subtraction · two's complement · signed
arithmetic · shifts and masks · fixed-point fractions · IEEE 754 · character
encoding (ASCII/UTF-8) · capstone: the 64-bit double (why 0.1 never ends).

Every level checks your command against several numbers — some shown, some
**hidden**: the command references the inputs by name (x, a, b…), so an answer
with a hardcoded value passes the visible case but fails the hidden ones
(anti-cheat).

## Getting started

Pure static site, ES modules, **zero build, zero dependencies**. Serve the
folder with any static server (ES modules do not work over `file://`):

```
npm run serve        # python3 -m http.server 8000
# open http://localhost:8000
```

Deploys to GitHub Pages from `main`/root as-is (`.nojekyll`, relative paths).

## Development / tests

```
npm test             # node --test — bits, engine, DSL, all 14 levels
npm run e2e          # headless Chrome smoke test (boots the UI, solves two levels)
```

The core (`js/core/`) is fully DOM-free and deterministic, hence
headless-testable: the same engine animates the steps and grades your answer.

## License

MIT © Andrea Manzi (manzolo)
