// EDU-NUM · level 06 — fixed width and overflow.

import { cases, d } from './generators.js';

export const solution = 'add a b --width 8';

export default {
  id: 'overflow',
  title: { en: 'Fixed width and overflow', it: 'Larghezza fissa e overflow' },
  text: {
    en: `<p>A register has a <b>fixed</b> number of bits. When a sum needs more
bits than the width allows, the extra carry falls off the left end and the
result <b>wraps around</b> — that is <b>overflow</b>. In 8 bits, 200 + 100 is
not 300: it is 44, because 300 − 256 = 44. Add <code>a</code> and <code>b</code>
in exactly 8 bits and see the top carry drop.</p>`,
    it: `<p>Un registro ha un numero <b>fisso</b> di bit. Quando una somma
richiede più bit di quanti la larghezza ne consenta, il riporto in eccesso cade
oltre il bordo sinistro e il risultato <b>gira</b> — è l'<b>overflow</b>. In 8
bit, 200 + 100 non fa 300: fa 44, perché 300 − 256 = 44. Somma <code>a</code> e
<code>b</code> in esattamente 8 bit e osserva il riporto in cima cadere.</p>`,
  },
  goal: {
    en: 'Add a and b in 8-bit width — the result must wrap. Use `add a b --width 8`.',
    it: 'Somma a e b a larghezza 8 bit — il risultato deve girare. Usa `add a b --width 8`.',
  },
  hints: [
    { en: 'The command is the same as before; the point is keeping the width at 8 while the sum overflows.', it: 'Il comando è lo stesso di prima; il punto è tenere la larghezza a 8 mentre la somma sfora.' },
    { en: 'A wider width (16) would not overflow — and would give the wrong answer for this level.', it: 'Una larghezza maggiore (16) non andrebbe in overflow — e darebbe la risposta sbagliata per questo livello.' },
  ],
  allowed: ['add'],
  start: 'add a b --width 16',
  makeCases: () => cases({
    solution,
    datasets: [d({ a: 200, b: 100 }, true), d({ a: 255, b: 1 }, true), d({ a: 150, b: 150 }), d({ a: 250, b: 200 }), d({ a: 199, b: 88 })],
  }),
};
