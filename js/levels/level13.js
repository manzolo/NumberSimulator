// EDU-NUM · level 13 — character encoding: ASCII and UTF-8.

import { cases, d } from './generators.js';

export const solution = 'utf8 c';

export default {
  id: 'char-encoding',
  title: { en: 'Encoding characters', it: 'Codificare i caratteri' },
  text: {
    en: `<p>Text is bits too. <b>ASCII</b> maps the basic English letters and
symbols to one byte each (A = 65). But the world has far more than 128
characters, so <b>UTF-8</b> extends it: common characters still take one byte,
while accented and other letters take <b>two or more</b>. Encode the character
<code>c</code> as UTF-8 bytes — try it on an accented letter and watch a single
character become several bytes.</p>`,
    it: `<p>Anche il testo è fatto di bit. L'<b>ASCII</b> associa le lettere e i
simboli inglesi di base a un byte ciascuno (A = 65). Ma nel mondo ci sono ben
più di 128 caratteri, così l'<b>UTF-8</b> lo estende: i caratteri comuni restano
un byte, mentre le lettere accentate e altre ne occupano <b>due o più</b>.
Codifica il carattere <code>c</code> in byte UTF-8 — provalo su una lettera
accentata e guarda un solo carattere diventare più byte.</p>`,
  },
  goal: {
    en: 'Encode the character c as UTF-8 bytes. Use `utf8 c`.',
    it: 'Codifica il carattere c in byte UTF-8. Usa `utf8 c`.',
  },
  hints: [
    { en: 'The command is `utf8 <text>`. `ascii` only works for plain 0–127 characters.', it: 'Il comando è `utf8 <testo>`. `ascii` funziona solo per i caratteri 0–127.' },
    { en: '"A" is one byte (01000001); "è" needs two (C3 A8).', it: '"A" è un byte (01000001); "è" ne richiede due (C3 A8).' },
  ],
  allowed: ['utf8', 'ascii'],
  start: 'ascii c',
  makeCases: () => cases({
    solution,
    datasets: [d({ c: 'A' }, true), d({ c: 'è' }, true), d({ c: '€' }), d({ c: 'ç' }), d({ c: '9' })],
  }),
};
