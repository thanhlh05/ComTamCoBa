// js/pricing.js — Tự chỉnh giá bán (mục 24 GAME_DESIGN.md)
import { getState, saveState } from './state.js';
import { GAME_DATA } from './data.js';

const STEP = 1000;
const MIN_RATIO = 0.5;
const MAX_RATIO = 2.0;

/** Giá gốc trong data.js */
export function getBasePrice(itemId) {
  return Number(GAME_DATA.menu[itemId]?.price) || 0;
}

/** Giá bán gốc hiệu chỉnh theo sự kiện M26 (cùng % với vốn món đó) */
export function getEffectiveBasePrice(itemId, state = getState()) {
  const item = GAME_DATA.menu[itemId];
  if (!item) return 0;

  let base = Number(item.price) || 0;
  const ev = state.todayCostEvent;

  if (ev && ev.itemId === itemId && Number(ev.costMult) > 0) {
    base = Math.round(base * Number(ev.costMult));
  }

  return base;
}

/** Giá đang áp dụng khi bán (menuPrices) */
export function getActivePrice(itemId, state = getState()) {
  const base = getBasePrice(itemId);
  const v = state.menuPrices?.[itemId];
  return Number.isFinite(v) ? v : base;
}

/** Giá đang chỉnh ở Chuẩn bị (pending), chưa chắc đã áp dụng */
export function getPendingPrice(itemId, state = getState()) {
  const base = getBasePrice(itemId);
  const v = state.pendingMenuPrices?.[itemId];
  if (Number.isFinite(v)) return v;
  return getActivePrice(itemId, state);
}

export function priceBounds(itemId) {
  const base = getEffectiveBasePrice(itemId);
  return {
    base,
    min: Math.round(base * MIN_RATIO),
    max: Math.round(base * MAX_RATIO),
  };
}

/** Nhãn theo tỉ lệ giá món so với giá gốc (mục 24) */
export function getPriceLabel(itemId, price) {
  const base = getEffectiveBasePrice(itemId);
  if (!base) return null;

  const r = price / base;

  if (r <= 0.7) return { text: '🟢 Giá mềm', kind: 'soft' };
  if (r <= 1.15) return null;
  if (r <= 1.4) return { text: '🟡 Hơi mắc', kind: 'mid' };

  return { text: '🔴 Quá mắc', kind: 'high' };
}

/**
 * heSoGia theo giá Cơm tấm đang áp dụng (mục 24).
 * p = giá cơm / 15000
 * heSoGia = clamp(1 + (1 - p) * 0.6, 0.6, 1.3)
 */
export function getPriceFactor(state = getState()) {
  const comPrice = getActivePrice('com', state);
  const p = comPrice / 15000;
  const raw = 1 + (1 - p) * 0.6;
  return Math.max(0.6, Math.min(1.3, raw));
}

/** Có món trong đơn giá > 1.3× gốc không? */
export function orderHasExpensiveItem(orderIds, state = getState()) {
  return (orderIds || []).some((id) => {
    const base = getEffectiveBasePrice(id, state);
    if (!base) return false;

    return getActivePrice(id, state) > base * 1.3;
  });
}

/** Chỉnh giá pending, bước 1000đ, kẹp 50%–200% */
export function adjustPendingPrice(itemId, deltaSteps, state = getState()) {
  if (!GAME_DATA.menu[itemId]) return state;
  const { min, max } = priceBounds(itemId);
  if (!state.pendingMenuPrices) state.pendingMenuPrices = {};
  const cur = getPendingPrice(itemId, state);
  let next = cur + deltaSteps * STEP;
  next = Math.round(next / STEP) * STEP;
  next = Math.max(min, Math.min(max, next));
  state.pendingMenuPrices[itemId] = next;
  saveState(state);
  return state;
}

/** Khi qua ngày mới: pending → active */
export function applyPendingPrices(state = getState()) {
  if (!state.pendingMenuPrices) state.pendingMenuPrices = {};

  // Đảm bảo mọi món có giá
  Object.keys(GAME_DATA.menu).forEach((id) => {
    if (!Number.isFinite(state.pendingMenuPrices[id])) {
      state.pendingMenuPrices[id] = getActivePrice(id, state);
    }
  });

  state.menuPrices = { ...state.pendingMenuPrices };

  // M27 — áp dụng giá combo cùng lúc với giá món
  applyPendingComboPrices(state);

  saveState(state);
  return state;
}

/** Khởi tạo giá mặc định cho save cũ */
export function ensurePriceMaps(state = getState()) {
  if (!state.menuPrices) state.menuPrices = {};
  if (!state.pendingMenuPrices) state.pendingMenuPrices = {};
  Object.keys(GAME_DATA.menu).forEach((id) => {
    const base = getBasePrice(id);
    if (!Number.isFinite(state.menuPrices[id])) state.menuPrices[id] = base;
    if (!Number.isFinite(state.pendingMenuPrices[id])) {
      state.pendingMenuPrices[id] = state.menuPrices[id];
    }
  });
  return state;
}

// =========================
// M27 — COMBO
// =========================

/** Tổng giá lẻ active của các món trong combo */
export function getComboSumActive(comboId, state = getState()) {
  const combo = GAME_DATA.combos?.[comboId];
  if (!combo) return 0;

  return (combo.items || []).reduce(
    (sum, id) => sum + getActivePrice(id, state),
    0
  );
}

/** Khung giá combo: 50%–100% tổng giá lẻ */
export function comboPriceBounds(comboId, state = getState()) {
  const sum = getComboSumActive(comboId, state);

  return {
    sum,
    min: Math.round(sum * 0.5),
    max: Math.round(sum * 1.0),
  };
}

/** Giá combo đang áp dụng */
export function getActiveComboPrice(comboId, state = getState()) {
  const combo = GAME_DATA.combos?.[comboId];
  if (!combo) return 0;

  const { min, max, sum } = comboPriceBounds(comboId, state);
  const v = state.comboPrices?.[comboId];

  if (Number.isFinite(v)) {
    return Math.max(min, Math.min(max, v));
  }

  const def = Math.round(
    sum * (combo.defaultRatio ?? 0.9)
  );

  return Math.max(min, Math.min(max, def));
}

/** Giá combo pending, chưa chắc đã áp dụng */
export function getPendingComboPrice(comboId, state = getState()) {
  const v = state.pendingComboPrices?.[comboId];

  if (Number.isFinite(v)) {
    const { min, max } = comboPriceBounds(comboId, state);

    return Math.max(
      min,
      Math.min(max, v)
    );
  }

  return getActiveComboPrice(comboId, state);
}

/** Chỉnh giá combo pending */
export function setPendingComboPrice(
  comboId,
  raw,
  state = getState()
) {
  if (!GAME_DATA.combos?.[comboId]) {
    return state;
  }

  const { min, max } = comboPriceBounds(
    comboId,
    state
  );

  let n = Math.round(Number(raw));

  if (!Number.isFinite(n)) {
    return state;
  }

  n = Math.max(
    min,
    Math.min(max, n)
  );

  if (!state.pendingComboPrices) {
    state.pendingComboPrices = {};
  }

  state.pendingComboPrices[comboId] = n;

  saveState(state);

  return state;
}

/** Pending combo → active */
export function applyPendingComboPrices(
  state = getState()
) {
  if (!state.pendingComboPrices) {
    state.pendingComboPrices = {};
  }

  if (!state.comboPrices) {
    state.comboPrices = {};
  }

  Object.keys(GAME_DATA.combos || {}).forEach((id) => {
    const { min, max } = comboPriceBounds(
      id,
      state
    );

    let v = state.pendingComboPrices[id];

    if (!Number.isFinite(v)) {
      v = getActiveComboPrice(id, state);
    }

    v = Math.max(
      min,
      Math.min(max, v)
    );

    state.pendingComboPrices[id] = v;
    state.comboPrices[id] = v;
  });

  saveState(state);

  return state;
}

/** Kiểm tra đơn có khớp chính xác một combo hay không */
export function matchCombo(orderIds) {
  const order = [...(orderIds || [])]
    .filter(Boolean)
    .sort()
    .join(',');

  for (const combo of Object.values(
    GAME_DATA.combos || {}
  )) {
    const key = [...combo.items]
      .sort()
      .join(',');

    if (key === order) {
      return combo.id;
    }
  }

  return null;
}