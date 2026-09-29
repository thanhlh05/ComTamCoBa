// js/tutorial.js — Hướng dẫn 4 thẻ + Đặt tên quán (mục 13, 18)
import { getState, saveState } from './state.js';

let _onDone = null;       // callback sau khi đặt tên xong → home
let _guideReturnTo = 'title'; // sau khi xem hướng dẫn (lần cũ) quay về đâu

const GUIDE_CARDS = [
  {
    icon: '🔥',
    title: 'Nướng sườn',
    desc: 'Chạm ô trống trên vỉ để đặt sườn. Canh độ chín vàng (60–90%) rồi chạm gắp vào khay. Để cháy là phế!',
  },
  {
    icon: '👥',
    title: 'Nhận đơn',
    desc: 'Khách xếp hàng phía trên. Chạm vào khách để chọn đơn đang phục vụ. Thanh màu là độ kiên nhẫn — hết là bỏ đi!',
  },
  {
    icon: '🍽️',
    title: 'Lắp đĩa',
    desc: 'Chạm nút món dưới khay để xếp vào đĩa. Sườn lấy từ khay đã nướng. Sai món vẫn giao được nhưng sao thấp.',
  },
  {
    icon: '🚀',
    title: 'Giao hàng',
    desc: 'Đủ món thì bấm Giao đĩa. Giao nhanh, sườn chín vàng = nhiều sao và tiền boa. Chúc Cô Ba buôn may bán đắt!',
  },
];

let guideIndex = 0;

export function initTutorial({ onDone }) {
  _onDone = onDone;

  // --- Form đặt tên quán ---
  const form = document.getElementById('tutorial-name-form');
  const input = document.getElementById('tutorial-shop-input');
  const btn = document.getElementById('tutorial-name-confirm');
  const counter = document.getElementById('tutorial-name-counter');

  if (form && input && btn) {
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

  // --- Hướng dẫn 4 thẻ ---
  document.getElementById('guide-btn-next')?.addEventListener('click', onGuideNext);
  document.getElementById('guide-btn-skip')?.addEventListener('click', finishGuide);

  // Link "Hướng dẫn" trên màn Start
  document.getElementById('title-guide-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    openGuideManual();
  });
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

/** Hiện màn đặt tên quán */
export function showTutorialScreen() {
  const input = document.getElementById('tutorial-shop-input');
  const btn = document.getElementById('tutorial-name-confirm');
  const counter = document.getElementById('tutorial-name-counter');
  if (input) {
    input.value = '';
    if (counter) counter.textContent = '0/20';
    if (btn) btn.disabled = true;
    requestAnimationFrame(() => input.focus());
  }
}

/** true = lần đầu, chưa xong onboarding (hướng dẫn hoặc đặt tên) */
export function needsTutorial() {
  const state = getState();
  return !state.guideSeen || !state.tutorialDone;
}

/** Luồng lần đầu sau Start: hướng dẫn → tên → home */
export function startFirstTimeFlow() {
  const state = getState();
  if (!state.guideSeen) {
    _guideReturnTo = 'afterGuideFirst';
    showGuideCards();
  } else if (!state.tutorialDone) {
    window.__game?.showScreen('tutorial');
  } else {
    window.__game?.showScreen('home');
  }
}

/** Người chơi cũ bấm link Hướng dẫn */
function openGuideManual() {
  _guideReturnTo = 'title';
  showGuideCards();
}

function showGuideCards() {
  guideIndex = 0;
  const overlay = document.getElementById('guide-overlay');
  if (overlay) overlay.classList.remove('hidden');
  renderGuideCard();
}

function renderGuideCard() {
  const card = GUIDE_CARDS[guideIndex];
  if (!card) return;

  const iconEl = document.getElementById('guide-icon');
  const titleEl = document.getElementById('guide-title');
  const descEl = document.getElementById('guide-desc');
  const dotsEl = document.getElementById('guide-dots');
  const nextBtn = document.getElementById('guide-btn-next');

  if (iconEl) iconEl.textContent = card.icon;
  if (titleEl) titleEl.textContent = card.title;
  if (descEl) descEl.textContent = card.desc;
  if (nextBtn) {
    nextBtn.textContent = guideIndex >= GUIDE_CARDS.length - 1 ? 'Xong!' : 'Tiếp';
  }
  if (dotsEl) {
    dotsEl.innerHTML = GUIDE_CARDS.map((_, i) =>
      `<span class="guide-dot ${i === guideIndex ? 'active' : ''}"></span>`
    ).join('');
  }
}

function onGuideNext() {
  if (guideIndex < GUIDE_CARDS.length - 1) {
    guideIndex += 1;
    renderGuideCard();
  } else {
    finishGuide();
  }
}

function finishGuide() {
  const state = getState();
  state.guideSeen = true;
  saveState(state);

  const overlay = document.getElementById('guide-overlay');
  if (overlay) overlay.classList.add('hidden');

  if (_guideReturnTo === 'afterGuideFirst') {
    // Lần đầu: sang đặt tên quán
    if (!state.tutorialDone) {
      window.__game?.showScreen('tutorial');
    } else {
      window.__game?.showScreen('home');
    }
  } else {
    // Người chơi cũ: về Start
    window.__game?.showScreen('title');
  }
}