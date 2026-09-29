// js/settings.js — Tab Cài đặt (mục 16 GAME_DESIGN.md)
// Âm thanh, giờ mở/đóng, thời lượng bán, ID sao lưu, Chơi lại từ đầu

import { getState, saveState } from './state.js';
import { GAME_DATA } from './data.js';

const MIN_HOUR = GAME_DATA.timing.minHour; // 5
const MAX_HOUR = GAME_DATA.timing.maxHour; // 23

let settingsBound = false;

/** Render toàn bộ nội dung tab Cài đặt */
export function renderSettingsScreen() {
  const container = document.getElementById('settings-content');
  if (!container) return;

  const state = getState();
  const openHour = Number(state.openHour ?? 5);
  const closeHour = Number(state.closeHour ?? 23);
  const dur = Number(state.dayDurationMinutes ?? 3);
  const sound = state.soundEnabled !== false;

  container.innerHTML = `
    <!-- Âm thanh -->
    <div class="settings-section">
      <div class="settings-row">
        <div class="settings-label">
          <span class="settings-icon">🔊</span>
          <span>Âm thanh</span>
        </div>
        <button id="settings-sound-toggle" class="toggle-btn ${sound ? 'on' : ''}" type="button"
          aria-label="Bật/tắt âm thanh" aria-pressed="${sound}">
          ${sound ? 'Bật' : 'Tắt'}
        </button>
      </div>
    </div>

    <!-- Giờ mở/đóng quán -->
    <div class="settings-section">
      <h3 class="settings-section-title">⏰ Giờ mở quán</h3>
      <p class="settings-note">Áp dụng từ ngày bán tiếp theo.</p>

      <div class="settings-row">
        <div class="settings-label">
          <span class="settings-icon">🟢</span>
          <span>Giờ mở</span>
        </div>
        <div class="hour-picker" id="open-hour-picker">
          <button class="hour-btn" id="open-hour-dec" type="button" aria-label="Giảm giờ mở">−</button>
          <span class="hour-display" id="open-hour-display">${formatHour(openHour)}</span>
          <button class="hour-btn" id="open-hour-inc" type="button" aria-label="Tăng giờ mở">+</button>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-label">
          <span class="settings-icon">🔴</span>
          <span>Giờ đóng</span>
        </div>
        <div class="hour-picker" id="close-hour-picker">
          <button class="hour-btn" id="close-hour-dec" type="button" aria-label="Giảm giờ đóng">−</button>
          <span class="hour-display" id="close-hour-display">${formatHour(closeHour)}</span>
          <button class="hour-btn" id="close-hour-inc" type="button" aria-label="Tăng giờ đóng">+</button>
        </div>
      </div>

      <p class="settings-duration-preview" id="hour-range-preview">
        ${buildHourPreview(openHour, closeHour)}
      </p>
    </div>

    <!-- Thời lượng bán -->
    <div class="settings-section">
      <h3 class="settings-section-title">⏱ Thời lượng bán mỗi ngày</h3>
      <p class="settings-note">Áp dụng từ ngày bán tiếp theo.</p>
      <div class="duration-options" role="group" aria-label="Thời lượng bán">
        ${GAME_DATA.timing.durationOptions.map(m => `
          <button class="duration-btn ${dur === m ? 'active' : ''}"
            data-minutes="${m}" type="button">${m} phút</button>
        `).join('')}
      </div>
    </div>

    <!-- ID sao lưu -->
    <div class="settings-section">
      <h3 class="settings-section-title">💾 ID sao lưu</h3>
      <p class="settings-note">Lưu mã này lại để khôi phục trên máy khác.</p>
      <div class="backup-code-box">
        <code id="backup-code-text" class="backup-code-text">${getBackupCode()}</code>
      </div>
      <button id="settings-copy-backup" class="settings-secondary-btn" type="button">
        📋 Sao chép
      </button>
      <p id="backup-copy-status" class="settings-note backup-status"></p>

      <h3 class="settings-section-title" style="margin-top:14px">📥 Nhập ID sao lưu</h3>
      <textarea id="backup-import-input" class="backup-import-input" rows="3"
        placeholder="Dán mã sao lưu vào đây..." autocomplete="off"></textarea>
      <button id="settings-restore-backup" class="settings-secondary-btn" type="button">
        ♻️ Khôi phục
      </button>
      <p id="backup-import-error" class="settings-error hidden"></p>
    </div>


    <!-- Chơi lại từ đầu -->
    <div class="settings-section">
      <h3 class="settings-section-title">⚠️ Nguy hiểm</h3>
      <button id="settings-reset-btn" class="settings-danger-btn" type="button">
        🗑️ Chơi lại từ đầu
      </button>
    </div>
  `;

  // Bind events sau khi render
  bindSettingsEvents();

  // Cập nhật trạng thái disabled nút +/- ngay lần đầu
  updateHourBtnStates(openHour, closeHour);
}

function bindSettingsEvents() {
  // Âm thanh
  document.getElementById('settings-sound-toggle')?.addEventListener('click', () => {
    const state = getState();
    state.soundEnabled = !state.soundEnabled;
    saveState(state);
    const btn = document.getElementById('settings-sound-toggle');
    if (btn) {
      btn.classList.toggle('on', state.soundEnabled);
      btn.textContent = state.soundEnabled ? 'Bật' : 'Tắt';
      btn.setAttribute('aria-pressed', state.soundEnabled);
    }
  });

  // Giờ mở
  document.getElementById('open-hour-dec')?.addEventListener('click', () => adjustHour('open', -1));
  document.getElementById('open-hour-inc')?.addEventListener('click', () => adjustHour('open', +1));

  // Giờ đóng
  document.getElementById('close-hour-dec')?.addEventListener('click', () => adjustHour('close', -1));
  document.getElementById('close-hour-inc')?.addEventListener('click', () => adjustHour('close', +1));

  // Thời lượng
  document.querySelector('.duration-options')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.duration-btn');
    if (!btn) return;
    const minutes = Number(btn.dataset.minutes);
    if (!GAME_DATA.timing.durationOptions.includes(minutes)) return;
    const state = getState();
    state.dayDurationMinutes = minutes;
    saveState(state);
    document.querySelectorAll('.duration-btn').forEach(b => {
      b.classList.toggle('active', Number(b.dataset.minutes) === minutes);
    });
  });

  // Chơi lại
  document.getElementById('settings-reset-btn')?.addEventListener('click', confirmReset);

  // Sao chép ID
  document.getElementById('settings-copy-backup')?.addEventListener('click', copyBackupCode);

  // Khôi phục
  document.getElementById('settings-restore-backup')?.addEventListener('click', () => {
    const input = document.getElementById('backup-import-input');
    const code = (input?.value || '').trim();
    const errEl = document.getElementById('backup-import-error');
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.add('hidden');
    }
    if (!code) {
      if (errEl) {
        errEl.textContent = 'Chưa nhập mã sao lưu.';
        errEl.classList.remove('hidden');
      }
      return;
    }
    if (!isValidBackupCode(code)) {
      if (errEl) {
        errEl.textContent = 'Mã không hợp lệ. Kiểm tra lại rồi thử lại.';
        errEl.classList.remove('hidden');
      }
      return;
    }
    const dialog = document.getElementById('settings-restore-dialog');
    if (dialog) dialog.classList.remove('hidden');
  });
}

/** Điều chỉnh giờ mở hoặc đóng, áp đặt ràng buộc */
function adjustHour(type, delta) {
  const state = getState();
  let openHour = Number(state.openHour ?? 5);
  let closeHour = Number(state.closeHour ?? 23);

  if (type === 'open') {
    const next = openHour + delta;
    // Phải nằm trong [MIN_HOUR, MAX_HOUR] và < closeHour
    if (next < MIN_HOUR || next >= closeHour) return;
    openHour = next;
    state.openHour = openHour;
  } else {
    const next = closeHour + delta;
    // Phải nằm trong [MIN_HOUR, MAX_HOUR] và > openHour
    if (next > MAX_HOUR || next <= openHour) return;
    closeHour = next;
    state.closeHour = closeHour;
  }

  saveState(state);

  // Cập nhật hiển thị
  const openDisp = document.getElementById('open-hour-display');
  const closeDisp = document.getElementById('close-hour-display');
  const preview = document.getElementById('hour-range-preview');
  if (openDisp) openDisp.textContent = formatHour(openHour);
  if (closeDisp) closeDisp.textContent = formatHour(closeHour);
  if (preview) preview.textContent = buildHourPreview(openHour, closeHour);

  // Cập nhật trạng thái disabled cho nút dec/inc
  updateHourBtnStates(openHour, closeHour);
}

function updateHourBtnStates(openHour, closeHour) {
  const openDec = document.getElementById('open-hour-dec');
  const openInc = document.getElementById('open-hour-inc');
  const closeDec = document.getElementById('close-hour-dec');
  const closeInc = document.getElementById('close-hour-inc');

  if (openDec) openDec.disabled = openHour <= MIN_HOUR;
  if (openInc) openInc.disabled = openHour >= closeHour - 1;
  if (closeDec) closeDec.disabled = closeHour <= openHour + 1;
  if (closeInc) closeInc.disabled = closeHour >= MAX_HOUR;
}

function buildHourPreview(open, close) {
  const totalMins = (close - open) * 60;
  return `${formatHour(open)} – ${formatHour(close)} (${totalMins} phút trong game)`;
}

function formatHour(h) {
  return `${String(h).padStart(2, '0')}:00`;
}

/** Hộp thoại xác nhận Chơi lại từ đầu */
function confirmReset() {
  // Dùng confirm dialog của pausemenu (tương tự) — tạo riêng trong settings
  const overlay = document.getElementById('settings-reset-dialog');
  if (overlay) overlay.classList.remove('hidden');
}

/** Lấy chuỗi base64 của save hiện tại */
function getBackupCode() {
  try {
    const raw = localStorage.getItem('com_tam_save_v1') || '';
    if (!raw) return '(chưa có dữ liệu lưu)';
    return btoa(unescape(encodeURIComponent(raw)));
  } catch {
    return '(lỗi tạo mã)';
  }
}

/** Kiểm tra mã có giải mã được và là JSON hợp lệ không */
function isValidBackupCode(code) {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const data = JSON.parse(json);
    return data && typeof data === 'object' && ('money' in data || 'day' in data);
  } catch {
    return false;
  }
}

function copyBackupCode() {
  const text = document.getElementById('backup-code-text')?.textContent || '';
  const status = document.getElementById('backup-copy-status');
  if (!text || text.startsWith('(')) {
    if (status) status.textContent = 'Không có mã để sao chép.';
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    if (status) status.textContent = '✓ Đã sao chép!';
    setTimeout(() => { if (status) status.textContent = ''; }, 2000);
  }).catch(() => {
    // Fallback cho trình duyệt cũ
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      if (status) status.textContent = '✓ Đã sao chép!';
    } catch {
      if (status) status.textContent = 'Không sao chép được. Hãy chọn và copy thủ công.';
    }
    document.body.removeChild(ta);
    setTimeout(() => { if (status) status.textContent = ''; }, 2500);
  });
}

function applyRestore() {
  const input = document.getElementById('backup-import-input');
  const code = (input?.value || '').trim();
  const errEl = document.getElementById('backup-import-error');
  try {
    const json = decodeURIComponent(escape(atob(code)));
    const data = JSON.parse(json);
    if (!data || typeof data !== 'object') throw new Error('invalid');
    localStorage.setItem('com_tam_save_v1', json);
    document.getElementById('settings-restore-dialog')?.classList.add('hidden');
    location.reload();
  } catch {
    document.getElementById('settings-restore-dialog')?.classList.add('hidden');
    if (errEl) {
      errEl.textContent = 'Mã không hợp lệ. Save hiện tại không bị thay đổi.';
      errEl.classList.remove('hidden');
    }
  }
}

export function initSettingsScreen() {
  if (settingsBound) return;
  settingsBound = true;

  // Dialog chơi lại từ đầu
  document.getElementById('settings-reset-confirm')?.addEventListener('click', () => {
    localStorage.removeItem('com_tam_save_v1');
    document.getElementById('settings-reset-dialog')?.classList.add('hidden');
    location.reload();
  });
  document.getElementById('settings-reset-cancel')?.addEventListener('click', () => {
    document.getElementById('settings-reset-dialog')?.classList.add('hidden');
  });

  // Dialog xác nhận khôi phục
  document.getElementById('settings-restore-confirm')?.addEventListener('click', applyRestore);
  document.getElementById('settings-restore-cancel')?.addEventListener('click', () => {
    document.getElementById('settings-restore-dialog')?.classList.add('hidden');
  });
}
