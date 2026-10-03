import { GAME_DATA } from './data.js';
import {
  getActivePrice,
  orderHasExpensiveItem,
  matchCombo,
  getActiveComboPrice,
} from './pricing.js';
import { getState } from './state.js';

/**
 * M36 — Số món khớp với order (min của từng id).
 * ≥1 → chấm sao bình thường
 * =0 → nhánh giao trống
 */
function countMatchedItems(customer, plate) {
  const req = {};
  const del = {};

  customer.order.forEach((id) => {
    req[id] = (req[id] || 0) + 1;
  });

  plate.forEach((item) => {
    del[item.id] = (del[item.id] || 0) + 1;
  });

  let matched = 0;

  Object.keys(req).forEach((id) => {
    matched += Math.min(
      req[id] || 0,
      del[id] || 0
    );
  });

  return matched;
}

/**
 * Chấm điểm đơn theo mục 7 + phạt giá mục 24.
 */
export function scoreOrder(customer, plate, options = {}) {
  const serveErrors = Number(options.serveErrors) || 0;
  const state = getState();
  const reqCounts = {};
  const delivCounts = {};

  customer.order.forEach((id) => {
    reqCounts[id] = (reqCounts[id] || 0) + 1;
  });
  plate.forEach((item) => {
    delivCounts[item.id] = (delivCounts[item.id] || 0) + 1;
  });

  const missing = [];
  const extra = [];
  new Set([...Object.keys(reqCounts), ...Object.keys(delivCounts)]).forEach((k) => {
    const diff = (delivCounts[k] || 0) - (reqCounts[k] || 0);
    if (diff < 0) for (let i = 0; i < -diff; i++) missing.push(k);
    else if (diff > 0) for (let i = 0; i < diff; i++) extra.push(k);
  });
  // M31 — Tóp mỡ không bao giờ tính thừa món
  const extraFiltered = extra.filter((id) => id !== 'top_mo');
  const errorsAdjusted =
    missing.length + extraFiltered.length + serveErrors;

  // Giữ errors gốc để review missing/extra, nhưng dùng errorsAdjusted để tính sao
  const errors = errorsAdjusted;

const pct = (customer.patience / customer.maxPatience) * 100;
const ribDelivered = plate.find((i) => i.id === 'suon');
const ribOrdered = customer.order.includes('suon');
const isSlightBurn =
  ribOrdered &&
  ribDelivered &&
  ribDelivered.quality === 'slightBurn';

// M36 — Giao 0 món khớp với order → nhánh giao trống
const matchedCount = countMatchedItems(customer, plate);
const isEmptyDelivery = matchedCount === 0;

if (isEmptyDelivery) {
  return {
    stars: 1,
    orderPrice: 0,
    baseEarned: 0,
    tipEarned: 0,
    totalEarned: 0,
    errors: Math.max(errors, 1),
    missing,
    extra,
    isSlightBurn: false,
    patiencePct: pct,
    priceTooHigh: false,
    isEmptyDelivery: true,
  };
}

  let stars = 1;
  if (errors === 0) {
    if (isSlightBurn || pct < 20) stars = 3;
    else if (pct >= 50) stars = 5;
    else stars = 4;
  } else if (errors <= 1) {
    stars = 2;
  } else {
    stars = 1;
  }

  // Mục 24: món nào giá > 1.3× gốc → trừ 1 sao (tối thiểu 1)
  const priceTooHigh = orderHasExpensiveItem(customer.order, state);
  if (priceTooHigh) {
    stars = Math.max(1, stars - 1);
  }

  // M31 — Tóp mỡ: nếu có và đơn đạt từ 3 sao thì +1 sao
  const hasTopMo = plate.some((p) => p.id === 'top_mo');
  if (hasTopMo && stars >= 3) {
    stars = Math.min(5, stars + 1);
  }

  let orderPrice = customer.order.reduce(
    (sum, id) => sum + getActivePrice(id, state),
    0
  );

  // M27 — nếu đơn khớp chính xác combo thì dùng giá combo
  const comboId =
    errors === 0
      ? matchCombo(customer.order)
      : null;

  if (comboId) {
    orderPrice = getActiveComboPrice(
      comboId,
      state
    );
  }

    // M31 — Tóp mỡ cộng thêm vào giá đơn (không nằm trong order khách)
  if (hasTopMo) {
    orderPrice += Number(GAME_DATA.menu.top_mo?.price) || 7000;
  }

  const baseEarned =
    stars >= 3
      ? orderPrice
      : Math.round(orderPrice * 0.5);

    // M31 — Tóp mỡ được cộng thêm 10% boa nếu đạt từ 3 sao
  let tipRate =
    stars >= 4
      ? customer.type.tip || 0
      : 0;

  if (hasTopMo && stars >= 3) {
    tipRate += 0.1; // +10 điểm % boa
  }

  const tipEarned =
    Math.round(orderPrice * tipRate);

  const totalEarned =
    baseEarned + tipEarned;

  return {
    stars,
    orderPrice,
    baseEarned,
    tipEarned,
    totalEarned,
    errors,
    missing,
    extra,
    isSlightBurn: Boolean(isSlightBurn),
    patiencePct: pct,
    priceTooHigh,
  };
}