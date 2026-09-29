import { GAME_DATA } from './data.js';

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
  openHour: 5,
  closeHour: 23,
  dayDurationMinutes: 3,
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
      revenueHistory: Array.isArray(parsed.revenueHistory) ? parsed.revenueHistory : [],
      guideSeen: Boolean(parsed.guideSeen) || Boolean(parsed.tutorialDone),
            starCounts: {
        1: Number(parsed.starCounts?.[1]) || 0,
        2: Number(parsed.starCounts?.[2]) || 0,
        3: Number(parsed.starCounts?.[3]) || 0,
        4: Number(parsed.starCounts?.[4]) || 0,
        5: Number(parsed.starCounts?.[5]) || 0,
      },
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews.slice(0, 30) : [],
    };
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
    const spoilageItems = ['suon', 'cha'];
    spoilageItems.forEach((id) => {
      const current = Number(state.inventory[id]) || 0;
      if (current > 0) {
        const lost = Math.floor(current * 0.5);
        state.inventory[id] = current - lost;
      }
    });
  }

  return state;
}

/**
 * Bắt đầu ngày mới: tăng ngày, áp dụng hao tồn kho qua đêm và lưu game.
 */
export function startNewDay(state = getState()) {
  state.day = (Number(state.day) || 1) + 1;
  applyOvernightSpoilage(state);
  saveState(state);
  return state;
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

  const cost = item.cost * batchCount;
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
  state.money = (Number(state.money) || 0) - rent;

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
  return { money: state.money, rent, loanGiven, gameOver };
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