// Correctness of the pure representation helpers, pinned against JavaScript's
// own built-ins (Number.toString, parseInt, DataView, TextEncoder) and a few
// hand-computed reference patterns. If these pass, the engine's arithmetic is
// trustworthy and the levels can rely on it.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  toBits, bitsToUnsigned, bitsToSigned, twosComplement, formatBase, groupBits,
  parseLiteral, parseInBase, addBits, ieeeEncode, ieeeDecode, asciiByte,
  utf8Bytes, utf8Decode, byteToBits,
} from '../js/core/bits.js';

test('toBits / bitsToUnsigned: round-trips and matches toString(2)', () => {
  for (const v of [0, 1, 42, 170, 255, 12345, 65535]) {
    const w = v < 256 ? 8 : 16;
    const bits = toBits(v, w);
    assert.equal(bits.length, w);
    assert.equal(bits.join(''), v.toString(2).padStart(w, '0'));
    assert.equal(bitsToUnsigned(bits), v);
  }
  assert.deepEqual(toBits(42, 8), [0, 0, 1, 0, 1, 0, 1, 0]);
});

test('two\'s complement: negatives wrap, decode round-trips, range enforced', () => {
  assert.deepEqual(toBits(-1, 8), [1, 1, 1, 1, 1, 1, 1, 1]);
  assert.equal(bitsToUnsigned(toBits(-5, 8)), 251);
  assert.equal(bitsToSigned(toBits(-5, 8)), -5);
  assert.equal(bitsToSigned(toBits(-128, 8)), -128);
  assert.equal(bitsToSigned(toBits(127, 8)), 127);
  assert.ok(twosComplement(127, 8));
  assert.equal(twosComplement(128, 8), null); // out of signed 8-bit range
  assert.equal(twosComplement(-129, 8), null);
});

test('formatBase matches BigInt.toString across bases', () => {
  for (const v of [0, 7, 42, 255, 4095, 65535]) {
    for (const base of [2, 8, 10, 16]) {
      assert.equal(formatBase(v, base), v.toString(base));
    }
  }
  assert.equal(formatBase(42, 16), '2a');
});

test('groupBits pads and chunks into nibbles', () => {
  assert.deepEqual(groupBits(toBits(42, 8), 4), [[0, 0, 1, 0], [1, 0, 1, 0]]);
  // 5 bits, grouped by 4 → padded to 8
  assert.deepEqual(groupBits([1, 0, 1, 0, 1], 4), [[0, 0, 0, 1], [0, 1, 0, 1]]);
});

test('parseLiteral handles every base and floats', () => {
  assert.deepEqual(parseLiteral('42'), { value: 42, isFloat: false });
  assert.deepEqual(parseLiteral('0b101010'), { value: 42, isFloat: false });
  assert.deepEqual(parseLiteral('0o52'), { value: 42, isFloat: false });
  assert.deepEqual(parseLiteral('0x2a'), { value: 42, isFloat: false });
  assert.deepEqual(parseLiteral('-5'), { value: -5, isFloat: false });
  assert.deepEqual(parseLiteral('3.14'), { value: 3.14, isFloat: true });
  assert.deepEqual(parseLiteral('-0.5'), { value: -0.5, isFloat: true });
  assert.ok(parseLiteral('nope').error);
});

test('parseInBase validates digits', () => {
  assert.equal(parseInBase('101010', 2).value, 42);
  assert.equal(parseInBase('2a', 16).value, 42);
  assert.equal(parseInBase('52', 8).value, 42);
  assert.ok(parseInBase('2', 2).error); // '2' is not a binary digit
  assert.ok(parseInBase('xyz', 16).error);
});

test('addBits matches modular addition and flags overflow', () => {
  for (const [a, b, w] of [[11, 6, 8], [200, 100, 8], [255, 1, 8], [1000, 24, 16]]) {
    const r = addBits(a, b, w);
    const expected = (a + b) % (2 ** w);
    assert.equal(bitsToUnsigned(r.sum), expected, `${a}+${b} in ${w} bits`);
    assert.equal(r.overflow, a + b >= 2 ** w);
  }
  // 11 + 6 = 17 = 0b10001, carry chain check
  const r = addBits(11, 6, 8);
  assert.equal(bitsToUnsigned(r.sum), 17);
  assert.equal(r.overflow, false);
});

test('IEEE-754: known patterns, round-trips, and the 0.1 story', () => {
  // 1.0 in float32 is 0x3F800000
  const one = ieeeEncode(1.0, 32);
  assert.equal(one.bits.join(''), '00111111100000000000000000000000');
  assert.equal(one.sign, 0);
  assert.equal(one.exponent.length, 8);
  assert.equal(one.mantissa.length, 23);
  assert.equal(ieeeDecode(one.bits), 1.0);
  // -2.0 float32 = 0xC0000000
  assert.equal(ieeeEncode(-2.0, 32).bits.join(''), '11000000000000000000000000000000');
  // round-trip through float32 equals Math.fround
  for (const x of [0, 0.5, 3.14, -0.1, 1e6]) {
    assert.equal(ieeeDecode(ieeeEncode(x, 32).bits), Math.fround(x));
  }
  // float64 is exact for the JS double 0.1; the point is the mantissa is not
  // a clean pattern (0.1 is not representable in a finite binary fraction)
  const p1 = ieeeEncode(0.1, 64);
  assert.equal(ieeeDecode(p1.bits), 0.1);
  assert.equal(p1.bits.length, 64);
  assert.ok(p1.mantissa.slice(-4).some((b) => b === 1), '0.1 mantissa is not clean');
});

test('character encodings match TextEncoder / code points', () => {
  assert.equal(asciiByte('A').byte, 65);
  assert.equal(asciiByte('0').byte, 48);
  assert.ok(asciiByte('è').error); // beyond ASCII
  assert.deepEqual(utf8Bytes('A'), [65]);
  assert.deepEqual(utf8Bytes('è'), [0xc3, 0xa8]);
  assert.deepEqual(utf8Bytes('€'), [0xe2, 0x82, 0xac]);
  assert.equal(utf8Decode(utf8Bytes('ciào €')), 'ciào €');
  assert.deepEqual(byteToBits(65), [0, 1, 0, 0, 0, 0, 0, 1]);
});
