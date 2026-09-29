// js/revenue.js — Tab Sổ Doanh Thu (mục 17 GAME_DESIGN.md)
import { getState } from './state.js';
import { formatMoney, formatStar } from './ui.js';

/** Render danh sách hoặc chi tiết */
export function renderRevenueScreen() {
  const container = document.getElementById('revenue-content');
  if (!container) return;

  const state = getState();
  const history = Array.isArray(state.revenueHistory) ? [...state.revenueHistory] : [];
  // Mới nhất trên đầu
  history.sort((a, b) => (b.day || 0) - (a.day || 0));

  if (history.length === 0) {
    container.innerHTML = `
      <div class="placeholder-screen">
        <div class="placeholder-icon">📊</div>
        <h2>Sổ Doanh Thu</h2>
        <p>Chưa có ngày nào được ghi nhận.<br>Bán xong một ngày sẽ xuất hiện ở đây!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="revenue-list" id="revenue-list">
      ${history.map((r) => `
        <button class="revenue-row" type="button" data-day="${r.day}">
          <span class="revenue-day">Ngày ${r.day}</span>
          <span class="revenue-profit ${r.profit >= 0 ? 'profit' : 'loss'}">
            ${r.profit >= 0 ? '+' : ''}${formatMoney(r.profit)}
          </span>
          <span class="revenue-star">${formatStar(r.star)}</span>
          <span class="revenue-arrow">›</span>
        </button>
      `).join('')}
    </div>
    <div id="revenue-detail" class="revenue-detail hidden"></div>
  `;

  container.querySelectorAll('.revenue-row').forEach((btn) => {
    btn.addEventListener('click', () => {
      const day = Number(btn.dataset.day);
      const record = history.find((r) => r.day === day);
      if (record) showRevenueDetail(record);
    });
  });
}

function showRevenueDetail(r) {
  const list = document.getElementById('revenue-list');
  const detail = document.getElementById('revenue-detail');
  if (!detail) return;

  if (list) list.classList.add('hidden');
  detail.classList.remove('hidden');

  detail.innerHTML = `
    <button id="revenue-back" class="revenue-back-btn" type="button">← Quay lại danh sách</button>
    <div class="summary-card">
      <h2>Tổng kết ngày ${r.day}</h2>
      <div class="summary-row"><span>Doanh thu</span><span>${formatMoney(r.revenue || 0)}</span></div>
      <div class="summary-row"><span>Tiền boa</span><span>${formatMoney(r.tips || 0)}</span></div>
      <div class="summary-row"><span>Thuê mặt bằng</span><span>-${formatMoney(r.rent || 0)}</span></div>
      <div class="summary-row summary-total">
        <span>Tổng lời/lỗ</span>
        <span class="${(r.profit || 0) >= 0 ? 'profit' : 'loss'}">${formatMoney(r.profit || 0)}</span>
      </div>
      <hr>
      <div class="summary-row"><span>Khách phục vụ</span><span>${r.servedCount || 0}</span></div>
      <div class="summary-row"><span>Khách bỏ đi</span><span>${r.leaveCount || 0}</span></div>
      <div class="summary-row"><span>Sao ngày đó</span><span>${formatStar(r.star)}</span></div>
    </div>
  `;

  document.getElementById('revenue-back')?.addEventListener('click', () => {
    detail.classList.add('hidden');
    detail.innerHTML = '';
    if (list) list.classList.remove('hidden');
  });
}

export function initRevenueScreen() {
  // Không cần bind cố định — render mỗi lần vào tab
}