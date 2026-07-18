// Stringhe italiane della chrome. Dizionario piatto; {0}/{1} sono argomenti
// posizionali.

export default {
  tagline: 'guarda ogni bit — come i computer rappresentano i numeri',

  navIntro: 'Basi',
  navLevels: 'Livelli',
  navSandbox: 'Sandbox',
  help: 'Aiuto',
  run: '▶ Esegui',
  pause: '❚❚ Pausa',
  step: 'Passo',
  reset: 'Reset',
  speed: 'velocità',

  panelBitgrid: 'BIT',
  panelResult: 'RISULTATO',
  panelScript: 'COMANDO',
  panelCases: 'CASI',
  panelEvents: 'PASSI',

  statusReady: 'Pronto.',
  statusRunning: 'In esecuzione…',
  statusPaused: 'In pausa.',
  statusParseFailed: 'Il comando non è valido.',
  statusDone: 'Finito in {0} passi.',
  statusBudget: 'Budget di passi esaurito — la run è stata troncata.',
  failStatus: 'Non ancora superato.',

  levelBadge: 'LIVELLO {0}',
  completedBadge: 'completato',
  goalLabel: 'OBIETTIVO —',
  allowedLabel: 'comandi',
  hintBtn: 'Suggerimento {0}/{1}',
  hintsDone: 'Niente più suggerimenti',
  nextLevel: 'Livello successivo →',
  passMsg: 'Superato! Tutti i casi sono verdi — inclusi quelli nascosti.',
  failVisible: 'Il caso visibile fallisce — eseguilo e guarda dove va storto.',
  failHidden: 'Il caso visibile passa, ma un caso NASCOSTO fallisce: hai cablato un valore fisso invece della variabile?',

  sandboxTitle: 'SANDBOX',
  sandboxText: 'Modalità libera: qualunque comando, numeri letterali, tutto animato bit per bit. Qui niente voti.',
  sandboxCardTitle: 'Sandbox',
  sandboxCardDesc: 'sperimentazione libera',
  selectTitle: 'Scegli un livello',

  caseLabel: 'Caso',
  casesNote: '+{0} casi nascosti: stesso comando, numeri diversi. Le risposte cablate non gli sopravvivono.',

  resultEmpty: 'Esegui il comando per vedere il risultato, in tutte le forme insieme.',
  statBits: 'bit',
  statUnsigned: 'senza segno',
  statSigned: 'con segno',
  statHex: 'esa',
  statCarry: 'riporto finale',
  statBase: 'base',
  statDecimal: 'decimale',
  statValue: 'valore',
  statPattern: 'pattern',
  statSign: 'segno',
  statExp: 'esponente',
  statMantissa: 'mantissa',
  statChar: 'carattere',
  statByte: 'byte',
  statBytes: 'byte',

  evtEmpty: 'I passi del motore appariranno qui.',
  evtInput: 'esegui: {0}',
  evtField: 'campo: {0}',
  evtBudget: 'budget di passi ({0}) esaurito',

  // narrazione dei passi
  noteDivide: '{0} ÷ {1} = {2}, resto {3} → {4}',
  notePositional: '{0}: peso {2} (pos {1}) → +{3}, totale {4}',
  noteWeight: 'bit acceso: peso {1} (2^{0})',
  noteAddCol: 'colonna {0}: {1} + {2} + riporto {3} = {4}',
  notePlusOne: 'poi aggiungi 1',
  noteCodePoint: "'{0}' → code point {1} (0x{2})",
  noteUtf8Byte: 'byte {0}/{1}: {2}',

  // aiuto
  helpTitle: 'Riferimento dei comandi',
  helpHtml: `
<p>Un comando per programma. <b>Ctrl+Invio</b> esegue, <b>F8</b> avanza di una
micro-op. In un livello, riferisci gli input dati per nome (x, a, b, d, n, c);
nella sandbox usa numeri letterali (<code>42</code>, <code>0b1010</code>,
<code>0x2a</code>, <code>3.14</code>).</p>
<pre>to   &lt;base&gt; &lt;val&gt; [--width N]     valore → cifre in una base
from &lt;base&gt; &lt;cifre&gt;              cifre in una base → valore
bits &lt;val&gt; [--width N]           pattern senza segno a larghezza fissa
signed &lt;val&gt; [--width N]         complemento a due di un valore con segno
neg  &lt;val&gt; [--width N]           negazione in complemento a due
add|sub|and|or|xor &lt;a&gt; &lt;b&gt; [--width N]
shl|shr &lt;val&gt; &lt;n&gt; [--width N]     shift logico
fixed &lt;val&gt; --int I --frac F     virgola fissa binaria (Q I.F)
ieee &lt;val&gt; [--bits 32|64]        campi del float IEEE-754
ascii &lt;char&gt;                     un code point ASCII → un byte
utf8  &lt;testo&gt;                    una stringa → byte UTF-8</pre>
<p>base = bin | oct | dec | hex, oppure un numero 2–36.</p>`,

  // errori del motore
  errEmpty: 'Scrivi un comando.',
  errOneCommand: 'Un comando alla volta.',
  errUnclosed: 'Virgolette non chiuse.',
  errUnknownOp: 'Comando sconosciuto: "{0}".',
  errBadBase: 'Base sconosciuta: "{0}" (bin, oct, dec, hex, o 2–36).',
  errNeedDigits: 'Questo comando richiede delle cifre.',
  errNeedOperand: '`{0}` richiede un altro valore.',
  errUnexpected: 'Inatteso: {0}.',
  errBadFlag: 'Opzione sconosciuta {0} per `{1}`.',
  errFlagValue: "L'opzione {0} richiede un valore.",
  errFlagInt: "L'opzione {0} dev'essere un numero intero.",
  errWidthRange: 'La larghezza dev\'essere tra 1 e {0}.',
  errIeeeBits: 'La larghezza IEEE dev\'essere 32 o 64.',
  errFixedFlags: 'fixed richiede --int e --frac.',
  errFixedRange: 'fixed: --int e --frac fuori intervallo.',
  errBadNumber: 'Non è un numero: "{0}".',
  errEmptyDigits: 'Nessuna cifra da leggere.',
  errBadDigit: 'La cifra "{0}" non è valida in base {1}.',
  errNeedInteger: '"{0}" dev\'essere un intero qui.',
  errNeedNonNeg: '"{0}" dev\'essere zero o positivo qui.',
  errTooWide: '{0} non ci sta in {1} bit.',
  errSignedRange: '{0} è fuori intervallo per {1} bit con segno ({2}..{3}).',
  errFixedNeg: 'fixed richiede un valore non negativo.',
  errNotAscii: '"{0}" non è un carattere ASCII (prova utf8).',
  errNotAllowed: 'Il comando `{0}` non è ammesso in questo livello.',
  errInternal: 'Errore interno: {0}.',

  // guida per principianti
  introTitle: 'Mai visto il binario? Parti da qui',
  introStart: 'Capito — portami al livello 1 →',
};
