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

function findCombo(
  comboId,
  state = getState()
) {
  const list = Array.isArray(state.combos)
    ? state.combos
    : [];

  return list.find((c) => c.id === comboId) || null;
}

// =========================
// M27 — COMBO
// =========================

/** Tổng giá lẻ active của các món trong combo */
export function getComboSumActive(
  comboId,
  state = getState()
) {
  const combo = findCombo(comboId, state);
  if (!combo) return 0;

  return (combo.items || []).reduce(
    (sum, id) => sum + getActivePrice(id, state),
    0
  );
}

export function comboPriceBounds(
  comboId,
  state = getState()
) {
  const sum = getComboSumActive(comboId, state);

  return {
    sum,
    min: Math.round(sum * 0.5),
    max: Math.round(sum * 1.0),
  };
}

export function getActiveComboPrice(
  comboId,
  state = getState()
) {
  const combo = findCombo(comboId, state);
  if (!combo) return 0;

  const { min, max, sum } =
    comboPriceBounds(comboId, state);

  const v = state.comboPrices?.[comboId];

  if (Number.isFinite(v)) {
    return Math.max(
      min,
      Math.min(max, v)
    );
  }

  const def = Math.round(
    sum * (combo.defaultRatio ?? 0.9)
  );

  return Math.max(
    min,
    Math.min(max, def)
  );
}

export function getPendingComboPrice(
  comboId,
  state = getState()
) {
  const v = state.pendingComboPrices?.[comboId];

  if (Number.isFinite(v)) {
    const { min, max } =
      comboPriceBounds(comboId, state);

    return Math.max(
      min,
      Math.min(max, v)
    );
  }

  return getActiveComboPrice(
    comboId,
    state
  );
}

/** Chỉnh giá combo pending */
export function setPendingComboPrice(
  comboId,
  raw,
  state = getState()
) {
  if (!findCombo(comboId, state)) {
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

export function applyPendingComboPrices(
  state = getState()
) {
  if (!state.pendingComboPrices) {
    state.pendingComboPrices = {};
  }

  if (!state.comboPrices) {
    state.comboPrices = {};
  }

  const list = Array.isArray(state.combos)
    ? state.combos
    : [];

  list.forEach((combo) => {
    const id = combo.id;

    const { min, max } =
      comboPriceBounds(id, state);

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

/**
 * Kiểm tra đơn khớp chính xác 1 combo trong state
 */
export function matchCombo(
  orderIds,
  state = getState()
) {
  const order = [...(orderIds || [])]
    .filter(Boolean)
    .sort()
    .join(',');

  const list = Array.isArray(state.combos)
    ? state.combos
    : [];

  for (const combo of list) {
    if (!combo?.items || combo.items.length < 2) {
      continue;
    }

    const key = [...combo.items]
      .sort()
      .join(',');

    if (key === order) {
      return combo.id;
    }
  }

  return null;
}

function nextComboId(state) {
  const used = new Set(
    (state.combos || []).map((c) => c.id)
  );

  let n = 1;

  while (used.has(`combo_${n}`)) {
    n += 1;
  }

  return `combo_${n}`;
}

/**
 * Thêm combo trống.
 * Tối đa 5 combo.
 */
export function addCombo(state = getState()) {
  if (!Array.isArray(state.combos)) {
    state.combos = [];
  }

  if (state.combos.length >= 5) {
    return null;
  }

  const id = nextComboId(state);
  const name = `Combo ${state.combos.length + 1}`;

  state.combos.push({
    id,
    name,
    items: [],
    defaultRatio: 0.9,
  });

  saveState(state);

  return id;
}

/**
 * Cập nhật 1 combo.
 */
export function updateCombo(
  comboId,
  patch,
  state = getState()
) {
  if (!Array.isArray(state.combos)) {
    return state;
  }

  const idx = state.combos.findIndex(
    (c) => c.id === comboId
  );

  if (idx < 0) {
    return state;
  }

  const cur = state.combos[idx];

  const next = {
    ...cur,
    ...patch,
    id: cur.id,
    items: Array.isArray(patch.items)
      ? [...patch.items]
      : [...(cur.items || [])],
  };

  // Tối đa 4 món
  if (next.items.length > 4) {
    next.items = next.items.slice(0, 4);
  }

  if (typeof next.name === 'string') {
    next.name =
      next.name.trim().slice(0, 20) ||
      cur.name;
  }

  state.combos[idx] = next;

  // Kẹp giá pending theo biên mới
  const { min, max } =
    comboPriceBounds(comboId, state);

  if (!state.pendingComboPrices) {
    state.pendingComboPrices = {};
  }

  let p =
    state.pendingComboPrices[comboId];

  if (!Number.isFinite(p)) {
    p = getActiveComboPrice(
      comboId,
      state
    );
  }

  state.pendingComboPrices[comboId] =
    Math.max(
      min,
      Math.min(max, p)
    );

  saveState(state);

  return state;
}

/**
 * Xóa combo + dọn giá.
 */
export function removeCombo(
  comboId,
  state = getState()
) {
  if (!Array.isArray(state.combos)) {
    return state;
  }

  state.combos = state.combos.filter(
    (c) => c.id !== comboId
  );

  if (state.comboPrices) {
    delete state.comboPrices[comboId];
  }

  if (state.pendingComboPrices) {
    delete state.pendingComboPrices[comboId];
  }

  saveState(state);

  return state;
}

/**
 * Combo đủ điều kiện để dùng trong đơn: ≥2 món.
 */
export function getActiveCombosForOrder(
  state = getState()
) {
  return (
    Array.isArray(state.combos)
      ? state.combos
      : []
  ).filter(
    (c) =>
      Array.isArray(c.items) &&
      c.items.length >= 2
  );
}