// EDU-NUM · level 04 — reading a base back: positional expansion.

import { cases, d } from './generators.js';

export const solution = 'from hex d';

export default {
  id: 'read-base',
  title: { en: 'Reading a base back', it: 'Rileggere una base' },
  text: {
    en: `<p>Conversion goes both ways. To read digits in some base back to a
plain decimal value, multiply each digit by its <b>place weight</b> (powers of
the base) and add them up — exactly like decimal, but the base is 16 here. The
digits <code>d</code> are written in <b>hexadecimal</b>: recover their decimal
value.</p>`,
    it: `<p>La conversione va nei due sensi. Per rileggere delle cifre in una
certa base come normale valore decimale, moltiplica ogni cifra per il suo
<b>peso posizionale</b> (potenze della base) e somma — esattamente come in
decimale, ma qui la base è 16. Le cifre <code>d</code> sono scritte in
<b>esadecimale</b>: recupera il loro valore decimale.</p>`,
  },
  goal: {
    en: 'Turn the hex digits d into their decimal value. Use `from hex d`.',
    it: 'Trasforma le cifre esadecimali d nel loro valore decimale. Usa `from hex d`.',
  },
  hints: [
    { en: 'The command is `from <base> <digits>`; here the base is "hex".', it: 'Il comando è `from <base> <cifre>`; qui la base è "hex".' },
    { en: 'Each position is worth 16 times the one to its right: 2A = 2×16 + 10 = 42.', it: 'Ogni posizione vale 16 volte quella a destra: 2A = 2×16 + 10 = 42.' },
  ],
  allowed: ['from'],
  start: 'from bin d',
  makeCases: () => cases({
    solution,
    datasets: [d({ d: '2a' }, true), d({ d: 'ff' }, true), d({ d: '7c' }), d({ d: '100' }), d({ d: 'b0' })],
  }),
};
