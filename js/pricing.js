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
  const base = getBasePrice(itemId);
  return {
    base,
    min: Math.round(base * MIN_RATIO),
    max: Math.round(base * MAX_RATIO),
  };
}

/** Nhãn theo tỉ lệ giá món so với giá gốc (mục 24) */
export function getPriceLabel(itemId, price) {
  const base = getBasePrice(itemId);
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
    const base = getBasePrice(id);
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