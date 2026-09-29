// js/tutorial.js — màn Đặt tên quán (mục 13, 18 GAME_DESIGN.md)
// Lần đầu chơi: hiện màn này để nhập tên quán, lưu vào state.shopName
// Người chơi cũ (đã có save với tutorialDone=true): bỏ qua

import { getState, saveState } from './state.js';

let _onDone = null; // callback khi đặt tên xong

/**
 * Khởi tạo màn Đặt tên quán.
 * @param {function} onDone - Gọi khi người chơi xác nhận tên.
 */
export function initTutorial({ onDone }) {
  _onDone = onDone;

  const form = document.getElementById('tutorial-name-form');
  const input = document.getElementById('tutorial-shop-input');
  const btn = document.getElementById('tutorial-name-confirm');
  const counter = document.getElementById('tutorial-name-counter');

  if (!form || !input || !btn) return;

  // Hiện đếm ký tự
  input.addEventListener('input', () => {
    const len = input.value.length;
    if (counter) counter.textContent = `${len}/20`;
    btn.disabled = len === 0;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    confirmName();
  });

  btn.addEventListener('click', () => confirmName());
}

function confirmName() {
  const input = document.getElementById('tutorial-shop-input');
  if (!input) return;

  const name = input.value.trim();
  if (!name) {
    input.focus();
    return;
  }

  const state = getState();
  state.shopName = name;
  state.tutorialDone = true;
  saveState(state);

  if (_onDone) _onDone();
}

/**
 * Chuẩn bị và hiện màn Đặt tên quán.
 * Đặt lại giá trị input về rỗng + placeholder.
 */
export function showTutorialScreen() {
  const input = document.getElementById('tutorial-shop-input');
  const btn = document.getElementById('tutorial-name-confirm');
  const counter = document.getElementById('tutorial-name-counter');

  if (input) {
    input.value = '';
    if (counter) counter.textContent = '0/20';
    if (btn) btn.disabled = true;
    // Focus input sau khi màn được hiện
    requestAnimationFrame(() => input.focus());
  }
}

/**
 * Kiểm tra người chơi có cần qua màn Đặt tên quán không.
 * Trả về true nếu cần (lần đầu), false nếu đã có save.
 */
export function needsTutorial() {
  const state = getState();
  return !state.tutorialDone;
}
