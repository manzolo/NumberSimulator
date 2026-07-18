// Verification: run the user's command through the SAME engine on every case
// of the level (visible AND hidden) and compare its canonical answer to the
// expected one. allowed[] is enforced in engine.buildRun, so a forbidden
// command fails here exactly as it does in the app.

import { runHeadless } from '../core/engine.js';

export function answersEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// → { pass, errors?, error?, outcome?, result? }
export function verifyCase(level, source, kase) {
  const r = runHeadless({
    source,
    vars: kase.vars,
    allowed: level.allowed ?? null,
    budget: level.budget ?? 20000,
  });
  if (r.errors) return { pass: false, errors: r.errors };
  if (r.error) return { pass: false, error: r.error };
  if (r.result.outcome !== 'done') return { pass: false, outcome: r.result.outcome };
  return { pass: answersEqual(r.result.answer, kase.expected), result: r.result };
}

// → [{ visible, pass, ... }] in makeCases() order.
export function verifyAll(level, source) {
  return level.makeCases().map((kase) => ({
    visible: !!kase.visible,
    ...verifyCase(level, source, kase),
  }));
}
