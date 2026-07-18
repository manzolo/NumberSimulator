// Engine contract: DSL parsing + errors, variable binding, the sim stepper
// protocol, determinism (same command + same vars ⇒ byte-identical trace),
// the budget guard, the allowed[] whitelist, and the canonical answers of
// every command (checked against bits.js / JS built-ins).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { parse } from '../js/core/parser.js';
import { buildRun, runHeadless } from '../js/core/engine.js';

const answer = (source, vars) => {
  const r = runHeadless({ source, vars });
  assert.equal(r.errors, undefined, `unexpected parse/build error: ${JSON.stringify(r.errors)}`);
  assert.equal(r.error, null, `unexpected runtime error: ${JSON.stringify(r.error)}`);
  return r.result.answer;
};

test('parser: ops, base words, flags, and errors', () => {
  assert.equal(parse('to bin 42').command.op, 'to');
  assert.equal(parse('to bin 42').command.base, 2);
  assert.equal(parse('bits 42 --width 8').command.width, 8);
  assert.equal(parse('nope 1').errors[0].code, 'errUnknownOp');
  assert.equal(parse('to zork 1').errors[0].code, 'errBadBase');
  assert.equal(parse('bits 1 --xyz 2').errors[0].code, 'errBadFlag');
  assert.equal(parse('').errors[0].code, 'errEmpty');
  assert.equal(parse('to bin 1\nbits 2 --width 8').errors[0].code, 'errOneCommand');
  assert.equal(parse('# just a comment').errors[0].code, 'errEmpty');
});

test('variable binding: a command references level-provided inputs', () => {
  assert.equal(answer('to bin x', { x: 42 }).text, '101010');
  assert.equal(answer('add a b --width 8', { a: 11, b: 6 }).text, '00010001');
});

test('to <base>: successive division matches toString', () => {
  assert.equal(answer('to bin 42').text, '101010');
  assert.equal(answer('to hex 255').text, 'ff');
  assert.equal(answer('to oct 42').text, '52');
  assert.equal(answer('to bin 0').text, '0');
  assert.equal(answer('to 3 42').text, (42).toString(3));
});

test('from <base>: positional expansion', () => {
  assert.equal(answer('from bin 101010').value, 42);
  assert.equal(answer('from hex 2a').value, 42);
  assert.equal(answer('from oct 52').value, 42);
});

test('bits / signed / neg', () => {
  assert.equal(answer('bits 42 --width 8').text, '00101010');
  assert.equal(answer('signed -5 --width 8').text, '11111011');
  assert.equal(answer('signed -5 --width 8').value, -5);
  assert.equal(answer('neg 5 --width 8').text, '11111011');
  assert.equal(answer('neg 5 --width 8').value, -5);
  // out-of-range signed
  const r = runHeadless({ source: 'signed 200 --width 8' });
  assert.equal(r.error.code, 'errSignedRange');
});

test('add / sub with carry and overflow', () => {
  assert.equal(answer('add 11 6 --width 8').value, 17);
  assert.equal(answer('add 200 100 --width 8').value, (300) % 256);
  assert.equal(answer('add 200 100 --width 8').carryOut, 1);
  assert.equal(answer('sub 10 3 --width 8').value, 7);
  assert.equal(answer('sub 3 10 --width 8').signedValue, -7);
});

test('bitwise and shifts', () => {
  assert.equal(answer('and 12 10 --width 8').value, 12 & 10);
  assert.equal(answer('or 12 10 --width 8').value, 12 | 10);
  assert.equal(answer('xor 12 10 --width 8').value, 12 ^ 10);
  assert.equal(answer('shl 1 3 --width 8').value, 8);
  assert.equal(answer('shr 8 2 --width 8').value, 2);
});

test('fixed-point and IEEE-754', () => {
  // 3.25 in Q4.4 → 0011.0100
  assert.equal(answer('fixed 3.25 --int 4 --frac 4').text, '0011.0100');
  assert.equal(answer('fixed 3.25 --int 4 --frac 4').value, 3.25);
  // 1.0 float32
  assert.equal(answer('ieee 1.0 --bits 32').text, '00111111100000000000000000000000');
  assert.equal(answer('ieee 1.0').sign, 0);
  assert.equal(answer('ieee -2.0 --bits 32').value, -2);
});

test('character encodings', () => {
  assert.equal(answer('ascii A').byte, 65);
  assert.equal(answer('ascii A').text, '01000001');
  assert.deepEqual(answer('utf8 è', { }).bytes, [0xc3, 0xa8]);
  assert.deepEqual(answer('utf8 x', { x: '€' }).bytes, [0xe2, 0x82, 0xac]);
  assert.ok(runHeadless({ source: 'ascii é' }).error);
});

test('sim protocol: nextTime/stepOnce/advanceTo/finalState, increasing seq', () => {
  const { sim } = buildRun({ source: 'bits 42 --width 8' });
  assert.equal(sim.now, 0);
  assert.equal(sim.nextTime(), 1);
  const d = sim.stepOnce();
  assert.equal(d.time, 1);
  assert.equal(d.events[0].type, 'input');
  sim.advanceTo(5);
  assert.equal(sim.now, 5);
  while (!sim.halted && !sim.error) sim.stepOnce();
  assert.equal(sim.nextTime(), null);
  const st = sim.finalState();
  assert.equal(st.halted, true);
  assert.equal(st.trace[st.trace.length - 1].type, 'done');
  for (let i = 1; i < st.trace.length; i++) assert.ok(st.trace[i].seq > st.trace[i - 1].seq);
});

test('determinism: same command + vars ⇒ identical trace', () => {
  const run = () => JSON.stringify(runHeadless({ source: 'add a b --width 8', vars: { a: 137, b: 91 } }).state.trace);
  assert.equal(run(), run());
});

test('allowed[] whitelist rejects forbidden commands', () => {
  const r = buildRun({ source: 'to bin 42', allowed: ['bits'] });
  assert.equal(r.errors[0].code, 'errNotAllowed');
  assert.deepEqual(r.errors[0].args, ['to']);
  assert.ok(buildRun({ source: 'bits 42 --width 8', allowed: ['bits'] }).sim);
});

test('budget: a runaway program stops with outcome=budget, not an error', () => {
  const r = runHeadless({ source: 'utf8 x', vars: { x: 'A'.repeat(5000) }, budget: 50 });
  assert.equal(r.error, null);
  assert.equal(r.result.outcome, 'budget');
});
