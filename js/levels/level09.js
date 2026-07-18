// EDU-NUM · level 09 — signed arithmetic: subtraction is just addition.

import { cases, d } from './generators.js';

export const solution = 'add a b --width 8';

export default {
  id: 'signed-add',
  title: { en: 'Signed arithmetic', it: 'Aritmetica con segno' },
  text: {
    en: `<p>Here is the payoff of two's complement: once negatives are stored
that way, you <b>add them with the very same rules</b> as positives — no special
case, no separate subtractor. Compute <code>a + b</code> in 8 bits where one of
them may be <b>negative</b>. Read the result as a signed number and check it
against the maths.</p>`,
    it: `<p>Ecco il vantaggio del complemento a due: una volta memorizzati così i
negativi, li <b>sommi con le stesse identiche regole</b> dei positivi — nessun
caso speciale, nessun sottrattore separato. Calcola <code>a + b</code> in 8 bit
dove uno dei due può essere <b>negativo</b>. Leggi il risultato come numero con
segno e confrontalo col conto.</p>`,
  },
  goal: {
    en: 'Add a and b (some are negative) in 8-bit two\'s complement. Use `add a b --width 8`.',
    it: 'Somma a e b (alcuni negativi) in complemento a due a 8 bit. Usa `add a b --width 8`.',
  },
  hints: [
    { en: 'Same `add` command — negatives are written with a minus sign, e.g. -3.', it: 'Stesso comando `add` — i negativi si scrivono col meno, es. -3.' },
    { en: 'The engine stores a negative input as its two\'s complement, then adds normally.', it: 'Il motore memorizza un input negativo come suo complemento a due, poi somma normalmente.' },
  ],
  allowed: ['add'],
  start: 'add a b --width 4',
  makeCases: () => cases({
    solution,
    datasets: [d({ a: 10, b: -3 }, true), d({ a: -5, b: -5 }, true), d({ a: -1, b: 1 }), d({ a: 50, b: -70 }), d({ a: -64, b: 20 })],
  }),
};
