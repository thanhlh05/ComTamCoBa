// js/home.js — Tab Quán (dashboard, mục 10, 14 GAME_DESIGN.md)
// Hiện tên quán, sao, ngày, tiền, nút "Mở bán" → chuyển sang prep

import { getState } from './state.js';
import { formatMoney, formatStar } from './ui.js';

let _onOpenPrep = null; // callback chuyển sang Chuẩn bị

/**
 * Khởi tạo tab Quán.
 * @param {function} onOpenPrep - Gọi khi bấm nút "Mở bán".
 */
export function initHomeScreen({ onOpenPrep }) {
  _onOpenPrep = onOpenPrep;

  const btn = document.getElementById('home-btn-open');
  btn?.addEventListener('click', () => {
    if (_onOpenPrep) _onOpenPrep();
  });
}

/**
 * Render nội dung tab Quán từ state hiện tại.
 */
export function renderHomeScreen() {
  const state = getState();

  // Tên quán
  const nameEl = document.getElementById('home-shop-name');
  if (nameEl) nameEl.textContent = state.shopName || 'Cơm Tấm Cô Ba';

  // Sao quán
  const starEl = document.getElementById('home-star');
  if (starEl) starEl.textContent = formatStar(state.star || 4.0);

  // Ngày
  const dayEl = document.getElementById('home-day');
  if (dayEl) dayEl.textContent = `Ngày ${state.day || 1}`;

  // Tiền
  const moneyEl = document.getElementById('home-money');
  if (moneyEl) moneyEl.textContent = formatMoney(state.money ?? 200000);
}
