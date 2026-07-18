// Case builder shared by the levels. Each dataset is a set of named inputs the
// user's command references (x, a, b, d, n, c…); the level marks a few visible
// and keeps the rest HIDDEN and differently populated — so a command hardwired
// to the visible values fails the hidden ones (anti-cheat). Expected answers
// are computed by running the reference `solution` through the SAME engine on
// each dataset, so they always match engine semantics.

import { runHeadless } from '../core/engine.js';

// d({x: 42}, true) → visible dataset; d({x: 200}) → hidden.
export function d(vars, visible = false) {
  return { vars, visible };
}

export function cases({ solution, datasets }) {
  return datasets.map((ds) => {
    const r = runHeadless({ source: solution, vars: ds.vars });
    if (r.errors || r.error) {
      throw new Error(`reference solution failed on ${JSON.stringify(ds.vars)}: ${JSON.stringify(r.errors ?? r.error)}`);
    }
    return { vars: ds.vars, expected: r.result.answer, visible: !!ds.visible };
  });
}
