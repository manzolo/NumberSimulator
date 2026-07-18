// EDU-NUM · level 05 — binary addition and the carry.

import { cases, d } from './generators.js';

export const solution = 'add a b --width 8';

export default {
  id: 'binary-add',
  title: { en: 'Binary addition: the carry', it: 'Somma binaria: il riporto' },
  text: {
    en: `<p>Adding in binary is the addition you already know, with only two
digits. Go column by column from the <b>right</b>: 0+0=0, 0+1=1, and 1+1 = 0
<b>carry 1</b> into the next column. Add <code>a</code> and <code>b</code> in
8 bits and watch the carry ripple leftward.</p>`,
    it: `<p>Sommare in binario è la somma che già conosci, con solo due cifre.
Procedi colonna per colonna da <b>destra</b>: 0+0=0, 0+1=1, e 1+1 = 0 con
<b>riporto 1</b> nella colonna successiva. Somma <code>a</code> e <code>b</code>
in 8 bit e guarda il riporto propagarsi verso sinistra.</p>`,
  },
  goal: {
    en: 'Add a and b as 8-bit numbers. Use `add a b --width 8`.',
    it: 'Somma a e b come numeri a 8 bit. Usa `add a b --width 8`.',
  },
  hints: [
    { en: 'The command is `add <a> <b> --width <n>`.', it: 'Il comando è `add <a> <b> --width <n>`.' },
    { en: 'The width sets how many columns there are: here, 8.', it: 'La larghezza fissa quante colonne ci sono: qui, 8.' },
  ],
  allowed: ['add'],
  start: 'add a b --width 4',
  makeCases: () => cases({
    solution,
    datasets: [d({ a: 11, b: 6 }, true), d({ a: 20, b: 13 }, true), d({ a: 5, b: 5 }), d({ a: 100, b: 27 }), d({ a: 63, b: 64 })],
  }),
};
