// EDU-NUM · level 08 — two's complement: how negatives are stored.

import { cases, d } from './generators.js';

export const solution = 'neg x --width 8';

export default {
  id: 'twos-complement',
  title: { en: "Two's complement", it: 'Il complemento a due' },
  text: {
    en: `<p>How do you store a <b>negative</b> number with only 0s and 1s? The
trick almost every computer uses is <b>two's complement</b>: to get −x, take the
bits of x, <b>flip every bit</b>, then <b>add 1</b>. The beauty is that ordinary
binary addition then just works for negatives too. Produce the 8-bit pattern of
<code>−x</code> and watch the flip-and-add-one.</p>`,
    it: `<p>Come si memorizza un numero <b>negativo</b> con soli 0 e 1? Il trucco
che quasi ogni computer usa è il <b>complemento a due</b>: per ottenere −x,
prendi i bit di x, <b>inverti ogni bit</b>, poi <b>aggiungi 1</b>. La bellezza è
che la normale somma binaria poi funziona anche coi negativi. Produci il pattern
a 8 bit di <code>−x</code> e guarda l'inverti-e-aggiungi-uno.</p>`,
  },
  goal: {
    en: 'Produce the 8-bit two\'s-complement pattern of −x. Use `neg x --width 8`.',
    it: 'Produci il pattern a 8 bit in complemento a due di −x. Usa `neg x --width 8`.',
  },
  hints: [
    { en: 'The command `neg <value> --width <n>` negates in two\'s complement.', it: 'Il comando `neg <valore> --width <n>` nega in complemento a due.' },
    { en: 'The top bit ends up 1 for a negative number — it is the "sign bit".', it: 'Il bit più alto risulta 1 per un numero negativo — è il "bit di segno".' },
  ],
  allowed: ['neg'],
  start: 'neg x --width 4',
  makeCases: () => cases({
    solution,
    datasets: [d({ x: 5 }, true), d({ x: 1 }, true), d({ x: 42 }), d({ x: 100 }), d({ x: 127 })],
  }),
};
