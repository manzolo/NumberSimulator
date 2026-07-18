// Scrolling narration tape. Rows are built from the engine's language-neutral
// events (mostly `note` steps carrying an i18n code + args) and localized at
// render time — the running story of the algorithm: each division, each column
// added, each byte encoded.

import { t } from '../i18n.js';

const MAX_ROWS = 400;

export function createEventLog(container) {
  container.innerHTML = '<div class="evt-tape"></div>';
  const tape = container.querySelector('.evt-tape');
  let empty = true;

  function describe(evt) {
    switch (evt.type) {
      case 'input': return { cls: 'evt-phase', text: t('evtInput', evt.op) };
      case 'note': return { cls: '', text: t(evt.code, ...(evt.args ?? [])) };
      case 'field': return { cls: 'evt-phase', text: t('evtField', evt.name) };
      case 'done': return { cls: 'evt-result', text: `= ${evt.text}` };
      case 'budget': return { cls: 'evt-drop', text: t('evtBudget', evt.budget) };
      default: return null;
    }
  }

  function rowFor(evt) {
    const d = describe(evt);
    if (!d) return null;
    const row = document.createElement('div');
    row.className = `evt-row ${d.cls}`;
    row.innerHTML = `<span class="evt-time">${evt.time}</span><span>${d.text}</span>`;
    return row;
  }

  function append(evt) {
    const row = rowFor(evt);
    if (!row) return;
    if (empty) { tape.innerHTML = ''; empty = false; }
    const pinned = tape.scrollTop + tape.clientHeight >= tape.scrollHeight - 24;
    tape.appendChild(row);
    while (tape.childElementCount > MAX_ROWS) tape.firstElementChild.remove();
    if (pinned) tape.scrollTop = tape.scrollHeight;
  }

  function setAll(trace) {
    clear();
    for (const evt of trace) {
      const row = rowFor(evt);
      if (!row) continue;
      if (empty) { tape.innerHTML = ''; empty = false; }
      tape.appendChild(row);
      while (tape.childElementCount > MAX_ROWS) tape.firstElementChild.remove();
    }
    tape.scrollTop = tape.scrollHeight;
  }

  function clear() {
    tape.innerHTML = `<div class="tbl-empty">${t('evtEmpty')}</div>`;
    empty = true;
  }

  clear();
  return { append, setAll, clear };
}
