// EDU-NUM · level 12 — IEEE-754 floating point.

import { cases, d } from './generators.js';

export const solution = 'ieee x --bits 32';

export default {
  id: 'ieee32',
  title: { en: 'Floating point (IEEE 754)', it: 'Virgola mobile (IEEE 754)' },
  text: {
    en: `<p>Fixed-point wastes bits when numbers span huge ranges. Real hardware
uses <b>floating point</b>: like scientific notation in binary, a number is a
<b>sign</b>, an <b>exponent</b> (where the point floats to) and a
<b>mantissa</b> (the significant bits). The 32-bit IEEE-754 layout is 1 + 8 + 23
bits. Encode <code>x</code> as a 32-bit float and watch the three fields fill
in.</p>`,
    it: `<p>La virgola fissa spreca bit quando i numeri spaziano su intervalli
enormi. L'hardware vero usa la <b>virgola mobile</b>: come la notazione
scientifica in binario, un numero è un <b>segno</b>, un <b>esponente</b> (dove
galleggia la virgola) e una <b>mantissa</b> (i bit significativi). Il formato
IEEE-754 a 32 bit è 1 + 8 + 23 bit. Codifica <code>x</code> come float a 32 bit
e guarda i tre campi riempirsi.</p>`,
  },
  goal: {
    en: 'Encode x as a 32-bit IEEE-754 float. Use `ieee x --bits 32`.',
    it: 'Codifica x come float IEEE-754 a 32 bit. Usa `ieee x --bits 32`.',
  },
  hints: [
    { en: 'The command is `ieee <value> --bits 32`.', it: 'Il comando è `ieee <valore> --bits 32`.' },
    { en: 'The first bit is the sign, the next 8 the exponent, the last 23 the mantissa.', it: 'Il primo bit è il segno, i successivi 8 l\'esponente, gli ultimi 23 la mantissa.' },
  ],
  allowed: ['ieee'],
  start: 'ieee x --bits 64',
  makeCases: () => cases({
    solution,
    datasets: [d({ x: 1.0 }, true), d({ x: -2.0 }, true), d({ x: 0.5 }), d({ x: 3.14 }), d({ x: -0.15625 })],
  }),
};
