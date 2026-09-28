import { getState, saveState } from './state.js';
import { GAME_DATA } from './data.js';
import { formatStar } from './ui.js';

let grillSlots = []; // Danh sách ô nướng: null | { elapsed, progress, stage }
let tray = []; // Khay chứa sườn chín: { quality, progress }
let isLoopRunning = false;
let animationFrameId = null;
let lastTime = 0;
let toastTimeout = null;

// Lấy số ô nướng theo nâng cấp (4 -> 6 -> 8)
export function getGrillSlotCount() {
  const state = getState();
  const upgradeLevel = Number(state.upgrades?.grillLarge) || 0;
  return GAME_DATA.grill.slots + upgradeLevel * 2;
}

// Lấy thời gian chín và cháy (áp dụng Quạt than nhanh hơn 20%)
export function getGrillTiming() {
  const state = getState();
  const multiplier = state.upgrades?.fanCoal ? 0.8 : 1.0;
  return {
    cookDuration: GAME_DATA.grill.cookDuration * multiplier,
    burnDuration: GAME_DATA.grill.burnDuration * multiplier,
  };
}

// Phân loại giai đoạn theo % tiến độ: sống / chín vàng / hơi cháy / cháy đen
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

export function showServiceToast(message) {
  const toastEl = document.getElementById('service-toast');
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastEl.classList.add('hidden'), 1800);
}

export function updateServiceHUD() {
  const state = getState();
  const dayEl = document.getElementById('service-hud-day');
  const porkEl = document.getElementById('service-hud-pork');
  const starEl = document.getElementById('service-hud-star');
  if (dayEl) dayEl.textContent = `Ngày ${state.day || 1}`;
  if (porkEl) porkEl.textContent = `Kho: ${state.inventory?.suon || 0} 🍖`;
  if (starEl) starEl.textContent = formatStar(state.star || 4.0);
}

export function renderTray() {
  const countEl = document.getElementById('tray-count');
  const itemsEl = document.getElementById('tray-items');
  if (countEl) countEl.textContent = tray.length;
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

function renderGrillSlot(index) {
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

export function handleSlotClick(index) {
  const slot = grillSlots[index];
  const state = getState();

  if (!slot) {
    const currentPork = Number(state.inventory?.suon) || 0;
    if (currentPork <= 0) {
      showServiceToast('Hết sườn trong kho rồi!');
      shakeSlot(index);
      return;
    }
    state.inventory.suon = currentPork - 1;
    saveState(state);
    updateServiceHUD();
    grillSlots[index] = { elapsed: 0, progress: 0, stage: 'raw' };
    renderGrillSlot(index);
    return;
  }

  if (slot.stage === 'raw') {
    shakeSlot(index);
    showServiceToast('Chưa chín!');
    return;
  }

  if (slot.stage === 'good' || slot.stage === 'slightBurn') {
    const quality = slot.stage;
    tray.push({ quality, progress: Math.round(slot.progress) });
    grillSlots[index] = null;
    renderGrillSlot(index);
    renderTray();
    showServiceToast(quality === 'good' ? 'Đã gắp sườn chín vàng! 🍖' : 'Đã gắp sườn hơi cháy! 🍖');
  }
}

function updateGrill(dt) {
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
      showServiceToast('Trời ơi sườn cháy rồi! 💨');
    } else {
      slot.stage = newStage;
      renderGrillSlot(index);
    }
  });
}

function gameLoop(now) {
  if (!isLoopRunning) return;
  if (!lastTime) lastTime = now;
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;
  updateGrill(dt);
  animationFrameId = requestAnimationFrame(gameLoop);
}

export function startServiceLoop() {
  if (isLoopRunning) return;
  isLoopRunning = true;
  lastTime = performance.now();
  animationFrameId = requestAnimationFrame(gameLoop);
}

export function stopServiceLoop() {
  isLoopRunning = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  lastTime = 0;
}

function initGrillDOM(totalSlots) {
  const gridEl = document.getElementById('grill-grid');
  if (!gridEl) return;
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
}

export function startService() {
  const totalSlots = getGrillSlotCount();
  if (grillSlots.length !== totalSlots) {
    grillSlots = Array(totalSlots).fill(null);
  }
  updateServiceHUD();
  initGrillDOM(totalSlots);
  renderTray();
  startServiceLoop();
}

export function initServiceScreen() {
  const gridEl = document.getElementById('grill-grid');
  gridEl?.addEventListener('click', (e) => {
    const slotEl = e.target.closest('.grill-slot');
    if (!slotEl) return;
    const index = Number(slotEl.dataset.index);
    if (!Number.isNaN(index)) handleSlotClick(index);
  });

  // Tạm dừng khi ẩn tab
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopServiceLoop();
    } else {
      const screenService = document.getElementById('screen-service');
      if (screenService?.classList.contains('active')) {
        startServiceLoop();
      }
    }
  });
}

export function getServiceState() {
  return { grillSlots, tray, isLoopRunning };
}

