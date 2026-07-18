// The level contract, mirrored from the sibling EDU-* labs:
//  - every level is structurally sound and fully bilingual;
//  - the reference solution passes ALL cases, visible AND hidden;
//  - the starter command does NOT already pass;
//  - hardcoded answers (literals instead of the level's variables) fail the
//    hidden cases;
//  - makeCases() is deterministic across calls.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { levels, levelById } from '../js/levels/index.js';
import { verifyAll } from '../js/levels/verify.js';
import { SOLUTIONS } from './solutions.js';

const ID_RE = /^[a-z][a-z0-9-]*$/;

test('curriculum: 14 levels, unique kebab-case ids, resolvable by id', () => {
  assert.equal(levels.length, 14);
  const ids = levels.map((l) => l.id);
  assert.equal(new Set(ids).size, 14);
  for (const id of ids) {
    assert.match(id, ID_RE);
    assert.equal(levelById(id).id, id);
  }
  assert.equal(levelById('nope'), null);
});

test('levels: bilingual structure, hints, starter, allowed list, cases', () => {
  for (const l of levels) {
    for (const field of ['title', 'text', 'goal']) {
      assert.ok(l[field]?.en && l[field]?.it, `${l.id}: ${field} must be {en,it}`);
    }
    assert.ok(Array.isArray(l.hints) && l.hints.length >= 2, `${l.id}: at least 2 hints`);
    for (const h of l.hints) assert.ok(h.en && h.it, `${l.id}: bilingual hint`);
    assert.ok(typeof l.start === 'string' && l.start.trim(), `${l.id}: starter command`);
    assert.ok(Array.isArray(l.allowed) && l.allowed.length, `${l.id}: allowed[]`);
    const cases = l.makeCases();
    assert.ok(cases.length >= 3, `${l.id}: at least 3 cases`);
    assert.ok(cases.some((c) => c.visible), `${l.id}: at least one visible case`);
    assert.ok(cases.some((c) => !c.visible), `${l.id}: at least one HIDDEN case`);
  }
});

test('makeCases() is deterministic across calls', () => {
  for (const l of levels) {
    const a = JSON.stringify(l.makeCases());
    const b = JSON.stringify(l.makeCases());
    assert.equal(a, b, `${l.id}: makeCases must be pure`);
  }
});

for (const level of levels) {
  test(`solution passes ALL cases (visible + hidden): ${level.id}`, () => {
    const sol = SOLUTIONS[level.id];
    assert.ok(sol, `missing solution for ${level.id}`);
    for (const [i, r] of verifyAll(level, sol).entries()) {
      assert.ok(r.pass, `${level.id} case ${i} (${r.visible ? 'visible' : 'hidden'}) failed: `
        + JSON.stringify({ errors: r.errors, error: r.error, outcome: r.outcome }));
    }
  });

  test(`starter does NOT already pass: ${level.id}`, () => {
    assert.ok(verifyAll(level, level.start).some((r) => !r.pass), `${level.id}: starter must fail at least one case`);
  });
}

// Hardcoded answers: a literal matching the FIRST visible case, which must then
// fail a hidden case (the anti-cheat).
const CHEATS = {
  'bit-weights': 'bits 42 --width 8',
  'dec-to-bin': 'to bin 42',
  'hex-nibbles': 'to hex 42',
  'read-base': 'from hex 2a',
  'binary-add': 'add 11 6 --width 8',
  overflow: 'add 200 100 --width 8',
  'binary-sub': 'sub 10 3 --width 8',
  'twos-complement': 'neg 5 --width 8',
  'signed-add': 'add 10 -3 --width 8',
  'shift-mask': 'shl 1 3 --width 8',
  'fixed-point': 'fixed 3.25 --int 4 --frac 4',
  ieee32: 'ieee 1.0 --bits 32',
  'char-encoding': 'utf8 A',
  'double-capstone': 'ieee 0.1 --bits 64',
};

for (const [id, cheat] of Object.entries(CHEATS)) {
  test(`hardcoded answer fails hidden cases: ${id}`, () => {
    const level = levelById(id);
    const results = verifyAll(level, cheat);
    assert.ok(results.some((r) => r.visible && r.pass), `${id}: cheat should pass the visible case it targets`);
    assert.ok(results.some((r) => !r.pass), `${id}: cheat must fail at least one (hidden) case`);
  });
}
