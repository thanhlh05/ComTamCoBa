// js/revenue.js — Tab Doanh thu + Đánh giá (mục 17, 21)
import { getState } from './state.js';
import { formatMoney, formatStar } from './ui.js';
import { renderReviewsPanel } from './reviews.js';

let revenueSubTab = 'ledger'; // 'ledger' | 'reviews'

export function renderRevenueScreen() {
  const container = document.getElementById('revenue-content');
  if (!container) return;

  container.innerHTML = `
    <div class="rev-subtabs" role="tablist">
      <button type="button" class="rev-subtab ${revenueSubTab === 'ledger' ? 'active' : ''}" data-sub="ledger">Doanh thu</button>
      <button type="button" class="rev-subtab ${revenueSubTab === 'reviews' ? 'active' : ''}" data-sub="reviews">Đánh giá</button>
    </div>
    <div id="rev-panel" class="rev-panel"></div>
  `;

  container.querySelectorAll('.rev-subtab').forEach((btn) => {
    btn.addEventListener('click', () => {
      revenueSubTab = btn.dataset.sub;
      renderRevenueScreen();
    });
  });

  const panel = container.querySelector('#rev-panel');
  if (revenueSubTab === 'reviews') {
    renderReviewsPanel(panel);
  } else {
    renderLedger(panel);
  }
}

function renderLedger(panel) {
  const state = getState();
  const history = Array.isArray(state.revenueHistory) ? [...state.revenueHistory] : [];
  history.sort((a, b) => (b.day || 0) - (a.day || 0));

  if (history.length === 0) {
    panel.innerHTML = `
      <div class="placeholder-screen">
        <div class="placeholder-icon">📊</div>
        <h2>Sổ Doanh Thu</h2>
        <p>Chưa có ngày nào được ghi nhận.<br>Bán xong một ngày sẽ xuất hiện ở đây!</p>
      </div>`;
    return;
  }

  panel.innerHTML = `
    <div class="revenue-list" id="revenue-list">
      ${history
        .map(
          (r) => `
        <button class="revenue-row" type="button" data-day="${r.day}">
          <span class="revenue-day">Ngày ${r.day}</span>
          <span class="revenue-profit ${r.profit >= 0 ? 'profit' : 'loss'}">
            ${r.profit >= 0 ? '+' : ''}${formatMoney(r.profit)}
          </span>
          <span class="revenue-star">${formatStar(r.star)}</span>
          <span class="revenue-arrow">›</span>
        </button>`
        )
        .join('')}
    </div>
    <div id="revenue-detail" class="revenue-detail hidden"></div>
  `;

  panel.querySelectorAll('.revenue-row').forEach((btn) => {
    btn.addEventListener('click', () => {
      const day = Number(btn.dataset.day);
      const record = history.find((r) => r.day === day);
      if (record) showRevenueDetail(record, panel);
    });
  });
}

function showRevenueDetail(r, panel) {
  const list = panel.querySelector('#revenue-list');
  const detail = panel.querySelector('#revenue-detail');
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

  detail.querySelector('#revenue-back')?.addEventListener('click', () => {
    detail.classList.add('hidden');
    detail.innerHTML = '';
    if (list) list.classList.remove('hidden');
  });
}

export function initRevenueScreen() {}