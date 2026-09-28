import { getState, saveState, recordRating, setLastSummary } from './state.js';
import { GAME_DATA, ASSETS } from './data.js';
import { formatMoney, formatStar } from './ui.js';
import { scoreOrder } from './scoring.js';
import {
  initGrill,
  updateGrill,
  handleGrillClick,
  getGrillSlotCount,
  popTrayRib,
  getTray,
} from './grill.js';

let isLoopRunning = false;
let animationFrameId = null;
let lastTime = 0;
let toastTimeout = null;
let remainingTime = 120;
let totalCustomers = 10;
let spawnedCount = 0;
let spawnTimer = 1.0;
let customers = [];
let selectedCustomerId = null;
let currentPlate = [];
let dayStats = null;
let assistantTimer = 0; // Chị Hai

export function showServiceToast(message) {
  const toastEl = document.getElementById('service-toast');
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastEl.classList.add('hidden'), 2000);
}

function updateHUD() {
  const state = getState();
  const dayEl = document.getElementById('service-hud-day');
  const moneyEl = document.getElementById('service-hud-money');
  const timerEl = document.getElementById('service-hud-timer');
  const starEl = document.getElementById('service-hud-star');
  if (dayEl) dayEl.textContent = `Ngày ${state.day || 1}`;
  if (moneyEl) moneyEl.textContent = formatMoney(state.money);
  if (timerEl) timerEl.textContent = `${Math.max(0, Math.ceil(remainingTime))}s`;
  if (starEl) starEl.textContent = formatStar(state.star || 4.0);
}

function spawnCustomer() {
  const state = getState();
  const unlocked = GAME_DATA.customers.types.filter((t) => t.unlockDay <= (state.day || 1));
  const type = unlocked[Math.floor(Math.random() * unlocked.length)];
  const availableExtras = ['suon', 'bi', 'trung', 'tra'];
  if (state.upgrades?.unlockMenu) availableExtras.push('cha', 'canh');

  const extraCount = Math.floor(Math.random() * (type.extraMax - type.extraMin + 1)) + type.extraMin;
  const shuffled = [...availableExtras].sort(() => 0.5 - Math.random());
  const order = ['com', ...shuffled.slice(0, extraCount)];
  const maxPatience = type.patience * (1 + (state.upgrades?.fanMotor ? 0.15 : 0));

  const customer = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    order,
    maxPatience,
    patience: maxPatience,
  };
  customers.push(customer);
  if (!selectedCustomerId) selectedCustomerId = customer.id;
  renderCustomers();
}

function renderCustomers() {
  const rowEl = document.getElementById('customer-row');
  if (!rowEl) return;
  if (customers.length === 0) {
    rowEl.innerHTML = '<span class="queue-empty">Chưa có khách nào đang đợi...</span>';
    return;
  }
  rowEl.innerHTML = customers.map((c) => {
    const isSelected = c.id === selectedCustomerId;
    const pct = Math.max(0, (c.patience / c.maxPatience) * 100);
    const colorClass = pct > 50 ? 'high' : pct > 20 ? 'med' : 'low';
    const orderIcons = c.order.map((id) => `<span>${ASSETS[id] || '🍚'}</span>`).join('');
    return `
      <div class="customer-card ${isSelected ? 'selected' : ''}" data-id="${c.id}" role="button">
        <div class="order-bubble">${orderIcons}</div>
        <div class="customer-avatar">${c.type.icon}</div>
        <div class="customer-name">${c.type.label}</div>
        <div class="patience-track"><div class="patience-fill ${colorClass}" style="width: ${pct}%"></div></div>
      </div>
    `;
  }).join('');
}

function renderPlate() {
  const itemsEl = document.getElementById('plate-items');
  if (!itemsEl) return;
  if (currentPlate.length === 0) {
    itemsEl.innerHTML = '<span class="plate-empty">Đĩa trống</span>';
  } else {
    itemsEl.innerHTML = currentPlate.map((item) => {
      const icon = ASSETS[item.id] || '🍚';
      const tag = item.quality === 'slightBurn' ? '<small>🔥</small>' : '';
      return `<span class="plate-chip">${icon}${tag}</span>`;
    }).join('');
  }
}

function addIngredientToPlate(itemId) {
  const state = getState();
  if (itemId === 'suon') {
    const rib = popTrayRib();
    if (!rib) {
      showServiceToast('Chưa có sườn chín trong khay! Hãy nướng sườn.');
      return;
    }
    currentPlate.push({ id: 'suon', quality: rib.quality });
    renderPlate();
    return;
  }
  const stock = Number(state.inventory?.[itemId]) || 0;
  if (stock <= 0) {
    showServiceToast(`Hết ${GAME_DATA.menu[itemId]?.name || 'món'} trong kho!`);
    return;
  }
  state.inventory[itemId] = stock - 1;
  saveState(state);
  currentPlate.push({ id: itemId });
  renderPlate();
}

function trashPlate() {
  if (currentPlate.length === 0) return;
  currentPlate = [];
  renderPlate();
  showServiceToast('Đã đổ đĩa làm lại! (Mất nguyên liệu)');
}

function deliverPlate() {
  if (customers.length === 0) {
    showServiceToast('Chưa có khách nào!');
    return;
  }
  const customer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  if (!customer) return;

  const result = scoreOrder(customer, currentPlate);
  const state = getState();
  state.money += result.totalEarned;
  recordRating(result.stars);

  dayStats.servedCount++;
  dayStats.revenue += result.baseEarned;
  dayStats.tips += result.tipEarned;

  customers = customers.filter((c) => c.id !== customer.id);
  selectedCustomerId = customers[0]?.id || null;
  currentPlate = [];

  renderPlate();
  renderCustomers();
  updateHUD();
  showServiceToast(`+${formatMoney(result.totalEarned)} (${result.stars}⭐) - ${customer.type.label}!`);
}

function updateCustomers(dt) {
  const state = getState();
  const bonusSignage = state.upgrades?.ledSign ? 0.15 : 0;
  const gap = GAME_DATA.customers.gapSeconds(state.day || 1, state.star || 4.0, bonusSignage);

  if (spawnedCount < totalCustomers) {
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      if (customers.length < 4) {
        spawnCustomer();
        spawnedCount++;
        spawnTimer = gap;
      } else {
        spawnTimer = 0.5;
      }
    }
  }

  let queueChanged = false;
  customers = customers.filter((c) => {
    c.patience -= dt;
    if (c.patience <= 0) {
      recordRating(1);
      dayStats.leaveCount++;
      queueChanged = true;
      showServiceToast(`Khách ${c.type.label} hết kiên nhẫn bỏ đi! (-1⭐)`);
      return false;
    }
    return true;
  });

  if (queueChanged || customers.length > 0) {
    if (!customers.find((c) => c.id === selectedCustomerId)) {
      selectedCustomerId = customers[0]?.id || null;
    }
    renderCustomers();
  }
}

/** Chị Hai phụ bếp: mỗi 10s tự thêm 1 món (cơm/bì/trứng) vào đĩa đang chọn */
function updateAssistant(dt) {
  const state = getState();
  if (!state.upgrades?.assistant) return;
  if (!selectedCustomerId || customers.length === 0) return;

  assistantTimer += dt;
  if (assistantTimer < 10) return;
  assistantTimer = 0;

  const helpItems = ['com', 'bi', 'trung'].filter((id) => {
    const stock = Number(state.inventory?.[id]) || 0;
    const alreadyOnPlate = currentPlate.some((p) => p.id === id);
    return stock > 0 && !alreadyOnPlate;
  });

  if (helpItems.length === 0) return;

  const pick = helpItems[Math.floor(Math.random() * helpItems.length)];
  addIngredientToPlate(pick);
  showServiceToast(`Chị Hai phụ: thêm ${GAME_DATA.menu[pick]?.name || pick}! 👩‍🍳`);
}

function gameLoop(now) {
  if (!isLoopRunning) return;
  if (!lastTime) lastTime = now;
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  remainingTime -= dt;
  updateHUD();
  updateGrill(dt, showServiceToast);
  updateCustomers(dt);
  updateAssistant(dt);

  if (remainingTime <= 0) {
    finishDay();
    return;
  }
  animationFrameId = requestAnimationFrame(gameLoop);
}

function finishDay() {
  stopServiceLoop();
  const state = getState();
  dayStats.endStar = state.star;
  setLastSummary(dayStats);
  showServiceToast('Hết giờ bán hàng! Chuyển sang Tổng kết.');
  setTimeout(() => window.__game?.showScreen('summary'), 600);
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

export function startService() {
  const state = getState();
  remainingTime = GAME_DATA.timing.dayLength || 120;

  // Bảng hiệu đèn led: khách nhiều hơn ~15%
  let baseCount = GAME_DATA.customers.dayCount(state.day || 1);
  if (state.upgrades?.ledSign) {
    baseCount = Math.min(30, Math.round(baseCount * 1.15));
  }
  totalCustomers = baseCount;

  spawnedCount = 0;
  spawnTimer = 1.0;
  customers = [];
  selectedCustomerId = null;
  currentPlate = [];
  assistantTimer = 0;

  dayStats = {
    day: state.day || 1,
    servedCount: 0,
    leaveCount: 0,
    revenue: 0,
    tips: 0,
    startStar: state.star || 4.0,
    endStar: state.star || 4.0,
  };

  const hasUnlock = Boolean(state.upgrades?.unlockMenu);
  document.getElementById('btn-ing-cha')?.classList.toggle('hidden', !hasUnlock);
  document.getElementById('btn-ing-canh')?.classList.toggle('hidden', !hasUnlock);

  updateHUD();
  initGrill(getGrillSlotCount());
  renderPlate();
  renderCustomers();
  startServiceLoop();
}

export function initServiceScreen() {
  document.getElementById('customer-row')?.addEventListener('click', (e) => {
    const card = e.target.closest('.customer-card');
    if (!card) return;
    selectedCustomerId = card.dataset.id;
    renderCustomers();
  });

  document.getElementById('grill-grid')?.addEventListener('click', (e) => {
    const slotEl = e.target.closest('.grill-slot');
    if (!slotEl) return;
    const index = Number(slotEl.dataset.index);
    if (!Number.isNaN(index)) {
      handleGrillClick(index, { onToast: showServiceToast, onHUDUpdate: updateHUD });
    }
  });

  document.getElementById('ing-buttons')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-ing]');
    if (btn) addIngredientToPlate(btn.dataset.ing);
  });

  document.getElementById('btn-trash-plate')?.addEventListener('click', trashPlate);
  document.getElementById('btn-deliver-plate')?.addEventListener('click', deliverPlate);
  document.getElementById('btn-service-summary')?.addEventListener('click', finishDay);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopServiceLoop();
    else if (document.getElementById('screen-service')?.classList.contains('active')) {
      startServiceLoop();
    }
  });
}

export function getServiceState() {
  return { customers, currentPlate, remainingTime, dayStats, isLoopRunning, tray: getTray() };
}