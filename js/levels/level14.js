// EDU-NUM · level 14 — capstone: the full 64-bit double, and why 0.1 never ends.

import { cases, d } from './generators.js';

export const solution = 'ieee x --bits 64';

export default {
  id: 'double-capstone',
  title: { en: 'Capstone: the full double', it: 'Capstone: il doppio completo' },
  text: {
    en: `<p>Time to put every bit under the microscope. The number type your
computer uses by default is the <b>64-bit double</b> (IEEE-754): 1 sign bit, 11
exponent bits, 52 mantissa bits. Encode <code>x</code> as a 64-bit double and
read all 64 bits.</p>
<p>Try it on <code>0.1</code>. One tenth is a clean number in decimal, but in
binary it is a <b>repeating fraction</b> — like ⅓ is 0.333… in decimal — so it
can never fit exactly in a finite mantissa. That tiny rounding is the real
reason <code>0.1 + 0.2</code> is famously not exactly <code>0.3</code>. The bits
never lie: here you can finally see why.</p>`,
    it: `<p>È ora di mettere ogni bit al microscopio. Il tipo di numero che il tuo
computer usa di default è il <b>doppio a 64 bit</b> (IEEE-754): 1 bit di segno,
11 di esponente, 52 di mantissa. Codifica <code>x</code> come doppio a 64 bit e
leggi tutti i 64 bit.</p>
<p>Provalo su <code>0.1</code>. Un decimo è un numero pulito in decimale, ma in
binario è una <b>frazione periodica</b> — come ⅓ è 0.333… in decimale — quindi
non può stare esattamente in una mantissa finita. Quel minuscolo arrotondamento
è il vero motivo per cui <code>0.1 + 0.2</code> notoriamente non fa esattamente
<code>0.3</code>. I bit non mentono: qui finalmente vedi perché.</p>`,
  },
  goal: {
    en: 'Encode x as a 64-bit IEEE-754 double. Use `ieee x --bits 64`.',
    it: 'Codifica x come doppio IEEE-754 a 64 bit. Usa `ieee x --bits 64`.',
  },
  hints: [
    { en: 'The command is `ieee <value> --bits 64`.', it: 'Il comando è `ieee <valore> --bits 64`.' },
    { en: 'For 0.1 the mantissa ends in a repeating pattern that had to be rounded — that is the whole point.', it: 'Per 0.1 la mantissa finisce in un pattern periodico che ha dovuto essere arrotondato — è tutto qui il punto.' },
  ],
  allowed: ['ieee'],
  start: 'ieee x --bits 32',
  makeCases: () => cases({
    solution,
    datasets: [d({ x: 0.1 }, true), d({ x: 3.14 }, true), d({ x: -0.5 }), d({ x: 1000000.0 }), d({ x: 0.2 })],
  }),
};
