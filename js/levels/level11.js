// EDU-NUM · level 11 — fixed-point fractions.

import { cases, d } from './generators.js';

export const solution = 'fixed x --int 4 --frac 4';

export default {
  id: 'fixed-point',
  title: { en: 'Fixed-point fractions', it: 'Frazioni in virgola fissa' },
  text: {
    en: `<p>Bits after a binary point work just like bits before it, but the
weights keep halving: ½, ¼, ⅛, 1⁄16… So <code>0.101</code> in binary is
½ + ⅛ = 0.625. In <b>fixed-point</b> we simply reserve some bits for the whole
part and some for the fraction. Represent <code>x</code> in <b>Q4.4</b> — four
integer bits, four fraction bits.</p>`,
    it: `<p>I bit dopo una virgola binaria funzionano come quelli prima, ma i
pesi continuano a dimezzarsi: ½, ¼, ⅛, 1⁄16… Così <code>0.101</code> in binario
è ½ + ⅛ = 0.625. In <b>virgola fissa</b> riserviamo semplicemente alcuni bit
per la parte intera e alcuni per la frazione. Rappresenta <code>x</code> in
<b>Q4.4</b> — quattro bit interi, quattro bit frazionari.</p>`,
  },
  goal: {
    en: 'Represent x with 4 integer + 4 fraction bits. Use `fixed x --int 4 --frac 4`.',
    it: 'Rappresenta x con 4 bit interi + 4 frazionari. Usa `fixed x --int 4 --frac 4`.',
  },
  hints: [
    { en: 'The command is `fixed <value> --int <I> --frac <F>`.', it: 'Il comando è `fixed <valore> --int <I> --frac <F>`.' },
    { en: 'With 4 fraction bits the smallest step is 1⁄16 = 0.0625, so 3.25 becomes 0011.0100.', it: 'Con 4 bit frazionari il passo minimo è 1⁄16 = 0.0625, quindi 3.25 diventa 0011.0100.' },
  ],
  allowed: ['fixed'],
  start: 'fixed x --int 8 --frac 8',
  makeCases: () => cases({
    solution,
    datasets: [d({ x: 3.25 }, true), d({ x: 1.5 }, true), d({ x: 0.75 }), d({ x: 6.5 }), d({ x: 10.0625 })],
  }),
};
