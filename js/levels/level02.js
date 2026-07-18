// EDU-NUM · level 02 — decimal → binary by successive division.

import { cases, d } from './generators.js';

export const solution = 'to bin x';

export default {
  id: 'dec-to-bin',
  title: { en: 'Decimal → binary', it: 'Da decimale a binario' },
  text: {
    en: `<p>How do you turn a decimal number into binary? <b>Divide by 2, keep
the remainder, repeat</b> until nothing is left — then read the remainders
<i>bottom to top</i>. Each division peels off one bit. Convert <code>x</code>
to binary and watch the ladder of divisions build the answer.</p>`,
    it: `<p>Come si trasforma un numero decimale in binario? <b>Dividi per 2,
tieni il resto, ripeti</b> finché non resta nulla — poi leggi i resti
<i>dal basso verso l'alto</i>. Ogni divisione stacca un bit. Converti
<code>x</code> in binario e guarda la scala delle divisioni costruire la
risposta.</p>`,
  },
  goal: {
    en: 'Convert x to binary digits. Use `to bin x`.',
    it: 'Converti x in cifre binarie. Usa `to bin x`.',
  },
  hints: [
    { en: 'The command `to <base> <value>` converts to a base. Base "bin" is binary.', it: 'Il comando `to <base> <valore>` converte in una base. La base "bin" è il binario.' },
    { en: 'Watch the remainders: they are the binary digits, read from the last division up to the first.', it: 'Guarda i resti: sono le cifre binarie, lette dall\'ultima divisione fino alla prima.' },
  ],
  allowed: ['to'],
  start: 'to hex x',
  makeCases: () => cases({
    solution,
    datasets: [d({ x: 42 }, true), d({ x: 13 }, true), d({ x: 200 }), d({ x: 255 }), d({ x: 96 })],
  }),
};
