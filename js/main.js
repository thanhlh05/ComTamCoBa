// js/main.js — Điểm khởi động, chuyển màn hình, điều khiển bottom nav
import {
  loadState,
  getDefaultState,
  getState,
  saveState,
  buyIngredient,
  buyUpgrade,
  applyOvernightSpoilage,
  startNewDay,
} from './state.js';
import { initPrepScreen, renderPrepScreen } from './prep.js';
import {
  initServiceScreen,
  startService,
  stopServiceLoop,
  getServiceState,
  finishDay,
  startServiceLoop,
} from './service.js';
import { handleGrillClick, getGrillSlots, getTray } from './grill.js';
import { initSummaryScreen, showSummaryScreen } from './summary.js';
import { initPauseMenu, registerServiceFunctions } from './pausemenu.js';
import { initTutorial, showTutorialScreen, needsTutorial } from './tutorial.js';
import { initNav, updateNav } from './nav.js';
import { initHomeScreen, renderHomeScreen } from './home.js';
import { initSettingsScreen, renderSettingsScreen } from './settings.js';

// Danh sách màn hình hợp lệ
const VALID_SCREENS = ['title', 'tutorial', 'home', 'prep', 'service', 'summary', 'revenue', 'settings'];

// Lazy lookup — DOM sẵn sàng khi ES module chạy
function getScreens() {
  return {
    title: document.getElementById('screen-title'),
    tutorial: document.getElementById('screen-tutorial'),
    home: document.getElementById('screen-home'),
    prep: document.getElementById('screen-prep'),
    service: document.getElementById('screen-service'),
    summary: document.getElementById('screen-summary'),
    revenue: document.getElementById('screen-revenue'),
    settings: document.getElementById('screen-settings'),
  };
}

export function showScreen(name) {
  const nextName = VALID_SCREENS.includes(name) ? name : 'title';
  const screens = getScreens();

  Object.entries(screens).forEach(([key, screen]) => {
    if (screen) screen.classList.toggle('active', key === nextName);
  });

  // Cập nhật bottom nav
  updateNav(nextName);

  // Logic riêng từng màn
  if (nextName === 'tutorial') {
    showTutorialScreen();
  } else if (nextName === 'home') {
    stopServiceLoop();
    renderHomeScreen();
  } else if (nextName === 'prep') {
    stopServiceLoop();
    renderPrepScreen();
  } else if (nextName === 'service') {
    startService();
  } else if (nextName === 'summary') {
    stopServiceLoop();
    showSummaryScreen();
  } else if (nextName === 'settings') {
    renderSettingsScreen();
  } else {
    stopServiceLoop();
  }
}

function initializeGame() {
  const state = loadState();
  if (!state || Object.keys(state).length === 0) {
    saveState(getDefaultState());
  }

  // Khởi tạo các màn hình
  initTutorial({
    onDone: () => showScreen('home'),
  });

  initNav({
    onTabChange: (target) => showScreen(target),
  });

  initHomeScreen({
    onOpenPrep: () => showScreen('prep'),
  });

  initPrepScreen({
    onOpenService: () => showScreen('service'),
  });

  initServiceScreen();
  registerServiceFunctions(stopServiceLoop, startServiceLoop, finishDay);
  initPauseMenu();
  initSummaryScreen();
  initSettingsScreen();

  // Nút Start → tutorial (lần đầu) hoặc thẳng home (người chơi cũ)
  document.getElementById('start-button')?.addEventListener('click', () => {
    if (needsTutorial()) {
      showScreen('tutorial');
    } else {
      showScreen('home');
    }
  });

  // Màn hình mặc định
  showScreen('title');
}

document.addEventListener('DOMContentLoaded', () => {
  initializeGame();
});



window.__game = {
  showScreen,
  getState,
  loadState,
  saveState,
  buyIngredient,
  buyUpgrade,
  applyOvernightSpoilage,
  startNewDay,
  getServiceState,
  handleGrillClick,
  getGrillSlots,
  getTray,
  finishDay,
  startServiceLoop,
  stopServiceLoop,
};