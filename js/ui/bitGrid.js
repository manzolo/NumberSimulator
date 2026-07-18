// The signature canvas: a strip of bit cells that light up one at a time as the
// engine places them, with a weights row for plain integer ops, coloured field
// bands for IEEE-754 / fixed-point, carry markers for addition, and a digit
// strip for base conversions. Driven entirely from engine events (see
// executor.js) — each cell is a pure function of the value placed in it, so
// pausing/stepping always lands on a consistent frame. Modelled on
// EDU-CRYPTO's byteGrid (update + cursor + pulse-reflow).

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function createBitGrid(container) {
  container.innerHTML = `
    <div class="bg">
      <div class="bg-inputs"></div>
      <div class="bg-strip bg-weights" hidden></div>
      <div class="bg-carries" hidden></div>
      <div class="bg-strip bg-out"></div>
      <div class="bg-digits" hidden></div>
    </div>`;
  const inputsEl = container.querySelector('.bg-inputs');
  const weightsEl = container.querySelector('.bg-weights');
  const carriesEl = container.querySelector('.bg-carries');
  const outEl = container.querySelector('.bg-out');
  const digitsEl = container.querySelector('.bg-digits');

  let cells = [];
  let width = 0;
  let op = null;

  function clear() {
    inputsEl.innerHTML = '';
    weightsEl.innerHTML = ''; weightsEl.hidden = true;
    carriesEl.innerHTML = ''; carriesEl.hidden = true;
    outEl.innerHTML = '';
    digitsEl.innerHTML = ''; digitsEl.hidden = true;
    cells = []; width = 0; op = null;
  }

  // evt: { type:'input', op, width, base?, show:[{label,text}] }
  function setup(evt) {
    clear();
    op = evt.op;
    width = evt.width ?? 0;

    for (const s of evt.show ?? []) {
      const row = document.createElement('div');
      row.className = 'bg-in-row';
      row.innerHTML = `<span class="bg-in-label">${esc(s.label)}</span><span class="bg-in-val">${esc(s.text)}</span>`;
      inputsEl.appendChild(row);
    }

    if (width > 0) {
      // weights + carry lane only for narrow integer ops, where they fit on
      // one line and are the whole point; IEEE/fixed use coloured fields, and
      // 32/64-bit patterns are too wide for a legible weights row.
      const showWeights = !['ieee', 'fixed'].includes(op) && width <= 16;
      if (showWeights) {
        weightsEl.hidden = false;
        carriesEl.hidden = false;
        for (let i = 0; i < width; i++) {
          const w = document.createElement('span');
          w.className = 'bg-weight';
          w.textContent = weightLabel(width - 1 - i);
          weightsEl.appendChild(w);
          const c = document.createElement('span');
          c.className = 'bg-carry';
          carriesEl.appendChild(c);
        }
      }
      for (let i = 0; i < width; i++) {
        const cell = document.createElement('span');
        cell.className = 'bg-cell';
        cell.textContent = '·';
        outEl.appendChild(cell);
        cells.push(cell);
      }
    } else {
      // base conversion: digits appear in the digit strip
      digitsEl.hidden = false;
    }
  }

  function weightLabel(power) {
    const v = 2 ** power;
    return v >= 1024 ? `2^${power}` : String(v);
  }

  function setBit(pos, value) {
    const c = cells[pos];
    if (!c) return;
    c.textContent = String(value);
    c.classList.toggle('one', value === 1);
    c.classList.remove('pulse');
    void c.offsetWidth; // restart the CSS pulse
    c.classList.add('pulse');
    cursor(pos);
  }

  function cursor(pos) {
    cells.forEach((c) => c.classList.remove('cursor'));
    cells[pos]?.classList.add('cursor');
  }

  function carry(pos) {
    const marks = carriesEl.children;
    const m = marks[pos];
    if (!m) return;
    m.textContent = '1';
    m.classList.remove('show');
    void m.offsetWidth;
    m.classList.add('show');
  }

  const FIELD_CLASS = { sign: 'f-sign', exp: 'f-exp', mant: 'f-mant', int: 'f-int', frac: 'f-frac' };

  function field(name, from, to) {
    const cls = FIELD_CLASS[name];
    if (!cls) return;
    for (let i = from; i <= to && i < cells.length; i++) cells[i].classList.add(cls);
  }

  function setDigit(pos, char) {
    let d = digitsEl.children[pos];
    if (!d) {
      d = document.createElement('span');
      d.className = 'bg-digit';
      digitsEl.appendChild(d);
    }
    d.textContent = String(char).toUpperCase();
    d.classList.remove('pulse');
    void d.offsetWidth;
    d.classList.add('pulse');
  }

  clear();

  return {
    clear,
    onEvent(evt) {
      switch (evt.type) {
        case 'input': setup(evt); break;
        case 'bit': setBit(evt.pos, evt.value); break;
        case 'carry': carry(evt.pos); break;
        case 'field': field(evt.name, evt.from, evt.to); break;
        case 'digit': setDigit(evt.pos, evt.char); break;
        default: break;
      }
    },
    // rebuild the final frame from the answer (turbo path, where per-event
    // animation was skipped and setup() may never have run)
    finalize(answer) {
      if (!answer) return;
      if (Array.isArray(answer.bits)) {
        if (cells.length !== answer.bits.length) {
          outEl.innerHTML = '';
          cells = [];
          for (let i = 0; i < answer.bits.length; i++) {
            const cell = document.createElement('span');
            cell.className = 'bg-cell';
            outEl.appendChild(cell);
            cells.push(cell);
          }
          width = answer.bits.length;
        }
        answer.bits.forEach((b, i) => {
          cells[i].textContent = String(b);
          cells[i].classList.toggle('one', b === 1);
        });
        if (answer.kind === 'ieee') {
          const expBits = width === 32 ? 8 : 11;
          field('sign', 0, 0); field('exp', 1, expBits); field('mant', 1 + expBits, width - 1);
        } else if (answer.kind === 'fixed') {
          field('int', 0, answer.intBits - 1); field('frac', answer.intBits, width - 1);
        }
      } else if (answer.text) {
        digitsEl.hidden = false;
        digitsEl.innerHTML = [...String(answer.text).toUpperCase()].map((ch) => `<span class="bg-digit">${esc(ch)}</span>`).join('');
      }
      cells.forEach((c) => c.classList.remove('cursor'));
    },
  };
}
