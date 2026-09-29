import { GAME_DATA } from './data.js';
import { getActivePrice, orderHasExpensiveItem } from './pricing.js';
import { getState } from './state.js';

/**
 * Chấm điểm đơn theo mục 7 + phạt giá mục 24.
 */
export function scoreOrder(customer, plate) {
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
  const errors = missing.length + extra.length;

  const pct = (customer.patience / customer.maxPatience) * 100;
  const ribDelivered = plate.find((i) => i.id === 'suon');
  const ribOrdered = customer.order.includes('suon');
  const isSlightBurn =
    ribOrdered && ribDelivered && ribDelivered.quality === 'slightBurn';

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

  const orderPrice = customer.order.reduce(
    (sum, id) => sum + getActivePrice(id, state),
    0
  );

  const baseEarned = stars >= 3 ? orderPrice : Math.round(orderPrice * 0.5);
  const tipRate = stars >= 4 ? customer.type.tip || 0 : 0;
  const tipEarned = Math.round(orderPrice * tipRate);
  const totalEarned = baseEarned + tipEarned;

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