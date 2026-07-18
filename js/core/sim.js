// NumSim: the stepper. It plays the same protocol as the sibling EDU-* engines
// (EDU-SQL's SqlSim, EDU-NN's NNSim, EDU-CRYPTO's classic Sim) — nextTime() /
// stepOnce() → {time, events} / advanceTo(t) / finalState(), with
// `halted`/`error` flags — so the Player and the headless verifier drive it
// exactly like the other labs. It folds in the roles of a clock: monotonic
// seq, append-only trace, and an emit() that fans each event to trace +
// per-step batch + optional onEvent listener.
//
// One stepOnce() = one micro-op of the running program: one successive
// division, one bit placed, one carry propagated, one nibble grouped, one
// mantissa bit filled. Time is an integer tick counter; there is no
// randomness anywhere, so the same command on the same inputs always yields
// the same trace.
//
// Budget exhaustion is a NORMAL outcome (executor.result.outcome === 'budget'),
// not sim.error — a pathological width/precision surfaces as the tick counter
// crossing the budget line, visibly, not as a crash.

export class NumSim {
  constructor(executor, { budget = 20000 } = {}) {
    this.executor = executor;
    this.budget = budget;
    this.now = 0;
    this._seq = 0;
    this.trace = [];
    this.onEvent = null;
    this._batch = null;
    this.halted = false;
    this.error = null;
  }

  get steps() { return this.now; }

  emit(event) {
    event.time = this.now;
    event.seq = this._seq++;
    this.trace.push(event);
    if (this._batch) this._batch.push(event);
    if (this.onEvent) this.onEvent(event);
    return event;
  }

  nextTime() {
    if (this.halted || this.error) return null;
    return this.now + 1;
  }

  stepOnce() {
    if (this.halted || this.error) return null;
    this._batch = [];
    this.executor.tick((e) => this.emit(e));
    const events = this._batch;
    this._batch = null;
    this.now += 1;

    // Budget: each tick is one step. A runaway program blows past this line.
    if (this.now > this.budget && !this.executor.done) {
      this.executor.forceStop('budget');
      this.emit({ type: 'budget', budget: this.budget });
    }

    if (this.executor.error) this.error = this.executor.error;
    if (this.executor.done) this.halted = true;
    return { time: this.now, events };
  }

  advanceTo(t) {
    const all = [];
    let n = this.nextTime();
    while (n !== null && n <= t) {
      const d = this.stepOnce();
      if (!d) break;
      all.push(...d.events);
      n = this.nextTime();
    }
    return all;
  }

  finalState() {
    return {
      time: this.now,
      steps: this.now,
      halted: this.halted,
      error: this.error,
      trace: this.trace,
      result: this.executor.result ?? null,
    };
  }
}

export function runToCompletion(sim) {
  while (!sim.halted && !sim.error) {
    if (sim.stepOnce() === null) break;
  }
  return { state: sim.finalState(), error: sim.error };
}
