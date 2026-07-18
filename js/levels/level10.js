// EDU-NUM · level 10 — shifts and masks.

import { cases, d } from './generators.js';

export const solution = 'shl x n --width 8';

export default {
  id: 'shift-mask',
  title: { en: 'Shifts and masks', it: 'Shift e maschere' },
  text: {
    en: `<p>Sliding every bit one place to the <b>left</b> doubles a number
(a 0 fills in on the right); sliding <b>right</b> halves it. Shifting is how
computers multiply and divide by powers of two almost for free. Combined with
<b>masks</b> (<code>and</code>, <code>or</code>, <code>xor</code>) you can pick
out or flip individual bits. Shift <code>x</code> left by <code>n</code> places
in 8 bits.</p>`,
    it: `<p>Far scorrere ogni bit di una posizione a <b>sinistra</b> raddoppia un
numero (a destra entra uno 0); farlo scorrere a <b>destra</b> lo dimezza. Lo
shift è il modo in cui i computer moltiplicano e dividono per potenze di due
quasi gratis. Combinato con le <b>maschere</b> (<code>and</code>,
<code>or</code>, <code>xor</code>) puoi isolare o invertire singoli bit. Sposta
<code>x</code> a sinistra di <code>n</code> posizioni in 8 bit.</p>`,
  },
  goal: {
    en: 'Shift x left by n bits (that multiplies it by 2ⁿ). Use `shl x n --width 8`.',
    it: 'Sposta x a sinistra di n bit (lo moltiplica per 2ⁿ). Usa `shl x n --width 8`.',
  },
  hints: [
    { en: 'The command is `shl <value> <n> --width <w>`; `shr` shifts the other way.', it: 'Il comando è `shl <valore> <n> --width <w>`; `shr` sposta nell\'altro verso.' },
    { en: 'A left shift by 3 is the same as multiplying by 8 — as long as it fits the width.', it: 'Uno shift a sinistra di 3 equivale a moltiplicare per 8 — se ci sta nella larghezza.' },
  ],
  allowed: ['shl', 'shr', 'and', 'or', 'xor'],
  start: 'shr x n --width 8',
  makeCases: () => cases({
    solution,
    datasets: [d({ x: 1, n: 3 }, true), d({ x: 5, n: 2 }, true), d({ x: 3, n: 1 }), d({ x: 1, n: 7 }), d({ x: 9, n: 4 })],
  }),
};
