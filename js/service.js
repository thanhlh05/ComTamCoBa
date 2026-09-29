import { getState, saveState, recordRating, setLastSummary, backupDayBeforeService } from './state.js';
import { GAME_DATA, ASSETS } from './data.js';
import { formatMoney, formatStar } from './ui.js';
import { scoreOrder } from './scoring.js';
import { pushReview, resolveReviewReason, formatOrderShort } from './reviews.js';
import { getPriceFactor } from './pricing.js';
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
let remainingTime = 120;     // giây thật còn lại
let totalTimeSeconds = 180;  // tổng giây thật của phiên bán
let totalCustomers = 10;
let spawnedCount = 0;
let spawnTimer = 1.0;
let customers = [];
let selectedCustomerId = null;
let currentPlate = [];
let dayStats = null;
let assistantTimer = 0; // Chị Hai

// Đồng hồ giờ ảo (mục 15)
let virtualMinutes = 0;    // phút ảo hiện tại (tính từ giờ mở)
let openHour = 5;          // giờ mở (lấy từ state khi startService)
let totalGameMinutes = 0;  // (closeHour - openHour) * 60
let minsPerSecond = 0;     // số phút ảo tăng mỗi giây thật
let lastClockUpdate = 0;   // nhị bất cập nhật đồng hồ mỗi ~0.5s


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
  if (starEl) starEl.textContent = formatStar(state.star || 4.0);

  // Hiển thị đồng hồ giờ ảo (chỉ là hiển thị, không ảnh hưởng spawn/nướng)
  if (timerEl) {
    const currentGameMins = Math.floor(virtualMinutes);
    const displayHour = openHour + Math.floor(currentGameMins / 60);
    const displayMin = currentGameMins % 60;
    timerEl.textContent = `${String(displayHour).padStart(2,'0')}:${String(displayMin).padStart(2,'0')}`;
  }

  // Cập nhật thanh tiến trình
  const bar = document.getElementById('service-progress-bar');
  if (bar) {
    const pct = totalTimeSeconds > 0
      ? Math.max(0, (remainingTime / totalTimeSeconds) * 100)
      : 0;
    bar.style.width = `${pct}%`;
  }
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

  // Khách quen: từ lần phục vụ ≥4★ thứ 5 trở đi, 20% ra khách quen
  const goodCount = Number(state.typeServeGood?.[type.id]) || 0;
  const isRegular = goodCount >= 5 && Math.random() < 0.2;

  let maxPatience = type.patience * (1 + (state.upgrades?.fanMotor ? 0.15 : 0));
  if (isRegular) maxPatience *= 1.1; // +10% kiên nhẫn

  // Câu thoại
  const lines = GAME_DATA.customerLines?.[type.id] || [];
  const line = lines.length ? lines[Math.floor(Math.random() * lines.length)] : '';

  const customer = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    order,
    maxPatience,
    patience: maxPatience,
    isRegular,
    tipBonus: isRegular ? 0.05 : 0, // +5 điểm % boa
    speech: line,
    speechUntil: line ? performance.now() + 4000 : 0, // hiện ~4s
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
  const now = performance.now();
  rowEl.innerHTML = customers
    .map((c) => {
      const isSelected = c.id === selectedCustomerId;
      const pct = Math.max(0, (c.patience / c.maxPatience) * 100);
      const colorClass = pct > 50 ? 'high' : pct > 20 ? 'med' : 'low';
      // Icon đại diện: sườn nếu có, không thì cơm
      const leadId = c.order.includes('suon') ? 'suon' : 'com';
      const leadIcon = ASSETS[leadId] || '🍚';
      const orderText = formatOrderShort(c.order);
      const showSpeech = c.speech && c.speechUntil && now < c.speechUntil && !isSelected;
      const regularTag = c.isRegular
        ? `<span class="regular-tag">Khách quen</span>`
        : '';

      return `
      <div class="customer-card ${isSelected ? 'selected' : ''} ${c.isRegular ? 'regular' : ''}" data-id="${c.id}" role="button">
        ${showSpeech ? `<div class="speech-bubble">${c.speech}</div>` : ''}
        <div class="order-bubble">
          <span class="order-lead-icon">${leadIcon}</span>
          <span class="order-text">${orderText}</span>
        </div>
        ${regularTag}
        <div class="customer-avatar">${c.type.icon}</div>
        <div class="customer-name">${c.type.label}</div>
        <div class="patience-track"><div class="patience-fill ${colorClass}" style="width: ${pct}%"></div></div>
      </div>`;
    })
    .join('');
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

  // Khách quen: +5% boa trên giá đơn (mục 25)
  let tipExtra = 0;
  if (customer.isRegular && result.stars >= 4) {
    tipExtra = Math.round(result.orderPrice * (customer.tipBonus || 0.05));
  }
  const totalEarned = result.totalEarned + tipExtra;
  state.money += totalEarned;
  recordRating(result.stars);

  // Đếm phục vụ ≥4★ theo loại (mở khách quen từ lần 5)
  if (result.stars >= 4 && customer.type?.id) {
    if (!state.typeServeGood) state.typeServeGood = {};
    const tid = customer.type.id;
    state.typeServeGood[tid] = (Number(state.typeServeGood[tid]) || 0) + 1;
    saveState(state);
  }

  const reason = resolveReviewReason({
    left: false,
    errors: result.errors,
    isSlightBurn: result.isSlightBurn,
    patiencePct: result.patiencePct,
    priceTooHigh: Boolean(result.priceTooHigh),
  });
  pushReview({
    stars: result.stars,
    reason,
    customerType: customer.type,
    orderIds: customer.order,
    missing: result.missing || [],
    extra: result.extra || [],
  });

  dayStats.servedCount++;
  dayStats.revenue += result.baseEarned;
  dayStats.tips += result.tipEarned + tipExtra;

  customers = customers.filter((c) => c.id !== customer.id);
  selectedCustomerId = customers[0]?.id || null;
  currentPlate = [];

  renderPlate();
  renderCustomers();
  updateHUD();

  showServiceToast(
    `+${formatMoney(totalEarned)} (${result.stars}⭐)${customer.isRegular ? ' 💚' : ''} - ${customer.type?.label || 'Khách'}!`
  );
}

function updateCustomers(dt) {
  const state = getState();
  const bonusSignage = state.upgrades?.ledSign ? 0.15 : 0;
  const priceFactor = getPriceFactor(state);
  const gap = GAME_DATA.customers.gapSeconds(
    state.day || 1,
    state.star || 4.0,
    bonusSignage,
    totalTimeSeconds,
    priceFactor
  );

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
      pushReview({
        stars: 1,
        reason: 'left',
        customerType: c.type,
        orderIds: c.order,
      });
      dayStats.leaveCount++;
      queueChanged = true;
      showServiceToast(`Khách ${c.type.label} hết kiên nhẫn bỏ đi! (đánh giá 1⭐)`);
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

  // M17 — Cập nhật ẩn/hiện bong bóng thoại theo thời gian
  const now = performance.now();
  let speechChanged = false;

  customers.forEach((c) => {
    if (c.speechUntil && now >= c.speechUntil) {
      c.speechUntil = 0;
      speechChanged = true;
    }
  });

  if (speechChanged && !(queueChanged || customers.length > 0)) {
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

  // Cập nhật đồng hồ giờ ảo (chỉ hiển thị, mỗi ~0.5s thật)
  virtualMinutes += minsPerSecond * dt;
  lastClockUpdate += dt;
  if (lastClockUpdate >= 0.5) {
    lastClockUpdate = 0;
    updateHUD();
  }

  updateGrill(dt, showServiceToast);
  updateCustomers(dt);
  updateAssistant(dt);

  if (remainingTime <= 0) {
    finishDay();
    return;
  }
  animationFrameId = requestAnimationFrame(gameLoop);
}

export function finishDay() {
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
  
  // Lưu backup trước khi bán (dùng để rollback nếu người chơi thoát sớm)
  backupDayBeforeService(state);

  // Tính thời lượng thật từ cài đặt
  const durMins = Number(state.dayDurationMinutes ?? 3);
  totalTimeSeconds = durMins * 60;   // 3ph=180s, 4ph=240s...
  remainingTime = totalTimeSeconds;

  // Khởi tạo đồng hồ giờ ảo
  openHour = Number(state.openHour ?? 5);
  const closeHour = Number(state.closeHour ?? 23);
  totalGameMinutes = (closeHour - openHour) * 60;  // tổng phút trong game
  minsPerSecond = totalGameMinutes / totalTimeSeconds; // phút ảo / giây thật
  virtualMinutes = 0;
  lastClockUpdate = 0;

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
    // Ẩn thoại khi chọn
    const picked = customers.find((c) => c.id === selectedCustomerId);
    if (picked) picked.speechUntil = 0;
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