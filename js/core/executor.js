// Runs one parsed command as a sequence of MICRO-OPS, one per tick, emitting
// language-neutral events the UI animates (a division line, a bit placed, a
// carry rippling, a field coloured) and building a canonical `result.answer`
// the verifier compares. Generator-based: tick(emit) resumes _run() exactly
// once. No randomness, no DOM — same command + same vars ⇒ same trace.
//
// Event vocabulary (all carry {time,seq} once emitted by the sim):
//   { type:'input', op, width, show:[{label,text}] }   set up the display
//   { type:'note',  code, args }                        a narration line (event log)
//   { type:'bit',   pos, value, row }                   set output cell pos (row default 'out')
//   { type:'carry', pos, value }                        a carry marker over column pos
//   { type:'field', name, from, to }                    colour a bit range (IEEE / fixed point)
//   { type:'digit', pos, char }                         set a base-digit cell
//   { type:'done',  answer, text }                      terminal; result = {outcome:'ok', answer, text}

import {
  toBits, bitsToUnsigned, bitsToSigned, twosComplement, formatBase,
  parseLiteral, parseInBase, addBits, ieeeEncode, ieeeDecode, asciiByte,
  utf8Bytes, byteToBits, DIGITS,
} from './bits.js';

export class NumExecutor {
  constructor(command, vars = {}) {
    this.cmd = command;
    this.vars = vars;
    this.done = false;
    this.error = null;
    this.buildError = null;
    this.result = { outcome: 'done', answer: null, text: '' };
    // Resolve operands eagerly so bad inputs fail before any tick.
    this._resolve();
    if (!this.buildError) this._gen = this._run();
  }

  _resolve() {
    const { cmd, vars } = this;
    this.vals = [];
    for (const o of cmd.operands ?? []) {
      if (o.str) {
        // a character/string operand: variable, quoted literal, or bare word
        const v = (o.tok in vars) ? vars[o.tok] : o.tok;
        this.vals.push(String(v));
        continue;
      }
      if (o.tok in vars) { this.vals.push(vars[o.tok]); continue; }
      const p = parseLiteral(o.tok);
      if (p.error) { this.buildError = p.error; return; }
      this.vals.push(p.value);
    }
  }

  tick(emit) {
    if (this.done) return;
    this._emit = emit;
    try {
      if (this._gen.next().done) this.done = true;
    } catch (e) {
      this.error = e && e.code ? e : { code: 'errInternal', args: [String(e?.message ?? e)] };
      this.done = true;
    }
  }

  forceStop(reason) { this.result.outcome = reason; this.done = true; }

  _finish(answer, text) {
    this.result.answer = answer;
    this.result.text = text;
    this._emit({ type: 'done', answer, text });
  }

  * _run() {
    const op = this.cmd.op;
    const fn = this[`_op_${op}`];
    if (!fn) throw { code: 'errUnknownOp', args: [op] };
    yield* fn.call(this);
  }

  // ---- helpers -------------------------------------------------------------

  _needInt(v) {
    if (!Number.isInteger(v)) throw { code: 'errNeedInteger', args: [String(v)] };
    return v;
  }

  _needNonNeg(v) {
    this._needInt(v);
    if (v < 0) throw { code: 'errNeedNonNeg', args: [String(v)] };
    return v;
  }

  // ---- to <base> <val> : successive division ------------------------------

  * _op_to() {
    const base = this.cmd.base;
    let v = this._needNonNeg(this.vals[0]);
    const value = v; // the decimal value, for the multi-base result readout
    this._emit({ type: 'input', op: 'to', width: null, base, show: [{ label: 'dec', text: String(v) }] });
    yield;
    if (v === 0) {
      this._emit({ type: 'digit', pos: 0, char: '0' });
      yield;
      return this._finish({ kind: 'to', base, text: '0', value }, '0');
    }
    const rem = [];
    while (v > 0) {
      const q = Math.floor(v / base);
      const r = v % base;
      this._emit({ type: 'note', code: 'noteDivide', args: [v, base, q, r, DIGITS[r].toUpperCase()] });
      rem.push(DIGITS[r]);
      v = q;
      yield;
    }
    const text = rem.reverse().join('');
    for (let i = 0; i < text.length; i++) { this._emit({ type: 'digit', pos: i, char: text[i] }); yield; }
    this._finish({ kind: 'to', base, text, value }, text);
  }

  // ---- from <base> <digits> : positional expansion ------------------------

  * _op_from() {
    const base = this.cmd.base;
    // the digits may be a bound variable (level input) or a literal token
    const raw = (this.cmd.raw in this.vars) ? String(this.vars[this.cmd.raw]) : this.cmd.raw;
    const parsed = parseInBase(raw, base);
    if (parsed.error) throw parsed.error;
    const digits = raw.toLowerCase();
    this._emit({ type: 'input', op: 'from', width: null, base, show: [{ label: `base ${base}`, text: digits }] });
    yield;
    let acc = 0;
    for (let i = 0; i < digits.length; i++) {
      const dv = DIGITS.indexOf(digits[i]);
      const power = digits.length - 1 - i;
      const weight = base ** power;
      acc += dv * weight;
      this._emit({ type: 'note', code: 'notePositional', args: [digits[i].toUpperCase(), power, weight, dv * weight, acc] });
      yield;
    }
    this._finish({ kind: 'value', value: acc, text: String(acc) }, String(acc));
  }

  // ---- bits <val> --width N : unsigned positional pattern -----------------

  * _op_bits() {
    const w = this.cmd.width;
    const v = this._needNonNeg(this.vals[0]);
    if (v >= 2 ** w) throw { code: 'errTooWide', args: [v, w] };
    const bits = toBits(v, w);
    this._emit({ type: 'input', op: 'bits', width: w, show: [{ label: 'dec', text: String(v) }] });
    yield;
    for (let pos = 0; pos < w; pos++) {
      this._emit({ type: 'bit', pos, value: bits[pos], row: 'out' });
      if (bits[pos]) this._emit({ type: 'note', code: 'noteWeight', args: [w - 1 - pos, 2 ** (w - 1 - pos)] });
      yield;
    }
    this._finish({ kind: 'bits', bits, text: bits.join('') }, bits.join(''));
  }

  // ---- signed <val> --width N : two's complement of a signed value --------

  * _op_signed() {
    const w = this.cmd.width;
    const v = this._needInt(this.vals[0]);
    const bits = twosComplement(v, w);
    if (!bits) throw { code: 'errSignedRange', args: [v, w, -(2 ** (w - 1)), 2 ** (w - 1) - 1] };
    this._emit({ type: 'input', op: 'signed', width: w, show: [{ label: 'dec', text: String(v) }] });
    yield;
    for (let pos = 0; pos < w; pos++) { this._emit({ type: 'bit', pos, value: bits[pos], row: 'out' }); yield; }
    this._finish({ kind: 'signed', bits, text: bits.join(''), value: bitsToSigned(bits) }, bits.join(''));
  }

  // ---- neg <val> --width N : invert + 1 -----------------------------------

  * _op_neg() {
    const w = this.cmd.width;
    const v = this._needInt(this.vals[0]);
    const src = toBits(v < 0 ? v : v, w);
    this._emit({ type: 'input', op: 'neg', width: w, show: [{ label: 'src', text: src.join('') }] });
    yield;
    const inv = src.map((b) => b ^ 1);
    for (let pos = 0; pos < w; pos++) { this._emit({ type: 'bit', pos, value: inv[pos], row: 'out' }); yield; }
    this._emit({ type: 'note', code: 'notePlusOne', args: [] });
    yield;
    // ripple +1
    const out = inv.slice();
    let carry = 1;
    for (let pos = w - 1; pos >= 0 && carry; pos--) {
      const s = out[pos] + carry;
      out[pos] = s & 1; carry = s >> 1;
      this._emit({ type: 'bit', pos, value: out[pos], row: 'out' });
      if (carry) this._emit({ type: 'carry', pos: pos - 1, value: 1 });
      yield;
    }
    this._finish({ kind: 'neg', bits: out, text: out.join(''), value: bitsToSigned(out) }, out.join(''));
  }

  // ---- add / sub ----------------------------------------------------------

  * _op_add() { yield* this._addsub(false); }

  * _op_sub() { yield* this._addsub(true); }

  * _addsub(isSub) {
    const w = this.cmd.width;
    const a = this._needInt(this.vals[0]);
    const b0 = this._needInt(this.vals[1]);
    const b = isSub ? -b0 : b0;
    const r = addBits(a, b, w); // toBits masks negatives into two's complement
    this._emit({
      type: 'input', op: isSub ? 'sub' : 'add', width: w,
      show: [{ label: 'a', text: r.A.join('') }, { label: 'b', text: r.B.join('') }],
    });
    yield;
    for (let pos = w - 1; pos >= 0; pos--) {
      this._emit({ type: 'bit', pos, value: r.sum[pos], row: 'out' });
      this._emit({ type: 'note', code: 'noteAddCol', args: [w - 1 - pos, r.A[pos], r.B[pos], r.carryIn[pos], r.sum[pos]] });
      if (pos - 1 >= 0 && (r.A[pos] + r.B[pos] + r.carryIn[pos]) >> 1) this._emit({ type: 'carry', pos: pos - 1, value: 1 });
      yield;
    }
    const answer = {
      kind: isSub ? 'sub' : 'add', bits: r.sum, text: r.sum.join(''),
      value: bitsToUnsigned(r.sum), signedValue: bitsToSigned(r.sum), carryOut: r.carryOut,
    };
    this._finish(answer, r.sum.join(''));
  }

  // ---- bitwise and/or/xor -------------------------------------------------

  * _op_and() { yield* this._bitwise((x, y) => x & y); }

  * _op_or() { yield* this._bitwise((x, y) => x | y); }

  * _op_xor() { yield* this._bitwise((x, y) => x ^ y); }

  * _bitwise(f) {
    const w = this.cmd.width;
    const A = toBits(this._needInt(this.vals[0]), w);
    const B = toBits(this._needInt(this.vals[1]), w);
    this._emit({ type: 'input', op: this.cmd.op, width: w, show: [{ label: 'a', text: A.join('') }, { label: 'b', text: B.join('') }] });
    yield;
    const out = new Array(w);
    for (let pos = 0; pos < w; pos++) {
      out[pos] = f(A[pos], B[pos]);
      this._emit({ type: 'bit', pos, value: out[pos], row: 'out' });
      yield;
    }
    this._finish({ kind: this.cmd.op, bits: out, text: out.join(''), value: bitsToUnsigned(out) }, out.join(''));
  }

  // ---- shifts -------------------------------------------------------------

  * _op_shl() { yield* this._shift(true); }

  * _op_shr() { yield* this._shift(false); }

  * _shift(left) {
    const w = this.cmd.width;
    const v = this._needNonNeg(this.vals[0]);
    const n = this._needNonNeg(this.vals[1]);
    const src = toBits(v, w);
    this._emit({ type: 'input', op: this.cmd.op, width: w, show: [{ label: 'src', text: src.join('') }, { label: 'by', text: String(n) }] });
    yield;
    const out = new Array(w).fill(0);
    for (let pos = 0; pos < w; pos++) {
      const from = left ? pos + n : pos - n;
      out[pos] = from >= 0 && from < w ? src[from] : 0;
      this._emit({ type: 'bit', pos, value: out[pos], row: 'out' });
      yield;
    }
    this._finish({ kind: this.cmd.op, bits: out, text: out.join(''), value: bitsToUnsigned(out) }, out.join(''));
  }

  // ---- fixed-point --------------------------------------------------------

  * _op_fixed() {
    const I = this.cmd.intBits; const F = this.cmd.fracBits; const w = I + F;
    const v = this.vals[0];
    if (v < 0) throw { code: 'errFixedNeg', args: [] };
    const scaled = Math.round(v * 2 ** F);
    if (scaled >= 2 ** w) throw { code: 'errTooWide', args: [v, w] };
    const bits = toBits(scaled, w);
    this._emit({ type: 'input', op: 'fixed', width: w, show: [{ label: 'dec', text: String(v) }] });
    yield;
    this._emit({ type: 'field', name: 'int', from: 0, to: I - 1 });
    this._emit({ type: 'field', name: 'frac', from: I, to: w - 1 });
    yield;
    for (let pos = 0; pos < w; pos++) { this._emit({ type: 'bit', pos, value: bits[pos], row: 'out' }); yield; }
    const recon = bitsToUnsigned(bits) / 2 ** F;
    const text = bits.slice(0, I).join('') + '.' + bits.slice(I).join('');
    this._finish({ kind: 'fixed', bits, text, intBits: I, fracBits: F, value: recon }, text);
  }

  // ---- IEEE-754 -----------------------------------------------------------

  * _op_ieee() {
    const w = this.cmd.width;
    const v = this.vals[0];
    const enc = ieeeEncode(v, w);
    this._emit({ type: 'input', op: 'ieee', width: w, show: [{ label: 'dec', text: String(v) }] });
    yield;
    this._emit({ type: 'field', name: 'sign', from: 0, to: 0 });
    this._emit({ type: 'field', name: 'exp', from: 1, to: enc.expBits });
    this._emit({ type: 'field', name: 'mant', from: 1 + enc.expBits, to: w - 1 });
    yield;
    for (let pos = 0; pos < w; pos++) { this._emit({ type: 'bit', pos, value: enc.bits[pos], row: 'out' }); yield; }
    const answer = {
      kind: 'ieee', bits: enc.bits, text: enc.bits.join(''),
      sign: enc.sign, exponent: enc.exponent.join(''), mantissa: enc.mantissa.join(''),
      value: ieeeDecode(enc.bits),
    };
    this._finish(answer, enc.bits.join(''));
  }

  // ---- character encodings ------------------------------------------------

  * _op_ascii() {
    const ch = [...this.vals[0]][0] ?? '';
    const r = asciiByte(ch);
    if (r.error) throw r.error;
    const bits = byteToBits(r.byte);
    this._emit({ type: 'input', op: 'ascii', width: 8, show: [{ label: 'char', text: ch }] });
    yield;
    this._emit({ type: 'note', code: 'noteCodePoint', args: [ch, r.byte, formatBase(r.byte, 16).toUpperCase()] });
    yield;
    for (let pos = 0; pos < 8; pos++) { this._emit({ type: 'bit', pos, value: bits[pos], row: 'out' }); yield; }
    this._finish({ kind: 'ascii', byte: r.byte, bits, text: bits.join(''), char: ch }, bits.join(''));
  }

  * _op_utf8() {
    const str = this.vals[0];
    const bytes = utf8Bytes(str);
    this._emit({ type: 'input', op: 'utf8', width: bytes.length * 8, show: [{ label: 'text', text: str }] });
    yield;
    const allBits = [];
    for (let i = 0; i < bytes.length; i++) {
      const bb = byteToBits(bytes[i]);
      this._emit({ type: 'note', code: 'noteUtf8Byte', args: [i + 1, bytes.length, formatBase(bytes[i], 16).toUpperCase().padStart(2, '0')] });
      for (let b = 0; b < 8; b++) { this._emit({ type: 'bit', pos: i * 8 + b, value: bb[b], row: 'out' }); allBits.push(bb[b]); }
      yield;
    }
    this._finish({ kind: 'utf8', bytes, text: bytes.map((b) => formatBase(b, 16).padStart(2, '0')).join(' ') }, bytes.join(','));
  }
}
