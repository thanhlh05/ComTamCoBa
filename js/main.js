import { loadState, getDefaultState } from './state.js';

const screens = {
  title: document.getElementById('screen-title'),
  prep: document.getElementById('screen-prep'),
  service: document.getElementById('screen-service'),
  summary: document.getElementById('screen-summary'),
};

export function showScreen(name) {
  const nextName = ['title', 'prep', 'service', 'summary'].includes(name) ? name : 'title';

  Object.entries(screens).forEach(([key, screen]) => {
    screen.classList.toggle('active', key === nextName);
  });
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
    localStorage.setItem('com_tam_save_v1', JSON.stringify(getDefaultState()));
  }
  showScreen('title');
}

document.addEventListener('DOMContentLoaded', () => {
  bindNavigation();
  initializeGame();
});

window.__game = { showScreen };
