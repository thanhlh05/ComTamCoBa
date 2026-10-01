import {
  getState,
  saveState,
  recordRating,
  setLastSummary,
  backupDayBeforeService,
  isStaffWorking,
} from './state.js';
import { GAME_DATA, ASSETS } from './data.js';
import { formatMoney, formatStar } from './ui.js';
import { scoreOrder } from './scoring.js';
import { pushReview, resolveReviewReason, formatOrderShort } from './reviews.js';
import { getPriceFactor, matchCombo } from './pricing.js';
import {
  initGrill,
  updateGrill,
  handleGrillClick,
  getGrillSlotCount,
  popTrayRib,
  getTray,
  autoLiftGoodRibs,
} from './grill.js';
import {
  rollServeType,
  serveTypeIcon,
  serveTypeLabel,
  isCorrectContainer,
  serveTypeErrorCount,
  SERVE_TAKEAWAY,
} from './servetype.js';

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
let plateContainer = null; // 'plate' | 'box' | null
let plateBagged = false;
let dayStats = null;
let assistantTimer = 0; // Chị Hai
let isClosing = false; // M23 — đang đóng cửa, không spawn thêm

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

  if (state.upgrades?.unlockMenu) {
    availableExtras.push('cha', 'canh');
  }

  if (state.upgrades?.drinkFridge) {
    availableExtras.push('xa_xi', 'cam_ep', 'sua_dau');
  }

  const extraCount =
    Math.floor(
      Math.random() * (type.extraMax - type.extraMin + 1)
    ) + type.extraMin;

  const shuffled = [...availableExtras].sort(
    () => 0.5 - Math.random()
  );

  let order = [
    'com',
    ...shuffled.slice(0, extraCount),
  ];

  let isComboOrder = false;

  // M27 — ~20% khách gọi đúng 1 combo
  // Không kèm mắm để khớp giá combo.
  if (Math.random() < 0.2 && GAME_DATA.combos) {
    const list = Object.values(GAME_DATA.combos);

    if (list.length > 0) {
      const combo =
        list[Math.floor(Math.random() * list.length)];

      order = [...combo.items];
      isComboOrder = true;
    }
  }

  // M21 — ~55% gọi kèm nước mắm
  // Bỏ qua nếu đang là đơn combo.
  if (!isComboOrder) {
    const sauceChance =
      GAME_DATA.customers.fishSauceChance ?? 0.55;

    if (Math.random() < sauceChance) {
      order.push(
        Math.random() < 0.5
          ? 'mam_cay'
          : 'mam_thuong'
      );
    }
  }

  const serveType = rollServeType();
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
    serveType,
    maxPatience,
    patience: maxPatience,
    isRegular,
    tipBonus: isRegular ? 0.05 : 0,
    speech: line,
    speechUntil: line ? performance.now() + 4000 : 0,
  };
  customers.push(customer);
  if (!selectedCustomerId) selectedCustomerId = customer.id;
  renderCustomers();
  updateServeTypeBar();
}

function renderCustomers() {
  const rowEl = document.getElementById('customer-row');
  if (!rowEl) return;
  if (customers.length === 0) {
    rowEl.innerHTML = '<span class="queue-empty">Chưa có khách nào đang đợi...</span>';
    updateIngredientButtons();
    updateServeTypeBar();
    return;
  }
  const now = performance.now();
  rowEl.innerHTML = customers
    .map((c) => {
      const isSelected = c.id === selectedCustomerId;
      const pct = Math.max(0, (c.patience / c.maxPatience) * 100);
      const colorClass = pct > 50 ? 'high' : pct > 20 ? 'med' : 'low';
      const leadId = c.order.includes('suon') ? 'suon' : 'com';
      const leadIcon = ASSETS[leadId] || '🍚';

      const comboHit = matchCombo(c.order);
      const orderText = comboHit
        ? `🍱 ${GAME_DATA.combos[comboHit]?.name || 'Combo'}`
        : formatOrderShort(c.order);

      const serveIcon = serveTypeIcon(c.serveType);
      const showSpeech = c.speech && c.speechUntil && now < c.speechUntil && !isSelected;
      const regularTag = c.isRegular
        ? `<span class="regular-tag">Khách quen</span>`
        : '';

      return `
      <div class="customer-card ${isSelected ? 'selected' : ''} ${c.isRegular ? 'regular' : ''}" data-id="${c.id}" role="button">
        ${showSpeech ? `<div class="speech-bubble">${c.speech}</div>` : ''}
        <div class="order-bubble">
          <span class="order-serve-icon" title="${serveTypeLabel(c.serveType)}">${serveIcon}</span>
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
  updateIngredientButtons();
  updateServeTypeBar();
}

function resetPlateServeState() {
  plateContainer = null;
  plateBagged = false;
  updateServeTypeBar();
}

function updateServeTypeBar() {
  const customer = customers.find((c) => c.id === selectedCustomerId);
  const btnPlate = document.getElementById('btn-container-plate');
  const btnBox = document.getElementById('btn-container-box');
  const btnBag = document.getElementById('btn-bag');

  const hasCustomer = Boolean(customer);
  if (btnPlate) {
    btnPlate.disabled = !hasCustomer;
    btnPlate.classList.toggle('active', plateContainer === 'plate');
  }
  if (btnBox) {
    btnBox.disabled = !hasCustomer;
    btnBox.classList.toggle('active', plateContainer === 'box');
  }
  if (btnBag) {
    // Bọc chỉ bật khi đã chọn Hộp + khách mang đi
    const canBag =
      hasCustomer &&
      plateContainer === 'box' &&
      customer.serveType === SERVE_TAKEAWAY;
    btnBag.disabled = !canBag;
    btnBag.classList.toggle('active', plateBagged);
  }

  // Khóa nút món khi chưa chọn dĩa/hộp đúng hướng dẫn
  const locked = !plateContainer;
  document.querySelectorAll('#ing-buttons button[data-ing]').forEach((btn) => {
    btn.disabled = locked;
    btn.classList.toggle('serve-locked', locked);
  });
}

function handleServeAction(action) {
  const customer = customers.find((c) => c.id === selectedCustomerId);
  if (!customer) {
    showServiceToast('Chọn khách trước!');
    return;
  }
  if (action === 'plate') {
    plateContainer = 'plate';
    plateBagged = false;
  } else if (action === 'box') {
    plateContainer = 'box';
    plateBagged = false;
  } else if (action === 'bag') {
    if (plateContainer !== 'box' || customer.serveType !== SERVE_TAKEAWAY) {
      showServiceToast('Chỉ bọc khi khách mang đi và đã chọn Hộp!');
      return;
    }
    plateBagged = true;
  }
  updateServeTypeBar();
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
  updateIngredientButtons();
}

/** Đếm món còn thiếu trên đĩa so với order khách đang chọn */
function getNeededCounts() {
  const customer = customers.find((c) => c.id === selectedCustomerId);
  if (!customer) return {};
  const need = {};
  customer.order.forEach((id) => {
    need[id] = (need[id] || 0) + 1;
  });
  currentPlate.forEach((p) => {
    if (need[p.id]) need[p.id] -= 1;
  });
  // Chỉ giữ món còn thiếu > 0
  Object.keys(need).forEach((k) => {
    if (need[k] <= 0) delete need[k];
  });
  return need;
}

/** Cập nhật nhãn tồn kho + viền xanh trên nút món (mục 27) */
function updateIngredientButtons() {
  const state = getState();
  const need = getNeededCounts();
  const trayCount = getTray().length;

  document.querySelectorAll('#ing-buttons button[data-ing]').forEach((btn) => {
    const id = btn.dataset.ing;
    const item = GAME_DATA.menu[id];
    if (!item) return;

    const stock =
      id === 'suon'
        ? trayCount // sườn: số trong khay chín (lắp đĩa dùng khay)
        : Number(state.inventory?.[id]) || 0;

    // Giữ icon + tên ngắn + (số)
    const icon = ASSETS[id] || '';
    const shortName =
      GAME_DATA.orderShortNames?.[id] ||
      item.name.replace(/^Cơm tấm$/, 'Cơm') ||
      id;
    // Hiển thị: với sườn hiện cả kho sống / khay (để khỏi nhầm)
    let label;
    if (id === 'suon') {
      const live = Number(state.inventory?.suon) || 0;
      label = `${icon} ${shortName} (${live}/${trayCount})`;
    } else {
      label = `${icon} ${shortName} (${stock})`;
    }
    btn.textContent = label;

    const needed = Boolean(need[id]);
    btn.classList.toggle('ing-needed', needed);
  });
}

function addIngredientToPlate(itemId) {
  if (!plateContainer) {
    showServiceToast('Chọn 🍽 Dĩa hoặc 📦 Hộp trước!');
    return;
  }
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
  updateIngredientButtons();
}

function trashPlate() {
  if (currentPlate.length === 0) return;
  currentPlate = [];
  renderPlate();
  updateIngredientButtons();
  showServiceToast('Đã đổ đĩa làm lại! (Mất nguyên liệu)');
}

function deliverPlate() {
  if (customers.length === 0) {
    showServiceToast('Chưa có khách nào!');
    return;
  }
  const customer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  if (!customer) return;

  const serveErrors = serveTypeErrorCount(
    customer.serveType,
    plateContainer,
    plateBagged
  );

  const result = scoreOrder(customer, currentPlate, { serveErrors });
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

  resetPlateServeState();
  renderPlate();
  updateIngredientButtons();
  renderCustomers();
  updateServeTypeBar();
  updateHUD();

  if (isClosing && customers.length === 0) {
    finishDay();
  }

  showServiceToast(
    `+${formatMoney(totalEarned)} (${result.stars}⭐)${customer.isRegular ? ' 💚' : ''} - ${customer.type?.label || 'Khách'}!`
  );
}

/** M22 — Báo hết món: khách bỏ đi, không trừ sao / không review */
function reportOutOfStock() {
  if (customers.length === 0) {
    showServiceToast('Chưa có khách nào!');
    return;
  }
  const customer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];
  if (!customer) return;

  if (dayStats) {
    dayStats.outOfStockCount = (dayStats.outOfStockCount || 0) + 1;
  }

  customers = customers.filter((c) => c.id !== customer.id);
  selectedCustomerId = customers[0]?.id || null;
  currentPlate = [];
  resetPlateServeState();

  renderPlate();
  updateIngredientButtons();
  renderCustomers();
  updateServeTypeBar();
  updateHUD();

  if (isClosing && customers.length === 0) {
    finishDay();
  }

  showServiceToast(
    `Đã báo hết — ${customer.type?.label || 'Khách'} bỏ đi (không trừ sao)`
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

  if (!isClosing && spawnedCount < totalCustomers) {
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

  if (isClosing && customers.length === 0) {
    finishDay();
    return;
  }

  let shouldRenderCustomers = queueChanged;

  if (!customers.find((c) => c.id === selectedCustomerId)) {
    selectedCustomerId = customers[0]?.id || null;
    shouldRenderCustomers = true;
  }

  // M17 — Cập nhật ẩn/hiện bong bóng thoại theo thời gian
  const now = performance.now();

  customers.forEach((c) => {
    if (c.speechUntil && now >= c.speechUntil) {
      c.speechUntil = 0;
      shouldRenderCustomers = true;
    }
  });

  if (shouldRenderCustomers) {
    renderCustomers();
  }
}

/** M29 — Nhân viên Nướng: mỗi frame kiểm tra, gắp sườn chín vàng */
function updateStaffGrill(onToast) {
  if (!isStaffWorking('staffGrill')) return;
  autoLiftGoodRibs(onToast);
}

/** M29 — Nhân viên Làm món
 * - Mỗi 3s lắp 1 món còn thiếu (có hàng), không đụng sườn
 * - Nếu đơn thiếu món đã hết hàng → dừng, không lắp dở (tránh lỗ NL + sao xấu)
 * - Không toast khi thêm đúng; chỉ toast khi lắp nhầm (1%) hoặc lần đầu phát hiện hết món
 */
function updateStaffCook(dt) {
  if (!isStaffWorking('staffCook')) return;
  if (!selectedCustomerId || customers.length === 0) return;
  if (!plateContainer) return;

  assistantTimer += dt;
  if (assistantTimer < 3) return;
  assistantTimer = 0;

  const state = getState();
  const customer = customers.find((c) => c.id === selectedCustomerId);
  if (!customer) return;

  const need = getNeededCounts();
  if (!need || Object.keys(need).length === 0) return;

  const priority = [
    'bi', 'trung', 'com',
    'mam_cay', 'mam_thuong',
    'tra', 'xa_xi', 'cam_ep', 'sua_dau',
    'cha', 'canh',
  ];

  // Món nhân viên có thể lắp mà đơn vẫn thiếu
  const stillNeeded = priority.filter((id) => need[id] > 0);

  // Có món thiếu nhưng hết hàng → dừng, không lắp dở
  const blocked = stillNeeded.filter(
    (id) => (Number(state.inventory?.[id]) || 0) <= 0
  );

  if (blocked.length > 0) {
    // Toast 1 lần / khách (tránh spam)
    if (!customer._staffBlockedToast) {
      customer._staffBlockedToast = true;
      const name =
        GAME_DATA.menu[blocked[0]]?.name || blocked[0];
      showServiceToast(
        `Thiếu ${name} trong kho — nhân viên dừng lắp đơn này`
      );
    }
    return;
  }

  // Còn hàng cho mọi món thiếu (trong phạm vi nhân viên)
  const available = stillNeeded.filter(
    (id) => (Number(state.inventory?.[id]) || 0) > 0
  );
  if (available.length === 0) return;

  let pick;
  let isWrong = false;

  // 1% lắp nhầm
  if (Math.random() < 0.01) {
    const wrongPool = priority.filter((id) => {
      if (need[id] > 0) return false;
      return (Number(state.inventory?.[id]) || 0) > 0;
    });
    if (wrongPool.length > 0) {
      pick = wrongPool[Math.floor(Math.random() * wrongPool.length)];
      isWrong = true;
    }
  }

  if (!pick) pick = available[0];

  const stock = Number(state.inventory?.[pick]) || 0;
  if (stock <= 0) return;

  state.inventory[pick] = stock - 1;
  saveState(state);
  currentPlate.push({ id: pick });
  renderPlate();
  updateIngredientButtons();

  if (isWrong) {
    showServiceToast(
      `Nhân viên Làm món lắp nhầm ${GAME_DATA.menu[pick]?.name || pick}! ⚠️`
    );
  }
}

function gameLoop(now) {
  if (!isLoopRunning) return;
  if (!lastTime) lastTime = now;
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  remainingTime -= dt;

  // M23 — vừa hết giờ thì chuyển sang trạng thái đóng cửa ngay,
  // trước khi updateCustomers() có cơ hội spawn khách mới.
  if (remainingTime <= 0 && !isClosing) {
    isClosing = true;
    showServiceToast('Hết giờ — bán hết khách đang đợi rồi đóng cửa');
  }

  // Cập nhật đồng hồ giờ ảo (chỉ hiển thị, mỗi ~0.5s thật)
  virtualMinutes += minsPerSecond * dt;
  lastClockUpdate += dt;
  if (lastClockUpdate >= 0.5) {
    lastClockUpdate = 0;
    updateHUD();
  }

  updateGrill(dt, showServiceToast);
  updateCustomers(dt);
  updateStaffGrill(showServiceToast);
  updateStaffCook(dt);

    // M23 — đóng cửa (hết giờ hoặc đóng sớm) + hết hàng đợi → Tổng kết
  if (isClosing && customers.length === 0) {
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

/** M23 — Đóng cửa sớm: dừng khách mới, bán hết hàng đợi */
export function beginEarlyClose() {
  if (isClosing) {
    // Đã đang đóng cửa: nếu hết khách thì kết thúc luôn
    if (customers.length === 0) finishDay();
    return;
  }

  isClosing = true;
  showServiceToast('Đang đóng cửa — phục vụ hết khách đang đợi');

  if (customers.length === 0) {
    finishDay();
  }
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
    baseCount = Math.min(60, Math.round(baseCount * 1.15));
  }
  totalCustomers = baseCount;

  spawnedCount = 0;
  spawnTimer = 1.0;
  customers = [];
  selectedCustomerId = null;
  currentPlate = [];
  assistantTimer = 0;
  isClosing = false; // M23 — bắt đầu ngày mới thì cho phép spawn khách

  dayStats = {
    day: state.day || 1,
    servedCount: 0,
    leaveCount: 0,
    outOfStockCount: 0, // M22
    revenue: 0,
    tips: 0,
    startStar: state.star || 4.0,
    endStar: state.star || 4.0,
  };

  const hasUnlock = Boolean(state.upgrades?.unlockMenu);
  document.getElementById('btn-ing-cha')?.classList.toggle('hidden', !hasUnlock);
  document.getElementById('btn-ing-canh')?.classList.toggle('hidden', !hasUnlock);

  const hasDrinkFridge = Boolean(state.upgrades?.drinkFridge);
  document.getElementById('btn-ing-xa-xi')?.classList.toggle('hidden', !hasDrinkFridge);
  document.getElementById('btn-ing-cam-ep')?.classList.toggle('hidden', !hasDrinkFridge);
  document.getElementById('btn-ing-sua-dau')?.classList.toggle('hidden', !hasDrinkFridge);

  updateHUD();
  initGrill(getGrillSlotCount());

  resetPlateServeState();
  renderPlate();
  renderCustomers();
  updateIngredientButtons();
  updateServeTypeBar();

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

    // M17/M18 — đổi khách thì làm lại đĩa và chọn lại Dĩa/Hộp
    resetPlateServeState();
    currentPlate = [];

    assistantTimer = 0; // M29 — đổi khách thì nhân viên chờ chu kỳ mới

    renderPlate();
    renderCustomers();
    updateIngredientButtons();
    updateServeTypeBar();
  });

  document.getElementById('grill-grid')?.addEventListener('click', (e) => {
    const slotEl = e.target.closest('.grill-slot');
    if (!slotEl) return;
    const index = Number(slotEl.dataset.index);
    if (!Number.isNaN(index)) {
      handleGrillClick(index, {
        onToast: showServiceToast,
        onHUDUpdate: () => {
          updateHUD();
          updateIngredientButtons();
        },
      });
    }
  });

  document.getElementById('ing-buttons')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-ing]');
    if (btn) addIngredientToPlate(btn.dataset.ing);
  });

  document.getElementById('serve-type-bar')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-serve-action]');
    if (!btn || btn.disabled) return;

    handleServeAction(btn.dataset.serveAction);
  });

  document.getElementById('btn-trash-plate')?.addEventListener('click', trashPlate);
  document.getElementById('btn-deliver-plate')?.addEventListener('click', deliverPlate);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopServiceLoop();
    else if (document.getElementById('screen-service')?.classList.contains('active')) {
      startServiceLoop();
    }
  });

  document.getElementById('btn-out-of-stock')?.addEventListener('click', reportOutOfStock);
}

export function getServiceState() {
  return { customers, currentPlate, remainingTime, dayStats, isLoopRunning, tray: getTray() };
}