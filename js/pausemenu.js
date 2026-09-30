import { getState, saveState } from './state.js';

let pauseMenuBound = false;
let isMenuOpen = false;
let stopServiceLoopFn = null;
let startServiceLoopFn = null;
let finishDayFn = null;
let beginEarlyCloseFn = null; // M23

/**
 * Đăng ký các hàm service cần gọi.
 * Gọi từ main.js để tránh circular dependency.
 */
export function registerServiceFunctions(stop, start, finish, beginEarlyClose) {
  stopServiceLoopFn = stop;
  startServiceLoopFn = start;
  finishDayFn = finish;
  beginEarlyCloseFn = beginEarlyClose; // M23
}

function showServiceToast(message) {
  const toastEl = document.getElementById('service-toast');
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  setTimeout(() => toastEl.classList.add('hidden'), 2000);
}

function showPauseMenu() {
  const overlay = document.getElementById('pause-menu-overlay');
  if (!overlay) return;
  
  overlay.classList.remove('hidden');
  isMenuOpen = true;
  if (stopServiceLoopFn) stopServiceLoopFn();
}

function closePauseMenu() {
  const overlay = document.getElementById('pause-menu-overlay');
  if (!overlay) return;
  
  overlay.classList.add('hidden');
  isMenuOpen = false;
  if (startServiceLoopFn) startServiceLoopFn();
}

function toggleAudio() {
  const state = getState();
  state.soundEnabled = !state.soundEnabled;
  saveState(state);
  updateAudioButton();
  showServiceToast(`Âm thanh ${state.soundEnabled ? '📢 bật' : '🔇 tắt'}`);
}

function updateAudioButton() {
  const state = getState();
  const btn = document.getElementById('btn-pause-audio');
  if (!btn) return;
  btn.textContent = state.soundEnabled ? '🔊 Âm thanh' : '🔇 Tắt tiếng';
}

function showConfirmDialog(message, onConfirm) {
  const dialog = document.getElementById('pause-confirm-dialog');
  if (!dialog) return;
  
  const msgEl = document.getElementById('pause-confirm-message');
  if (msgEl) msgEl.textContent = message;
  
  const confirmBtn = document.getElementById('pause-confirm-yes');
  const cancelBtn = document.getElementById('pause-confirm-no');
  
  dialog.classList.remove('hidden');
  
  // Xóa listener cũ
  confirmBtn?.removeEventListener('click', confirmBtn._boundHandler);
  cancelBtn?.removeEventListener('click', cancelBtn._boundHandler);
  
  confirmBtn._boundHandler = () => {
    dialog.classList.add('hidden');
    onConfirm();
  };
  cancelBtn._boundHandler = () => {
    dialog.classList.add('hidden');
  };
  
  confirmBtn?.addEventListener('click', confirmBtn._boundHandler);
  cancelBtn?.addEventListener('click', cancelBtn._boundHandler);
}

function confirmEarlyClose() {
  showConfirmDialog('Đóng cửa sớm? Hệ thống sẽ ngừng nhận khách mới và phục vụ hết khách đang chờ.', () => {
    // Đóng overlay pause và đảm bảo service loop chạy lại
    closePauseMenu();

    // M23 — ngừng spawn khách mới, nhưng tiếp tục phục vụ queue
    if (beginEarlyCloseFn) {
      beginEarlyCloseFn();
    }
  });
}

/**
 * Rollback toàn bộ ngày: quay lại Chuẩn bị với tiền/tồn kho như trước khi bấm "Mở bán"
 */
function confirmExitToPrep() {
  showConfirmDialog('Thoát sẽ MẤT toàn bộ tiến trình ngày hôm nay, bạn có chắc không?', () => {
    const state = getState();
    
    // Khôi phục backup state (ngày vẫn bằng hiện tại, nhưng tiền/kho như trước bán)
    if (state._dayBackupBeforeService) {
      const backup = state._dayBackupBeforeService;
      state.money = backup.money;
      state.inventory = { ...backup.inventory };
      state.loanUsed = backup.loanUsed;
      delete state._dayBackupBeforeService;
      delete state._rentAppliedForDay;
    }
    
    saveState(state);
    if (stopServiceLoopFn) stopServiceLoopFn();
    closePauseMenu();
    
    // Quay lại tab Chuẩn bị
    setTimeout(() => window.__game?.showScreen('prep'), 100);
  });
}

export function initPauseMenu() {
  if (pauseMenuBound) return;
  pauseMenuBound = true;
  
  const pauseBtn = document.getElementById('btn-pause-menu');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', showPauseMenu);
  }
  
  const closeBtn = document.getElementById('btn-pause-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePauseMenu);
  }
  
  const continueBtn = document.getElementById('btn-pause-continue');
  if (continueBtn) {
    continueBtn.addEventListener('click', closePauseMenu);
  }
  
  const audioBtn = document.getElementById('btn-pause-audio');
  if (audioBtn) {
    audioBtn.addEventListener('click', toggleAudio);
  }
  
  const earlyCloseBtn = document.getElementById('btn-pause-early-close');
  if (earlyCloseBtn) {
    earlyCloseBtn.addEventListener('click', confirmEarlyClose);
  }
  
  const exitPrepBtn = document.getElementById('btn-pause-exit-prep');
  if (exitPrepBtn) {
    exitPrepBtn.addEventListener('click', confirmExitToPrep);
  }
  
  // Đóng menu khi bấm ngoài overlay
  const overlay = document.getElementById('pause-menu-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closePauseMenu();
      }
    });
  }
  
  updateAudioButton();
}

export function getPauseMenuState() {
  return { isMenuOpen };
}
