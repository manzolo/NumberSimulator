// Script editor: a plain textarea with a synced line-number gutter and an
// error-line bar positioned by line-height math (same design as EDU-NET's
// editor). No contenteditable, no dependencies.

export function createEditor(container, { onChange, onRun } = {}) {
  container.innerHTML = `
    <div class="editor-wrap">
      <div class="gutter"><div class="gutter-inner"></div></div>
      <div class="editor-area">
        <div class="hl-bar hl-error" hidden></div>
        <textarea class="code" spellcheck="false" wrap="off"
          autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>
      </div>
    </div>
    <div class="editor-msg" hidden></div>`;

  const ta = container.querySelector('.code');
  const gutterInner = container.querySelector('.gutter-inner');
  const barError = container.querySelector('.hl-error');
  const msgEl = container.querySelector('.editor-msg');

  let errorLine = null;
  let lineHeight = 0;
  let padTop = 0;

  function measure() {
    const cs = getComputedStyle(ta);
    lineHeight = parseFloat(cs.lineHeight);
    padTop = parseFloat(cs.paddingTop);
  }

  function renderGutter() {
    const n = ta.value.split('\n').length;
    if (gutterInner.childElementCount !== n) {
      gutterInner.innerHTML = Array.from({ length: n }, (_, i) => `<div>${i + 1}</div>`).join('');
    }
    markGutter();
  }

  function markGutter() {
    [...gutterInner.children].forEach((el, i) => {
      el.className = (i + 1 === errorLine) ? 'g-err' : '';
    });
  }

  function positionBar() {
    if (errorLine === null) { barError.hidden = true; return; }
    const top = padTop + (errorLine - 1) * lineHeight - ta.scrollTop;
    barError.hidden = top < -lineHeight || top > ta.clientHeight;
    barError.style.top = `${top}px`;
    barError.style.height = `${lineHeight}px`;
  }

  function sync() {
    gutterInner.style.transform = `translateY(${-ta.scrollTop}px)`;
    positionBar();
  }

  ta.addEventListener('scroll', sync);
  ta.addEventListener('input', () => {
    renderGutter();
    sync();
    onChange?.(ta.value);
  });
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: en } = ta;
      ta.setRangeText('  ', s, en, 'end');
      onChange?.(ta.value);
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onRun?.();
    }
  });

  measure();
  renderGutter();

  return {
    getValue: () => ta.value,
    setValue(text) {
      ta.value = text;
      renderGutter();
      sync();
    },
    // err: null, or { line, msg }
    setError(err) {
      errorLine = err?.line ?? null;
      msgEl.hidden = !err;
      msgEl.textContent = err?.msg ?? '';
      markGutter();
      sync();
    },
    focus: () => ta.focus(),
  };
}
