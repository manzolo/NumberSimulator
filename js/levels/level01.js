// EDU-NUM · level 01 — place value: write a number as an 8-bit pattern.

import { cases, d } from './generators.js';

export const solution = 'bits x --width 8';

export default {
  id: 'bit-weights',
  title: { en: 'Bits & bytes: place value', it: 'Bit e byte: il valore posizionale' },
  text: {
    en: `<p>A <b>byte</b> is eight bits. Each position carries a <b>weight</b> —
128, 64, 32, 16, 8, 4, 2, 1 from left to right — and the value is just the sum
of the weights where a bit is 1. Write the given number <code>x</code> as its
full <b>8-bit</b> pattern and watch each weight light up.</p>`,
    it: `<p>Un <b>byte</b> sono otto bit. Ogni posizione ha un <b>peso</b> —
128, 64, 32, 16, 8, 4, 2, 1 da sinistra a destra — e il valore è solo la somma
dei pesi dove c'è un 1. Scrivi il numero dato <code>x</code> nel suo pattern
completo a <b>8 bit</b> e guarda ogni peso accendersi.</p>`,
  },
  goal: {
    en: 'Produce the 8-bit binary pattern of x. Use `bits x --width 8`.',
    it: 'Produci il pattern binario a 8 bit di x. Usa `bits x --width 8`.',
  },
  hints: [
    { en: 'The command is `bits <value> --width <n>`. Here the width is 8.', it: 'Il comando è `bits <valore> --width <n>`. Qui la larghezza è 8.' },
    { en: 'Reference the given input by its name, `x` — do not type a fixed number, or the hidden cases will catch you.', it: 'Riferisci l\'input dato col suo nome, `x` — non scrivere un numero fisso, o i casi nascosti ti smascherano.' },
  ],
  allowed: ['bits'],
  start: 'bits x --width 16',
  makeCases: () => cases({
    solution,
    datasets: [d({ x: 42 }, true), d({ x: 7 }, true), d({ x: 200 }), d({ x: 255 }), d({ x: 130 })],
  }),
};
