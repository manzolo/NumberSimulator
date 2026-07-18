// Pure number-representation helpers: value ⇄ bits, base formatting, two's
// complement, IEEE-754 and character encodings. No DOM, no randomness, no
// stepping — just correct conversions the executor animates and the tests
// pin against JavaScript's own built-ins (BigInt.toString, DataView,
// TextEncoder). Integers go through BigInt internally so widths up to 64 bits
// stay exact.

export const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

// Unsigned width-bit pattern, MSB first. A negative value wraps into its
// two's-complement pattern automatically (the mask does the work).
export function toBits(value, width) {
  const mask = (1n << BigInt(width)) - 1n;
  let v = BigInt(value) & mask;
  const bits = new Array(width);
  for (let i = width - 1; i >= 0; i--) { bits[i] = Number(v & 1n); v >>= 1n; }
  return bits;
}

export function bitsToUnsigned(bits) {
  let v = 0n;
  for (const b of bits) v = (v << 1n) | BigInt(b & 1);
  return Number(v);
}

// Interpret the same bits as a two's-complement signed integer.
export function bitsToSigned(bits) {
  const u = bitsToUnsigned(bits);
  const half = 2 ** (bits.length - 1);
  return u >= half ? u - 2 ** bits.length : u;
}

// The two's-complement encoding of `value` in `width` bits, or null if it does
// not fit the signed range [-2^(w-1), 2^(w-1)-1].
export function twosComplement(value, width) {
  const lo = -(2 ** (width - 1));
  const hi = 2 ** (width - 1) - 1;
  if (value < lo || value > hi) return null;
  return toBits(value, width);
}

// Format a non-negative integer value in an arbitrary base (2..36).
export function formatBase(value, base) {
  return BigInt(value).toString(base);
}

// Group a bit array into chunks of `size` (e.g. nibbles of 4), MSB side first,
// left-padding the top group with zeros so every group is full.
export function groupBits(bits, size) {
  const pad = (size - (bits.length % size)) % size;
  const padded = new Array(pad).fill(0).concat(bits);
  const groups = [];
  for (let i = 0; i < padded.length; i += size) groups.push(padded.slice(i, i + size));
  return groups;
}

// Parse a numeric literal: 0b1010, 0o52, 0x2a, decimal (with optional sign),
// or a plain float like 3.14 / -0.5. Returns { value, isFloat } or
// { error: {code, args} }.
export function parseLiteral(tok) {
  const s = String(tok).trim();
  let m;
  if ((m = /^([+-]?)0b([01]+)$/i.exec(s))) return { value: sign(m[1]) * Number(BigInt('0b' + m[2])), isFloat: false };
  if ((m = /^([+-]?)0o([0-7]+)$/i.exec(s))) return { value: sign(m[1]) * Number(BigInt('0o' + m[2])), isFloat: false };
  if ((m = /^([+-]?)0x([0-9a-f]+)$/i.exec(s))) return { value: sign(m[1]) * Number(BigInt('0x' + m[2])), isFloat: false };
  if (/^[+-]?\d+$/.test(s)) return { value: Number(s), isFloat: false };
  if (/^[+-]?(\d+\.\d*|\.\d+|\d+)(e[+-]?\d+)?$/i.test(s)) return { value: Number(s), isFloat: true };
  return { error: { code: 'errBadNumber', args: [s] } };
}

function sign(s) { return s === '-' ? -1 : 1; }

// Parse a string of digits in a given base into a value, validating each digit.
export function parseInBase(str, base) {
  const s = String(str).trim().toLowerCase();
  if (!s) return { error: { code: 'errEmptyDigits', args: [] } };
  let v = 0n;
  const B = BigInt(base);
  for (const ch of s) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) return { error: { code: 'errBadDigit', args: [ch, base] } };
    v = v * B + BigInt(d);
  }
  return { value: Number(v) };
}

// Ripple-carry addition of two unsigned width-bit numbers. Returns the sum
// bits, the carry INTO each position (carryIn[i], same indexing as bits,
// MSB-first) and whether the final carry-out overflowed the width.
export function addBits(a, b, width) {
  const A = toBits(a, width);
  const B = toBits(b, width);
  const sum = new Array(width).fill(0);
  const carryIn = new Array(width).fill(0);
  let carry = 0;
  for (let i = width - 1; i >= 0; i--) {
    carryIn[i] = carry;
    const s = A[i] + B[i] + carry;
    sum[i] = s & 1;
    carry = s >> 1;
  }
  return { A, B, sum, carryIn, carryOut: carry, overflow: carry === 1 };
}

// IEEE-754 encode: returns the bit array (MSB first) plus the field split
// {sign, exponent[], mantissa[]}. width ∈ {32, 64}. Uses DataView so the
// result is exactly what the hardware would store.
export function ieeeEncode(value, width = 32) {
  const bytes = width / 8;
  const dv = new DataView(new ArrayBuffer(bytes));
  if (width === 32) dv.setFloat32(0, value, false); else dv.setFloat64(0, value, false);
  const bits = [];
  for (let i = 0; i < bytes; i++) {
    const byte = dv.getUint8(i);
    for (let b = 7; b >= 0; b--) bits.push((byte >> b) & 1);
  }
  const expBits = width === 32 ? 8 : 11;
  return {
    bits,
    sign: bits[0],
    exponent: bits.slice(1, 1 + expBits),
    mantissa: bits.slice(1 + expBits),
    width,
    expBits,
    mantBits: width - 1 - expBits,
    bias: 2 ** (expBits - 1) - 1,
  };
}

export function ieeeDecode(bits) {
  const bytes = bits.length / 8;
  const dv = new DataView(new ArrayBuffer(bytes));
  for (let i = 0; i < bytes; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i * 8 + b];
    dv.setUint8(i, byte);
  }
  return bits.length === 32 ? dv.getFloat32(0, false) : dv.getFloat64(0, false);
}

// ASCII: one code point 0..127 → one byte. Returns { byte } or an error.
export function asciiByte(ch) {
  const code = ch.codePointAt(0);
  if (code === undefined || code > 127) return { error: { code: 'errNotAscii', args: [ch] } };
  return { byte: code };
}

// UTF-8 encode a string into an array of byte values (0..255).
export function utf8Bytes(str) {
  return [...new TextEncoder().encode(str)];
}

export function utf8Decode(bytes) {
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// A byte (0..255) as an 8-bit array, MSB first.
export function byteToBits(byte) {
  return toBits(byte, 8);
}
