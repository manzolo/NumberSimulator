// The outcome panel: the finished representation shown several ways at once —
// the bit string grouped into nibbles, its unsigned/signed decimal readings,
// hex, and for IEEE-754 the decoded value and the sign/exponent/mantissa split.
// It reads the executor's canonical `answer`, so it always agrees with the
// animated grid.

import { t } from '../i18n.js';
import { bitsToUnsigned, bitsToSigned, formatBase, groupBits } from '../core/bits.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function createResultPanel(container) {
  let answer = null;

  function chip(label, value, kind = '') {
    return `<div class="stat ${kind}"><span class="stat-k">${label}</span><span class="stat-v">${esc(value)}</span></div>`;
  }

  function bitString(bits) {
    return groupBits(bits, 4).map((g) => g.join('')).join(' ');
  }

  // A base conversion, read every common way at once: the same value in binary,
  // octal, decimal and hex, each with its badge, the primary reading highlighted.
  const CONV_BASES = [[2, 'BIN'], [8, 'OCT'], [10, 'DEC'], [16, 'HEX']];
  function convBlock(value, highlight) {
    const rows = CONV_BASES.map(([b, name]) => {
      const digits = b === 10 ? String(value) : formatBase(value, b).toUpperCase();
      const hl = b === highlight ? ' hl' : '';
      return `<div class="conv-row${hl}"><span class="conv-badge">${name}</span><span class="conv-digits">${esc(digits)}</span></div>`;
    }).join('');
    return `<div class="conv">${rows}</div>`;
  }

  function render() {
    if (!answer) { container.innerHTML = `<div class="tbl-empty">${t('resultEmpty')}</div>`; return; }
    const a = answer;
    const chips = [];

    if (Array.isArray(a.bits) && a.kind !== 'ieee' && a.kind !== 'fixed') {
      chips.push(chip(t('statBits'), bitString(a.bits)));
      chips.push(chip(t('statUnsigned'), bitsToUnsigned(a.bits)));
      if (a.bits.length <= 32) chips.push(chip(t('statSigned'), bitsToSigned(a.bits)));
      chips.push(chip(t('statHex'), formatBase(bitsToUnsigned(a.bits), 16).toUpperCase().padStart(Math.ceil(a.bits.length / 4), '0')));
      if (a.carryOut !== undefined) chips.push(chip(t('statCarry'), a.carryOut, a.carryOut ? 'warn' : ''));
    } else if (a.kind === 'to') {
      chips.push(convBlock(a.value, a.base));
    } else if (a.kind === 'value') {
      chips.push(convBlock(a.value, 10));
    } else if (a.kind === 'fixed') {
      chips.push(chip(t('statPattern'), a.text));
      chips.push(chip(t('statValue'), a.value));
      chips.push(chip('Q', `${a.intBits}.${a.fracBits}`));
    } else if (a.kind === 'ieee') {
      chips.push(chip(t('statValue'), a.value));
      chips.push(chip(t('statSign'), a.sign));
      chips.push(chip(t('statExp'), a.exponent));
      chips.push(chip(t('statMantissa'), a.mantissa));
    } else if (a.kind === 'ascii') {
      chips.push(chip(t('statChar'), a.char));
      chips.push(chip(t('statByte'), a.byte));
      chips.push(chip(t('statBits'), bitString(a.bits)));
    } else if (a.kind === 'utf8') {
      chips.push(chip(t('statBytes'), a.text));
      chips.push(chip('n', a.bytes.length));
    }

    container.innerHTML = `<div class="stats">${chips.join('')}</div>`;
  }

  render();
  return {
    show(a) { answer = a; render(); },
    clear() { answer = null; render(); },
    refresh: render,
  };
}
