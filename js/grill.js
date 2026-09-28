import { getState, saveState } from './state.js';
import { GAME_DATA } from './data.js';

let grillSlots = []; // Danh sách ô nướng: null | { elapsed, progress, stage }
let tray = []; // Khay chứa sườn chín: { quality, progress }

export function getGrillSlotCount() {
  const state = getState();
  const upgradeLevel = Number(state.upgrades?.grillLarge) || 0;
  return GAME_DATA.grill.slots + upgradeLevel * 2;
}

export function getGrillTiming() {
  const state = getState();
  const multiplier = state.upgrades?.fanCoal ? 0.8 : 1.0;
  return {
    cookDuration: GAME_DATA.grill.cookDuration * multiplier,
    burnDuration: GAME_DATA.grill.burnDuration * multiplier,
  };
}

export function getStage(progress) {
  if (progress <= 59) return 'raw';
  if (progress <= 90) return 'good';
  if (progress <= 100) return 'slightBurn';
  return 'burnt';
}

function getStageColor(stage) {
  if (stage === 'raw') return '#ef5350';
  if (stage === 'good') return '#f59e0b';
  if (stage === 'slightBurn') return '#b45309';
  return '#1f2937';
}

export function getTray() {
  return tray;
}

export function popTrayRib() {
  if (tray.length === 0) return null;
  const rib = tray.shift();
  renderTrayDOM();
  return rib;
}

export function renderTrayDOM() {
  const countEl = document.getElementById('tray-count');
  const btnCountEl = document.getElementById('tray-btn-count');
  const itemsEl = document.getElementById('tray-items');

  if (countEl) countEl.textContent = tray.length;
  if (btnCountEl) btnCountEl.textContent = tray.length;
  if (!itemsEl) return;

  if (tray.length === 0) {
    itemsEl.innerHTML = '<span class="tray-empty">Chưa có sườn chín trong khay</span>';
  } else {
    const good = tray.filter((t) => t.quality === 'good').length;
    const burn = tray.filter((t) => t.quality === 'slightBurn').length;
    let html = '';
    if (good > 0) html += `<span class="tray-badge good">🍖 ${good} chín vàng</span>`;
    if (burn > 0) html += `<span class="tray-badge slight-burn">🍖 ${burn} hơi cháy</span>`;
    itemsEl.innerHTML = html;
  }
}

export function renderGrillSlot(index) {
  const slotEl = document.querySelector(`.grill-slot[data-index="${index}"]`);
  if (!slotEl) return;

  const slot = grillSlots[index];
  const ringEl = slotEl.querySelector('.slot-ring');
  const iconEl = slotEl.querySelector('.slot-icon');
  const labelEl = slotEl.querySelector('.slot-label');
  const smokeEl = slotEl.querySelector('.smoke-fx');

  if (!slot) {
    slotEl.className = 'grill-slot empty';
    if (ringEl) ringEl.style.background = 'transparent';
    if (iconEl) iconEl.textContent = '➕';
    if (labelEl) labelEl.textContent = 'Đặt sườn';
    if (smokeEl) smokeEl.classList.add('hidden');
    return;
  }

  const color = getStageColor(slot.stage);
  const pct = Math.min(100, Math.round(slot.progress));
  slotEl.className = `grill-slot cooking ${slot.stage}`;
  if (ringEl) ringEl.style.background = `conic-gradient(${color} ${pct}%, #3a281e 0%)`;
  if (iconEl) iconEl.textContent = '🍖';
  if (labelEl) {
    if (slot.stage === 'raw') labelEl.textContent = `Sống ${pct}%`;
    else if (slot.stage === 'good') labelEl.textContent = 'Chín vàng ✨';
    else if (slot.stage === 'slightBurn') labelEl.textContent = 'Hơi cháy 🔥';
  }
  if (smokeEl) smokeEl.classList.toggle('hidden', slot.stage !== 'slightBurn');
}

function shakeSlot(index) {
  const slotEl = document.querySelector(`.grill-slot[data-index="${index}"]`);
  if (!slotEl) return;
  if (navigator.vibrate) {
    try { navigator.vibrate(50); } catch (_) {}
  }
  slotEl.classList.remove('shake');
  void slotEl.offsetWidth;
  slotEl.classList.add('shake');
  setTimeout(() => slotEl.classList.remove('shake'), 400);
}

export function handleGrillClick(index, callbacks = {}) {
  const slot = grillSlots[index];
  const state = getState();

  if (!slot) {
    const currentPork = Number(state.inventory?.suon) || 0;
    if (currentPork <= 0) {
      callbacks.onToast?.('Hết sườn trong kho rồi!');
      shakeSlot(index);
      return;
    }
    state.inventory.suon = currentPork - 1;
    saveState(state);
    callbacks.onHUDUpdate?.();
    grillSlots[index] = { elapsed: 0, progress: 0, stage: 'raw' };
    renderGrillSlot(index);
    return;
  }

  if (slot.stage === 'raw') {
    shakeSlot(index);
    callbacks.onToast?.('Chưa chín!');
    return;
  }

  if (slot.stage === 'good' || slot.stage === 'slightBurn') {
    const quality = slot.stage;
    tray.push({ quality, progress: Math.round(slot.progress) });
    grillSlots[index] = null;
    renderGrillSlot(index);
    renderTrayDOM();
    callbacks.onToast?.(quality === 'good' ? 'Đã gắp sườn chín vàng! 🍖' : 'Đã gắp sườn hơi cháy! 🍖');
  }
}

export function updateGrill(dt, onToast) {
  const { cookDuration, burnDuration } = getGrillTiming();

  grillSlots.forEach((slot, index) => {
    if (!slot) return;
    slot.elapsed += dt;

    if (slot.elapsed <= cookDuration) {
      slot.progress = (slot.elapsed / cookDuration) * 90;
    } else if (slot.elapsed <= burnDuration) {
      const burnProgress = (slot.elapsed - cookDuration) / (burnDuration - cookDuration);
      slot.progress = 90 + burnProgress * 10;
    } else {
      slot.progress = 101;
    }

    const newStage = getStage(slot.progress);
    if (newStage === 'burnt') {
      grillSlots[index] = null;
      renderGrillSlot(index);
      onToast?.('Trời ơi sườn cháy rồi! 💨 (Miếng sườn phế)');
    } else {
      slot.stage = newStage;
      renderGrillSlot(index);
    }
  });
}

export function initGrill(totalSlots) {
  const gridEl = document.getElementById('grill-grid');
  if (!gridEl) return;

  if (grillSlots.length !== totalSlots) {
    grillSlots = Array(totalSlots).fill(null);
  }

  gridEl.innerHTML = '';
  gridEl.style.gridTemplateColumns = totalSlots > 4 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)';

  for (let i = 0; i < totalSlots; i++) {
    const slotDiv = document.createElement('div');
    slotDiv.className = 'grill-slot empty';
    slotDiv.dataset.index = String(i);
    slotDiv.setAttribute('role', 'button');
    slotDiv.setAttribute('aria-label', `Ô nướng ${i + 1}`);
    slotDiv.innerHTML = `
      <div class="slot-ring">
        <div class="slot-inner">
          <div class="slot-icon">➕</div>
          <div class="slot-label">Đặt sườn</div>
        </div>
      </div>
      <div class="smoke-fx hidden" aria-hidden="true">💨</div>
    `;
    gridEl.appendChild(slotDiv);
    renderGrillSlot(i);
  }
  renderTrayDOM();
}

export function resetGrill() {
  grillSlots = [];
  tray = [];
}

export function getGrillSlots() {
  return grillSlots;
}
