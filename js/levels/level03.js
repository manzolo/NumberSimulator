// EDU-NUM · level 03 — hexadecimal: four bits at a time.

import { cases, d } from './generators.js';

export const solution = 'to hex x';

export default {
  id: 'hex-nibbles',
  title: { en: 'Hexadecimal: four bits at a time', it: 'Esadecimale: quattro bit per volta' },
  text: {
    en: `<p>Long binary strings are painful to read, so we group the bits into
<b>nibbles</b> of four. Four bits count from 0 to 15, and hexadecimal
(<b>base 16</b>) gives each value a single symbol: 0–9 then A–F. So every hex
digit is exactly one nibble. Convert <code>x</code> to hexadecimal.</p>`,
    it: `<p>Le lunghe stringhe binarie sono scomode da leggere, così
raggruppiamo i bit in <b>nibble</b> da quattro. Quattro bit contano da 0 a 15,
e l'esadecimale (<b>base 16</b>) dà a ogni valore un simbolo solo: 0–9 poi A–F.
Quindi ogni cifra esadecimale è esattamente un nibble. Converti <code>x</code>
in esadecimale.</p>`,
  },
  goal: {
    en: 'Convert x to hexadecimal. Use `to hex x`.',
    it: 'Converti x in esadecimale. Usa `to hex x`.',
  },
  hints: [
    { en: 'Same `to <base> <value>` command as before, with base "hex".', it: 'Stesso comando `to <base> <valore>` di prima, con base "hex".' },
    { en: 'Values 10–15 become A–F: 255 is FF, 42 is 2A.', it: 'I valori 10–15 diventano A–F: 255 è FF, 42 è 2A.' },
  ],
  allowed: ['to'],
  start: 'to bin x',
  makeCases: () => cases({
    solution,
    datasets: [d({ x: 42 }, true), d({ x: 255 }, true), d({ x: 16 }), d({ x: 173 }), d({ x: 4095 })],
  }),
};
