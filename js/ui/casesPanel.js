// The level's visible cases. Each case re-rolls the weight init (and, where
// the level says so, the dataset itself); after a verification each row shows
// a live ✓/✗. Clicking a case makes the animated run use ITS setup. The
// HIDDEN cases — more numerous, seeded differently — are never shown: that is
// the anti-cheat.

import { t } from '../i18n.js';

export function createCasesPanel(container, { onPick } = {}) {
  let cases = [];
  let selected = 0;
  let verdicts = new Map(); // index → bool
  let hiddenCount = 0;

  function render() {
    if (!cases.length) { container.innerHTML = ''; return; }
    const rows = cases.map((c, i) => {
      const v = verdicts.has(i) ? (verdicts.get(i) ? 'ok' : 'bad') : '';
      const mark = v === 'ok' ? '✓' : v === 'bad' ? '✗' : '';
      return `<button class="case-row ${v}${i === selected ? ' sel' : ''}" data-i="${i}">
        <span class="case-desc">${t('caseLabel')} ${String.fromCharCode(65 + i)}</span>
        <span class="case-mark">${mark}</span>
      </button>`;
    }).join('');
    container.innerHTML = `<div class="cases">${rows}</div>
      <div class="cases-note">${t('casesNote', hiddenCount)}</div>`;
    container.querySelectorAll('.case-row').forEach((el) => {
      el.addEventListener('click', () => {
        selected = +el.dataset.i;
        render();
        onPick?.(selected);
      });
    });
  }

  return {
    showCases(visible, hidden) {
      cases = visible; hiddenCount = hidden; selected = 0; verdicts = new Map();
      render();
    },
    setVerdicts(map) { verdicts = map; render(); },
    clear() { cases = []; verdicts = new Map(); render(); },
    refresh: render,
  };
}
