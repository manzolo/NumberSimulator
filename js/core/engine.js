// Facade: the single entry point shared by the UI (buildRun) and the headless
// verifier / tests (runHeadless). parse → allowed[] whitelist → resolve inputs
// → executor → wrap in NumSim. Mirrors the sibling EDU-* engine.js files.
//
// The `allowed` filter lives HERE (unlike EDU-CRYPTO, where it is display-only)
// so the app and the tests reject a forbidden command identically — that is
// one of the anti-cheat levers.

import { parse } from './parser.js';
import { NumExecutor } from './executor.js';
import { NumSim, runToCompletion } from './sim.js';

export function buildRun({ source, vars = {}, allowed = null, budget = 20000 } = {}) {
  const parsed = parse(source);
  if (parsed.errors) return { errors: parsed.errors };

  const cmd = parsed.command;
  if (allowed && !allowed.includes(cmd.key)) {
    return { errors: [{ code: 'errNotAllowed', args: [cmd.key] }] };
  }

  const executor = new NumExecutor(cmd, vars);
  if (executor.buildError) return { errors: [executor.buildError] };

  const sim = new NumSim(executor, { budget });
  return { sim, executor, command: cmd };
}

// One-shot execution with no animation — used by verifySolution and the tests.
export function runHeadless(opts) {
  const built = buildRun(opts);
  if (built.errors) return { errors: built.errors };
  const { state, error } = runToCompletion(built.sim);
  return { state, error, result: built.executor.result, command: built.command };
}
