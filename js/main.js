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

const screens = {
  title: document.getElementById('screen-title'),
  prep: document.getElementById('screen-prep'),
  service: document.getElementById('screen-service'),
  summary: document.getElementById('screen-summary'),
};

export function showScreen(name) {
  const nextName = ['title', 'prep', 'service', 'summary'].includes(name) ? name : 'title';

  Object.entries(screens).forEach(([key, screen]) => {
    if (screen) screen.classList.toggle('active', key === nextName);
  });

  if (nextName === 'prep') {
    stopServiceLoop();
    renderPrepScreen();
  } else if (nextName === 'service') {
    startService();
  } else if (nextName === 'summary') {
    stopServiceLoop();
    showSummaryScreen();
  } else {
    stopServiceLoop();
  }
}

function bindNavigation() {
  document.getElementById('start-button')?.addEventListener('click', () => showScreen('prep'));

  document.querySelectorAll('[data-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-target');
      if (target) showScreen(target);
    });
  });
}

function initializeGame() {
  const state = loadState();
  if (!state || Object.keys(state).length === 0) {
    saveState(getDefaultState());
  }

  initPrepScreen({
    onOpenService: () => showScreen('service'),
  });

  initServiceScreen();
  registerServiceFunctions(stopServiceLoop, startServiceLoop, finishDay);
  initPauseMenu();
  initSummaryScreen();

  showScreen('title');
}

document.addEventListener('DOMContentLoaded', () => {
  bindNavigation();
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