// English chrome strings. Flat dictionary; {0}/{1} are positional arguments.

export default {
  tagline: 'see every bit — how computers represent numbers',

  navIntro: 'Basics',
  navLevels: 'Levels',
  navSandbox: 'Sandbox',
  help: 'Help',
  run: '▶ Run',
  pause: '❚❚ Pause',
  step: 'Step',
  reset: 'Reset',
  speed: 'speed',

  panelBitgrid: 'BITS',
  panelResult: 'RESULT',
  panelScript: 'COMMAND',
  panelCases: 'CASES',
  panelEvents: 'STEPS',

  statusReady: 'Ready.',
  statusRunning: 'Running…',
  statusPaused: 'Paused.',
  statusParseFailed: 'The command does not parse.',
  statusDone: 'Done in {0} steps.',
  statusBudget: 'Step budget exhausted — the run was cut short.',
  failStatus: 'Not passed yet.',

  levelBadge: 'LEVEL {0}',
  completedBadge: 'completed',
  goalLabel: 'GOAL —',
  allowedLabel: 'commands',
  hintBtn: 'Hint {0}/{1}',
  hintsDone: 'No more hints',
  nextLevel: 'Next level →',
  passMsg: 'Passed! Every case is green — hidden ones included.',
  failVisible: 'The visible case fails — run it and see where it goes wrong.',
  failHidden: 'The visible case passes, but a HIDDEN case fails: is a fixed value hardcoded instead of the variable?',

  sandboxTitle: 'SANDBOX',
  sandboxText: 'Free mode: any command, literal numbers, everything animated bit by bit. Nothing is graded here.',
  sandboxCardTitle: 'Sandbox',
  sandboxCardDesc: 'free experimentation',
  selectTitle: 'Choose a level',

  caseLabel: 'Case',
  casesNote: '+{0} hidden cases: same command, different numbers. Hardcoded answers do not survive them.',

  resultEmpty: 'Run the command to see the result, every way at once.',
  statBits: 'bits',
  statUnsigned: 'unsigned',
  statSigned: 'signed',
  statHex: 'hex',
  statCarry: 'carry out',
  statBase: 'base',
  statDecimal: 'decimal',
  statValue: 'value',
  statPattern: 'pattern',
  statSign: 'sign',
  statExp: 'exponent',
  statMantissa: 'mantissa',
  statChar: 'char',
  statByte: 'byte',
  statBytes: 'bytes',

  evtEmpty: 'Engine steps will appear here.',
  evtInput: 'run: {0}',
  evtField: 'field: {0}',
  evtBudget: 'step budget ({0}) exhausted',

  // step narration
  noteDivide: '{0} ÷ {1} = {2}, remainder {3} → {4}',
  notePositional: '{0}: weight {2} (pos {1}) → +{3}, total {4}',
  noteWeight: 'bit on: weight {1} (2^{0})',
  noteAddCol: 'column {0}: {1} + {2} + carry {3} = {4}',
  notePlusOne: 'then add 1',
  noteCodePoint: "'{0}' → code point {1} (0x{2})",
  noteUtf8Byte: 'byte {0}/{1}: {2}',

  // help
  helpTitle: 'Command reference',
  helpHtml: `
<p>One command per program. <b>Ctrl+Enter</b> runs, <b>F8</b> steps one micro-op.
In a level, reference the given inputs by name (x, a, b, d, n, c); in the sandbox
use literal numbers (<code>42</code>, <code>0b1010</code>, <code>0x2a</code>,
<code>3.14</code>).</p>
<pre>to   &lt;base&gt; &lt;val&gt; [--width N]     value → digits in a base
from &lt;base&gt; &lt;digits&gt;             digits in a base → value
bits &lt;val&gt; [--width N]           unsigned fixed-width pattern
signed &lt;val&gt; [--width N]         two's-complement of a signed value
neg  &lt;val&gt; [--width N]           two's-complement negation
add|sub|and|or|xor &lt;a&gt; &lt;b&gt; [--width N]
shl|shr &lt;val&gt; &lt;n&gt; [--width N]     logical shift
fixed &lt;val&gt; --int I --frac F     fixed-point binary (Q I.F)
ieee &lt;val&gt; [--bits 32|64]        IEEE-754 float fields
ascii &lt;char&gt;                     one ASCII code point → a byte
utf8  &lt;text&gt;                     a string → UTF-8 bytes</pre>
<p>base = bin | oct | dec | hex, or a number 2–36.</p>`,

  // engine errors
  errEmpty: 'Type a command.',
  errOneCommand: 'One command at a time.',
  errUnclosed: 'Unclosed quote.',
  errUnknownOp: 'Unknown command: "{0}".',
  errBadBase: 'Unknown base: "{0}" (bin, oct, dec, hex, or 2–36).',
  errNeedDigits: 'This command needs some digits.',
  errNeedOperand: '`{0}` needs another value.',
  errUnexpected: 'Unexpected: {0}.',
  errBadFlag: 'Unknown option {0} for `{1}`.',
  errFlagValue: 'Option {0} needs a value.',
  errFlagInt: 'Option {0} must be a whole number.',
  errWidthRange: 'Width must be between 1 and {0}.',
  errIeeeBits: 'IEEE width must be 32 or 64.',
  errFixedFlags: 'fixed needs --int and --frac.',
  errFixedRange: 'fixed: --int and --frac are out of range.',
  errBadNumber: 'Not a number: "{0}".',
  errEmptyDigits: 'No digits to read.',
  errBadDigit: 'Digit "{0}" is not valid in base {1}.',
  errNeedInteger: '"{0}" must be a whole number here.',
  errNeedNonNeg: '"{0}" must be zero or positive here.',
  errTooWide: '{0} does not fit in {1} bits.',
  errSignedRange: '{0} is out of range for {1} signed bits ({2}..{3}).',
  errFixedNeg: 'fixed needs a non-negative value.',
  errNotAscii: '"{0}" is not an ASCII character (try utf8).',
  errNotAllowed: 'The command `{0}` is not allowed in this level.',
  errInternal: 'Internal error: {0}.',

  // primer
  introTitle: 'New to binary? Start here',
  introStart: 'Got it — take me to level 1 →',
};
