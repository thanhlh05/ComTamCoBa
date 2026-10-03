import { GAME_DATA } from './data.js';
import { applyPendingPrices, ensurePriceMaps } from './pricing.js';

const STORAGE_KEY = 'com_tam_save_v1';

export const initialState = {
  money: 200000,
  day: 1,
  star: 4.0,
  recentRatings: Array(20).fill(4),
  inventory: {
    com: 0,
    suon: 0,
    bi: 0,
    cha: 0,
    trung: 0,
    canh: 0,
    tra: 0,
    mam_cay: 20,
    mam_thuong: 20,
    xa_xi: 0,
    cam_ep: 0,
    sua_dau: 0,
    top_mo: 0,
    dia: 20,
    hop: 20,
    boc: 30,
  },
  upgrades: {},
  lastSummary: null,
  revenueHistory: [], // tối đa 30 bản ghi gần nhất (mục 17)
  // M13 — Đánh giá (tách biệt Sao quán mục 7)
  starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, // tích lũy không giới hạn
  reviews: [], // tối đa 30 bản gần nhất
  loanUsed: false,
  soundEnabled: true, // Tên quán (mục 13) và trạng thái tutorial (mục 18)
  shopName: '',
  tutorialDone: false, // Cài đặt giờ mở/đóng và thời lượng bán (mục 15, 16)
  guideSeen: false, // đã xem hướng dẫn 4 thẻ lần đầu (mục 18)
  // M26 — sự kiện giá vốn ngày hiện tại (null | { id, itemId, costMult, name, message })
  todayCostEvent: null,
  openHour: 5,
  closeHour: 23,
  dayDurationMinutes: 3,
  // M16 — giá bán (active = đang bán; pending = chỉnh ở Chuẩn bị, áp dụng ngày sau)
  menuPrices: {},
  pendingMenuPrices: {},
  // M27 — giá combo
  comboPrices: {},
  pendingComboPrices: {},
  // M37 — combo động, tối đa 5 combo
  combos: [],
  tomMoUnlocked: false,
  // M35 — mỗi 5 lần dùng Dĩa → trừ 1 kho
  diaUsageCount: 0,
  // M29 — cho nghỉ hôm nay (áp dụng ngày tiếp theo)
  staffRestPending: {
    staffGrill: false,
    staffCook: false,
  },
  staffRestActive: {
    staffGrill: false,
    staffCook: false,
  },

  // M17 — số lần phục vụ ≥4★ theo loại khách (khách quen)
  typeServeGood: {},
};

let activeState = null;

export function getDefaultState() {
  return JSON.parse(JSON.stringify(initialState));
}

export function saveState(state) {
  activeState = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    activeState = getDefaultState();

    // M37 — seed combo mặc định cho save mới
    if (GAME_DATA.combos) {
      activeState.combos = Object.values(GAME_DATA.combos)
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          name: c.name,
          items: [...(c.items || [])],
          defaultRatio: c.defaultRatio ?? 0.9,
        }));
    }

    saveState(activeState);
    return activeState;
  }

  try {
    const parsed = JSON.parse(raw);
    activeState = {
      ...getDefaultState(),
      ...parsed,
      recentRatings: Array.isArray(parsed.recentRatings) && parsed.recentRatings.length > 0
        ? parsed.recentRatings
        : Array(20).fill(4),
      inventory: {
        ...getDefaultState().inventory,
        ...(parsed.inventory || {}),
      },
      upgrades: { ...(parsed.upgrades || {}) },
      staffRestPending: {
        staffGrill: Boolean(parsed.staffRestPending?.staffGrill),
        staffCook: Boolean(parsed.staffRestPending?.staffCook),
      },
      staffRestActive: {
        staffGrill: Boolean(parsed.staffRestActive?.staffGrill),
        staffCook: Boolean(parsed.staffRestActive?.staffCook),
      },
      revenueHistory: Array.isArray(parsed.revenueHistory) ? parsed.revenueHistory : [],
      guideSeen: Boolean(parsed.guideSeen) || Boolean(parsed.tutorialDone),
            starCounts: {
        1: Number(parsed.starCounts?.[1]) || 0,
        2: Number(parsed.starCounts?.[2]) || 0,
        3: Number(parsed.starCounts?.[3]) || 0,
        4: Number(parsed.starCounts?.[4]) || 0,
        5: Number(parsed.starCounts?.[5]) || 0,
      },
      reviews: Array.isArray(parsed.reviews)
        ? parsed.reviews.slice(0, 30).map((r) => ({
            ...r,
            reply: typeof r.reply === 'string' ? r.reply : '',
          }))
        : [],
      typeServeGood: { ...(parsed.typeServeGood || {}) },
      menuPrices: { ...(parsed.menuPrices || {}) },
      pendingMenuPrices: { ...(parsed.pendingMenuPrices || {}) },
      comboPrices: { ...(parsed.comboPrices || {}) },
      pendingComboPrices: { ...(parsed.pendingComboPrices || {}) },
      combos: Array.isArray(parsed.combos)
        ? parsed.combos.slice(0, 5)
        : [],
      tomMoUnlocked: Boolean(parsed.tomMoUnlocked),
      diaUsageCount: Number(parsed.diaUsageCount) || 0,
    };
    // M37 — migration combo cứng → mảng động
    if (!Array.isArray(activeState.combos)) {
      activeState.combos = [];
    }

    if (
      activeState.combos.length === 0 &&
      GAME_DATA.combos
    ) {
      // Seed từ data.js lần đầu hoặc save cũ chưa có combos
      activeState.combos = Object.values(GAME_DATA.combos).map((c) => ({
        id: c.id,
        name: c.name,
        items: [...(c.items || [])],
        defaultRatio: c.defaultRatio ?? 0.9,
      }));
    }

    // Tối đa 5 combo
    if (activeState.combos.length > 5) {
      activeState.combos = activeState.combos.slice(0, 5);
    }

    if (!activeState.comboPrices) {
      activeState.comboPrices = {};
    }

    if (!activeState.pendingComboPrices) {
      activeState.pendingComboPrices = {};
    }

    saveState(activeState);
    return activeState; 
  } catch (error) {
    console.warn('Không tải được save, dùng trạng thái mặc định:', error);
    activeState = getDefaultState();
    return activeState;
  }
}

export function getState() {
  if (!activeState) {
    activeState = loadState();
  }
  return activeState;
}

/**
 * Hao hụt tồn kho qua đêm theo mục 3 GAME_DESIGN:
 * Sườn và chả còn dư mất 50% (làm tròn xuống) nếu chưa mua Tủ lạnh.
 * Các món khác giữ nguyên.
 */
export function applyOvernightSpoilage(state = getState()) {
  if (!state || !state.inventory) return state;

  // Nếu đã mua tủ lạnh thì sườn và chả không bị hao
  const hasFridge = Boolean(state.upgrades && state.upgrades.fridge && state.upgrades.fridge > 0);
  if (!hasFridge) {
    // Sườn / chả: mất 50%
    ['suon', 'cha'].forEach((id) => {
      const current = Number(state.inventory[id]) || 0;
      if (current > 0) {
        state.inventory[id] = current - Math.floor(current * 0.5);
      }
    });

    // M31 — Tóp mỡ: mất 70%
    const tm = Number(state.inventory.top_mo) || 0;
    if (tm > 0) {
      state.inventory.top_mo = tm - Math.floor(tm * 0.7);
    }
  }

  return state;
}

/**
 * Bắt đầu ngày mới: tăng ngày, hao tồn kho, RESET giá vốn biến động, roll sự kiện mới.
 * Thứ tự BẮT BUỘC (M38 / mục 34):
 *   (1) đưa hiệu ứng giá vốn về gốc (xoá todayCostEvent)
 *   (2) roll xem ngày mới có biến động không
 *   (3) nếu trúng mới gắn todayCostEvent cho đúng 1 món
 */
export function startNewDay(state = getState()) {
  state.day = (Number(state.day) || 1) + 1;

  applyOvernightSpoilage(state);

  // M38 — (1) luôn reset hiệu ứng ngày cũ TRƯỚC khi roll
  state.todayCostEvent = null;

  // M38 — (2)(3) roll sự kiện ngày mới (có thể null)
  rollTodayCostEvent(state);

  // M29 — áp dụng "cho nghỉ" đã chọn từ hôm trước
  state.staffRestActive = {
    staffGrill: Boolean(state.staffRestPending?.staffGrill),
    staffCook: Boolean(state.staffRestPending?.staffCook),
  };

  saveState(state);
  return state;
}

/**
 * M26/M34/M38 — gieo sự kiện giá vốn cho ngày HIỆN TẠI.
 * Chỉ giữ event nếu forDay === day hiện tại; không bao giờ giữ event ngày cũ.
 */
export function rollTodayCostEvent(state = getState()) {
  const cfg = GAME_DATA.costEvents;
  const day = Number(state.day) || 1;

  if (!cfg) {
    state.todayCostEvent = null;
    saveState(state);
    return null;
  }

  // Chưa tới ngày mở sự kiện
  if (day < (cfg.fromDay ?? 3)) {
    state.todayCostEvent = null;
    saveState(state);
    return null;
  }

  // Đã có event đúng ngày này (ví dụ gọi lại trong cùng ngày từ prep) → giữ
  if (
    state.todayCostEvent &&
    state.todayCostEvent.forDay === day
  ) {
    return state.todayCostEvent;
  }

  // Event cũ / sai ngày → bỏ (M38: không cho lọt sang ngày mới)
  state.todayCostEvent = null;

  if (Math.random() >= (cfg.chance ?? 0.2)) {
    saveState(state);
    return null;
  }

  const list = cfg.list || [];

  if (!list.length) {
    saveState(state);
    return null;
  }

  const pick = list[Math.floor(Math.random() * list.length)];

  state.todayCostEvent = {
    id: pick.id,
    name: pick.name,
    itemId: pick.itemId,
    costMult: pick.costMult,
    message: pick.message,
    forDay: day,
  };

  saveState(state);
  return state.todayCostEvent;
}

/** Giá vốn hiệu lực hôm nay (có nhân sự kiện M26 nếu có) */
export function getEffectiveCost(itemId, state = getState()) {
  const item = GAME_DATA.menu[itemId];
  if (!item) return 0;
  let cost = Number(item.cost) || 0;
  const ev = state.todayCostEvent;
  if (ev && ev.itemId === itemId && Number(ev.costMult) > 0) {
    cost = Math.round(cost * Number(ev.costMult));
  }
  return cost;
}

/**
 * Mua nguyên liệu theo lố (mặc định lố 10 phần).
 */
export function buyIngredient(itemId, batchCount = 10, state = getState()) {
  const item = GAME_DATA.menu[itemId];
  if (!item) return { success: false, error: 'Món không tồn tại' };

  // Chả và Canh cần mở khóa qua nâng cấp unlockMenu
  if ((itemId === 'cha' || itemId === 'canh') && !state.upgrades?.unlockMenu) {
    return { success: false, error: 'Chưa mở khóa nâng cấp' };
  }

  if (item.needsDrinkFridge && !state.upgrades?.drinkFridge) {
    return { success: false, error: 'Chưa mở khóa Tủ nước giải khát' };
  }

  if (itemId === 'top_mo' && !state.tomMoUnlocked) {
    return { success: false, error: 'Chưa mở khóa Tóp mỡ' };
  }

  const unitCost = getEffectiveCost(itemId, state);
  const cost = unitCost * batchCount;

  if (state.money < cost) {
    return { success: false, error: 'Không đủ tiền' };
  }

  state.money -= cost;
  state.inventory[itemId] = (Number(state.inventory[itemId]) || 0) + batchCount;
  saveState(state);

  return { success: true, item, batchCount, cost, state };
}

/**
 * Đổ bỏ nguyên liệu (mục 22) — trừ tồn kho, không hoàn tiền.
 */
export function discardIngredient(itemId, qty, state = getState()) {
  const item = GAME_DATA.menu[itemId];
  if (!item) return { success: false, error: 'Món không tồn tại' };

  const stock = Number(state.inventory?.[itemId]) || 0;
  const n = Math.floor(Number(qty) || 0);
  if (n <= 0) return { success: false, error: 'Số lượng không hợp lệ' };
  if (n > stock) return { success: false, error: 'Không đủ tồn kho' };

  state.inventory[itemId] = stock - n;
  saveState(state);
  return { success: true, itemId, qty: n, remaining: state.inventory[itemId] };
}

/**
 * Mua nâng cấp theo mục 8.
 */
export function buyUpgrade(upgradeId, state = getState()) {
  const upgrade = GAME_DATA.upgrades[upgradeId];
  if (!upgrade) return { success: false, error: 'Nâng cấp không tồn tại' };

  const currentLevel = Number(state.upgrades?.[upgradeId]) || 0;
  if (currentLevel >= upgrade.limit) {
    return { success: false, error: 'Đã đạt giới hạn tối đa' };
  }

  const cost = Array.isArray(upgrade.cost) ? upgrade.cost[currentLevel] : upgrade.cost;
  if (state.money < cost) {
    return { success: false, error: 'Không đủ tiền' };
  }

  state.money -= cost;
  if (!state.upgrades) state.upgrades = {};
  state.upgrades[upgradeId] = currentLevel + 1;
  saveState(state);

  return { success: true, upgrade, newLevel: state.upgrades[upgradeId], cost, state };
}

/**
 * Ghi nhận đánh giá sao và cập nhật sao quán (trung bình 20 đánh giá gần nhất).
 */
export function recordRating(stars, state = getState()) {
  if (!state.recentRatings || !Array.isArray(state.recentRatings)) {
    state.recentRatings = Array(20).fill(4);
  }
  state.recentRatings.push(Math.max(1, Math.min(5, Number(stars) || 1)));
  if (state.recentRatings.length > 20) {
    state.recentRatings.shift();
  }
  const avg = state.recentRatings.reduce((sum, r) => sum + r, 0) / state.recentRatings.length;
  state.star = Math.round(avg * 10) / 10;
  saveState(state);
  return state.star;
}

/**
 * Lưu kết quả ngày để màn Tổng kết hiển thị.
 */
export function setLastSummary(summaryData, state = getState()) {
  state.lastSummary = summaryData;
  saveState(state);
  return state.lastSummary;
}

/**
 * Thêm 1 bản ghi vào sổ doanh thu, giữ tối đa 30 bản gần nhất.
 */
export function pushRevenueRecord(record, state = getState()) {
  if (!Array.isArray(state.revenueHistory)) state.revenueHistory = [];

  // Tránh ghi trùng cùng 1 ngày
  state.revenueHistory = state.revenueHistory.filter((r) => r.day !== record.day);

  state.revenueHistory.push(record);

  while (state.revenueHistory.length > 30) {
    state.revenueHistory.shift();
  }

  saveState(state);
  return state.revenueHistory;
}

/**
 * Tính tiền thuê mặt bằng theo mục 2.
 */
export function calcRent(day = 1) {
  const { base, step, max } = GAME_DATA.currency.rentByDay;
  return Math.min(max, base + step * (Math.max(1, day) - 1));
}

/**
 * Xử lý trừ thuê + vay 1 lần / Game Over.
 * Trả về { money, rent, loanGiven, gameOver }
 */
export function applyRentAndLoan(state = getState()) {
  const rent = calcRent(state.day || 1);
  const salary = calcStaffSalary(state);

  state.money =
    (Number(state.money) || 0) -
    rent -
    salary;

  let loanGiven = false;
  let gameOver = false;

  // Nếu tiền < 0
  if (state.money < 0) {
    const hasStock = Object.values(state.inventory || {}).some((v) => Number(v) > 0);
    if (!state.loanUsed && !hasStock) {
      // Cho vay 1 lần
      state.money += GAME_DATA.currency.loan;
      state.loanUsed = true;
      loanGiven = true;
    } else if (state.money < 0) {
      // Lần 2 hoặc vẫn âm → Game Over
      gameOver = true;
    }
  }

  saveState(state);
  return { money: state.money, rent, salary, loanGiven, gameOver };
}

/**
 * Lưu backup trạng thái tiền và kho trước khi vào màn Bán hàng.
 * Dùng để rollback khi người chơi bấm "Thoát về Chuẩn bị".
 */
export function backupDayBeforeService(state = getState()) {
  state._dayBackupBeforeService = {
    money: state.money,
    inventory: { ...state.inventory },
    loanUsed: state.loanUsed,
  };
  saveState(state);
  return state._dayBackupBeforeService;
}

/**
 * Khôi phục trạng thái từ backup (rollback ngày).
 */
export function restoreDayBackup(state = getState()) {
  if (state._dayBackupBeforeService) {
    state.money = state._dayBackupBeforeService.money;
    state.inventory = { ...state._dayBackupBeforeService.inventory };
    state.loanUsed = state._dayBackupBeforeService.loanUsed;
    delete state._dayBackupBeforeService;
    delete state._rentAppliedForDay;
    saveState(state);
  }
  return state;
}
/**
 * M29 — nhân viên đang làm việc hôm nay?
 * Đã thuê + không được cho nghỉ hôm nay.
 */
export function isStaffWorking(role, state = getState()) {
  if (!state.upgrades?.[role]) return false;

  return !Boolean(state.staffRestActive?.[role]);
}

/**
 * M29 — tính tổng lương nhân viên hôm nay.
 * Chỉ tính những nhân viên đang làm việc.
 */
export function calcStaffSalary(state = getState()) {
  let total = 0;

  if (isStaffWorking('staffGrill', state)) {
    total += 40000;
  }

  if (isStaffWorking('staffCook', state)) {
    total += 40000;
  }

  return total;
}

/**
 * M29 — bật/tắt cho nhân viên nghỉ.
 * Thiết lập này áp dụng từ ngày tiếp theo.
 */
export function setStaffRestPending(
  role,
  rest,
  state = getState()
) {
  if (role !== 'staffGrill' && role !== 'staffCook') {
    return state;
  }

  if (!state.staffRestPending) {
    state.staffRestPending = {
      staffGrill: false,
      staffCook: false,
    };
  }

  state.staffRestPending[role] = Boolean(rest);

  saveState(state);
  return state;
}

/**
 * M31 — đủ điều kiện mở khóa Tóp mỡ?
 * AND tức thời: ngày ≥ 15 VÀ tiền ≥ 5.000.000
 */
export function canUnlockTomMo(state = getState()) {
  if (state.tomMoUnlocked) return false; // đã mở rồi

  const day = Number(state.day) || 1;
  const money = Number(state.money) || 0;

  return day >= 15 && money >= 5000000;
}

/**
 * M31 — bấm xác nhận mở khóa Tóp mỡ (không trừ tiền)
 */
export function unlockTomMo(state = getState()) {
  if (state.tomMoUnlocked) {
    return { success: false, error: 'Đã mở khóa' };
  }

  if (!canUnlockTomMo(state)) {
    return { success: false, error: 'Chưa đủ điều kiện' };
  }

  state.tomMoUnlocked = true;
  saveState(state);

  return { success: true };
}

/**
 * M35 — tiêu hao Dĩa / Hộp / Bọc khi giao đúng loại.
 * - Hộp, Bọc: trừ 1 ngay
 * - Dĩa: +1 diaUsageCount; mỗi đủ 5 lần mới trừ 1 kho
 * Trả về { ok, error? }
 */
export function consumePackaging(
  serveType,
  plateContainer,
  plateBagged,
  state = getState()
) {
  if (!state.inventory) state.inventory = {};

  // Dựa vào plateContainer / bag để khớp service.js hiện tại
  if (plateContainer === 'plate') {
    const stock = Number(state.inventory.dia) || 0;

    if (stock <= 0) {
      return { ok: false, error: 'Hết Dĩa' };
    }

    state.diaUsageCount = (Number(state.diaUsageCount) || 0) + 1;

    if (state.diaUsageCount % 5 === 0) {
      state.inventory.dia = stock - 1;
    }

    saveState(state);
    return { ok: true };
  }

  if (plateContainer === 'box') {
    const hopStock = Number(state.inventory.hop) || 0;

    if (hopStock <= 0) {
      return { ok: false, error: 'Hết Hộp' };
    }

    state.inventory.hop = hopStock - 1;

    if (plateBagged) {
      const bocStock = Number(state.inventory.boc) || 0;

      if (bocStock <= 0) {
        // Hoàn lại hộp vừa trừ nếu thiếu bọc
        state.inventory.hop = hopStock;
        saveState(state);
        return { ok: false, error: 'Hết Bọc' };
      }

      state.inventory.boc = bocStock - 1;
    }

    saveState(state);
    return { ok: true };
  }

  return { ok: true };
}

/**
 * M37 — danh sách combo đang dùng (mảng state)
 */
export function getCombos(state = getState()) {
  return Array.isArray(state.combos)
    ? state.combos
    : [];
}

/**
 * M37 — lưu danh sách combo, tối đa 5 combo
 */
export function saveCombos(
  combos,
  state = getState()
) {
  state.combos = (combos || []).slice(0, 5);
  saveState(state);
  return state;
}