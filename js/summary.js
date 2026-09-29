import {
  getState,
  saveState,
  startNewDay,
  calcRent,
  applyRentAndLoan,
  pushRevenueRecord,
} from './state.js';
import { formatMoney, formatStar } from './ui.js';

let summaryBound = false;

function getSummaryData() {
  const state = getState();
  const last = state.lastSummary || {
    day: state.day || 1,
    servedCount: 0,
    leaveCount: 0,
    revenue: 0,
    tips: 0,
    startStar: state.star || 4.0,
    endStar: state.star || 4.0,
  };

  const rent = calcRent(last.day || state.day || 1);
  const profit = (last.revenue || 0) + (last.tips || 0) - rent;

  return {
    ...last,
    rent,
    profit,
    currentMoney: state.money,
    currentStar: state.star,
  };
}

function renderSummary() {
  const data = getSummaryData();
  const state = getState();

  // Cập nhật HUD ngày
  const hudDayEl = document.getElementById('summary-hud-day');
  if (hudDayEl) hudDayEl.textContent = `Ngày ${data.day || 1}`;

  // Áp dụng trừ thuê + xử lý vay / game over (chỉ 1 lần khi vào màn)
    if (!state._rentAppliedForDay || state._rentAppliedForDay !== data.day) {
    const result = applyRentAndLoan(state);
    state._rentAppliedForDay = data.day;
    saveState(state);

    data.rent = result.rent;
    data.currentMoney = result.money;
    data.loanGiven = result.loanGiven;
    data.gameOver = result.gameOver;
    data.profit = (data.revenue || 0) + (data.tips || 0) - result.rent;

    // Lưu vào sổ doanh thu (1 lần / ngày)
    pushRevenueRecord({
      day: data.day,
      revenue: data.revenue || 0,
      tips: data.tips || 0,
      rent: result.rent,
      profit: data.profit,
      servedCount: data.servedCount || 0,
      leaveCount: data.leaveCount || 0,
      star: data.endStar || data.currentStar || state.star || 4.0,
    });
  }

  const container = document.getElementById('summary-content');
  if (!container) return;

  if (data.gameOver) {
    container.innerHTML = `
      <div class="summary-gameover">
        <h2>Game Over</h2>
        <p>Cô Ba hết vốn rồi... Thử lại từ đầu nhé!</p>
        <button id="btn-restart" class="btn-primary">Chơi lại</button>
      </div>
    `;
    document.getElementById('btn-restart')?.addEventListener('click', () => {
      localStorage.removeItem('com_tam_save_v1');
      location.reload();
    });
    return;
  }

  const loanMsg = data.loanGiven
    ? `<p class="summary-loan">Cô Ba cho mượn 100.000đ lần này nha!</p>`
    : '';

  container.innerHTML = `
    <div class="summary-card">
      <h2>Tổng kết ngày ${data.day}</h2>
      ${loanMsg}
      <div class="summary-row"><span>Doanh thu</span><span>${formatMoney(data.revenue || 0)}</span></div>
      <div class="summary-row"><span>Tiền boa</span><span>${formatMoney(data.tips || 0)}</span></div>
      <div class="summary-row"><span>Thuê mặt bằng</span><span>-${formatMoney(data.rent)}</span></div>
      <div class="summary-row summary-total">
        <span>Tổng lời/lỗ</span>
        <span class="${data.profit >= 0 ? 'profit' : 'loss'}">${formatMoney(data.profit)}</span>
      </div>
      <hr>
      <div class="summary-row"><span>Khách phục vụ</span><span>${data.servedCount || 0}</span></div>
      <div class="summary-row"><span>Khách bỏ đi</span><span>${data.leaveCount || 0}</span></div>
      <div class="summary-row">
        <span>Sao quán</span>
        <span>${formatStar(data.startStar)} → ${formatStar(data.endStar || data.currentStar)}</span>
      </div>
      <div class="summary-row"><span>Tiền hiện tại</span><span>${formatMoney(data.currentMoney)}</span></div>
    </div>
    <button id="btn-next-day" class="btn-primary">Qua ngày mới</button>
  `;

  document.getElementById('btn-next-day')?.addEventListener('click', () => {
    const s = getState();
    delete s._rentAppliedForDay; // reset cờ cho ngày mới
    startNewDay(s);
    window.__game?.showScreen('home');
  });
}

export function initSummaryScreen() {
  if (summaryBound) return;
  summaryBound = true;
  // Không cần bind thêm vì render mỗi lần vào màn
}

export function showSummaryScreen() {
  console.log('>>> showSummaryScreen được gọi');
  renderSummary();
}