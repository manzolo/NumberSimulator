// The task DSL: one command per program. Each command is a small
// number-representation task whose steps the executor animates. Same spirit as
// EDU-CRYPTO's recipe parser — line-oriented, `#` comments, language-neutral
// {code, args} errors — but here a program is a SINGLE command (the level sets
// the inputs as named variables; the user writes one expression over them).
//
// Grammar:
//   to   <base> <val> [--width N]      value → digits in a base (successive division)
//   from <base> <digits>              digits in a base → value (positional expansion)
//   bits <val> [--width N]            unsigned fixed-width bit pattern
//   signed <val> [--width N]          two's-complement pattern of a signed value
//   neg  <val> [--width N]            two's-complement negation (invert + 1)
//   add|sub|and|or|xor <a> <b> [--width N]
//   shl|shr <val> <n> [--width N]     logical shift by n
//   fixed <val> --int I --frac F      fixed-point binary (Q I.F)
//   ieee <val> [--bits 32|64]         IEEE-754 float fields
//   ascii <char>                      one ASCII code point → a byte
//   utf8  <text>                      a string → UTF-8 bytes
//
// <base> ∈ bin|oct|dec|hex or a number 2..36. <val>/<a>/<b> is a literal
// (42, 0b1010, 0o52, 0x2a, 3.14) or a variable name bound by the level.

export const BASE_WORDS = { bin: 2, binary: 2, oct: 8, octal: 8, dec: 10, decimal: 10, hex: 16, hexadecimal: 16 };

const OPS = {
  to: { operands: 1, base: true, flags: ['width'] },
  from: { operands: 0, base: true, raw: true, flags: [] },
  bits: { operands: 1, flags: ['width'] },
  signed: { operands: 1, flags: ['width'] },
  neg: { operands: 1, flags: ['width'] },
  add: { operands: 2, flags: ['width'] },
  sub: { operands: 2, flags: ['width'] },
  and: { operands: 2, flags: ['width'] },
  or: { operands: 2, flags: ['width'] },
  xor: { operands: 2, flags: ['width'] },
  shl: { operands: 2, flags: ['width'] },
  shr: { operands: 2, flags: ['width'] },
  fixed: { operands: 1, flags: ['int', 'frac'] },
  ieee: { operands: 1, flags: ['bits'] },
  ascii: { operands: 1, str: true, flags: [] },
  utf8: { operands: 1, str: true, flags: [] },
};

export const CAPS = { width: 64, intBits: 24, fracBits: 24, shiftMax: 64 };

function tokenize(line) {
  const tokens = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === '"') {
      let j = i + 1; let s = '';
      while (j < line.length && line[j] !== '"') { s += line[j]; j++; }
      if (j >= line.length) return { error: 'errUnclosed' };
      tokens.push({ v: s, quoted: true });
      i = j + 1;
    } else {
      let j = i; let s = '';
      while (j < line.length && !/\s/.test(line[j])) { s += line[j]; j++; }
      tokens.push({ v: s });
      i = j;
    }
  }
  return { tokens };
}

function resolveBase(tok) {
  if (tok === undefined) return null;
  if (BASE_WORDS[tok.toLowerCase()] !== undefined) return BASE_WORDS[tok.toLowerCase()];
  const n = Number(tok);
  if (Number.isInteger(n) && n >= 2 && n <= 36) return n;
  return null;
}

export function parse(src) {
  const lines = String(src ?? '').split('\n')
    .map((l) => l.replace(/#.*$/, '').trim())
    .filter((l) => l.length);
  if (!lines.length) return { errors: [{ code: 'errEmpty', args: [] }] };
  if (lines.length > 1) return { errors: [{ code: 'errOneCommand', args: [] }] };

  const tk = tokenize(lines[0]);
  if (tk.error) return { errors: [{ code: tk.error, args: [] }] };
  const toks = tk.tokens;
  const op = toks[0]?.v;
  const spec = OPS[op];
  if (!spec) return { errors: [{ code: 'errUnknownOp', args: [op ?? ''] }] };

  const cmd = { op, key: op, operands: [], flags: {} };
  let idx = 1;

  if (spec.base) {
    const base = resolveBase(toks[idx]?.v);
    if (base === null) return { errors: [{ code: 'errBadBase', args: [toks[idx]?.v ?? ''] }] };
    cmd.base = base;
    idx += 1;
  }

  if (spec.raw) {
    if (!toks[idx]) return { errors: [{ code: 'errNeedDigits', args: [] }] };
    cmd.raw = toks[idx].v;
    idx += 1;
  } else {
    for (let k = 0; k < spec.operands; k++) {
      const t = toks[idx];
      if (!t) return { errors: [{ code: 'errNeedOperand', args: [op] }] };
      cmd.operands.push({ tok: t.v, quoted: !!t.quoted, str: !!spec.str });
      idx += 1;
    }
  }

  // remaining tokens: flags
  while (idx < toks.length) {
    const t = toks[idx].v;
    if (!t.startsWith('--')) return { errors: [{ code: 'errUnexpected', args: [t] }] };
    const name = t.slice(2);
    if (!spec.flags.includes(name)) return { errors: [{ code: 'errBadFlag', args: [t, op] }] };
    const val = toks[idx + 1]?.v;
    if (val === undefined) return { errors: [{ code: 'errFlagValue', args: [t] }] };
    const n = Number(val);
    if (!Number.isInteger(n)) return { errors: [{ code: 'errFlagInt', args: [t] }] };
    cmd.flags[name] = n;
    idx += 2;
  }

  // validate & default flags
  if (spec.flags.includes('width')) {
    const w = cmd.flags.width ?? 8;
    if (w < 1 || w > CAPS.width) return { errors: [{ code: 'errWidthRange', args: [CAPS.width] }] };
    cmd.width = w;
  }
  if (op === 'ieee') {
    const b = cmd.flags.bits ?? 32;
    if (b !== 32 && b !== 64) return { errors: [{ code: 'errIeeeBits', args: [] }] };
    cmd.width = b;
  }
  if (op === 'fixed') {
    const I = cmd.flags.int; const F = cmd.flags.frac;
    if (I === undefined || F === undefined) return { errors: [{ code: 'errFixedFlags', args: [] }] };
    if (I < 1 || I > CAPS.intBits || F < 1 || F > CAPS.fracBits) return { errors: [{ code: 'errFixedRange', args: [] }] };
    cmd.intBits = I; cmd.fracBits = F; cmd.width = I + F;
  }

  return { command: cmd };
}
