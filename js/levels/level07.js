// EDU-NUM · level 07 — binary subtraction.

import { cases, d } from './generators.js';

export const solution = 'sub a b --width 8';

export default {
  id: 'binary-sub',
  title: { en: 'Binary subtraction', it: 'Sottrazione binaria' },
  text: {
    en: `<p>Subtraction is addition's mirror: go column by column from the right,
<b>borrowing</b> from the next column when the top bit is smaller than the
bottom one. Compute <code>a − b</code> in 8 bits. (Keep an eye on the pattern —
in the next level you'll discover the clever trick computers actually use for
this.)</p>`,
    it: `<p>La sottrazione è lo specchio della somma: procedi colonna per colonna
da destra, facendo un <b>prestito</b> dalla colonna successiva quando il bit
sopra è più piccolo di quello sotto. Calcola <code>a − b</code> in 8 bit.
(Tieni d'occhio il pattern — al prossimo livello scoprirai il trucco astuto che
i computer usano davvero per questo.)</p>`,
  },
  goal: {
    en: 'Compute a − b as 8-bit numbers. Use `sub a b --width 8`.',
    it: 'Calcola a − b come numeri a 8 bit. Usa `sub a b --width 8`.',
  },
  hints: [
    { en: 'The command is `sub <a> <b> --width <n>` — order matters: a minus b.', it: 'Il comando è `sub <a> <b> --width <n>` — l\'ordine conta: a meno b.' },
    { en: 'Under the hood the engine adds the two\'s complement of b; the result is the same.', it: 'Sotto il cofano il motore somma il complemento a due di b; il risultato è lo stesso.' },
  ],
  allowed: ['sub'],
  start: 'sub b a --width 8',
  makeCases: () => cases({
    solution,
    datasets: [d({ a: 10, b: 3 }, true), d({ a: 100, b: 40 }, true), d({ a: 50, b: 50 }), d({ a: 200, b: 75 }), d({ a: 129, b: 128 })],
  }),
};
