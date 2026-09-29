// js/nav.js — Bottom nav 4 tab (mục 14 GAME_DESIGN.md)
// Ẩn hoàn toàn khi ở màn: service, title, tutorial
// Hiện ở: home, prep, revenue, settings, summary (summary vẫn full-screen nhưng nav xuất hiện)
// Sau "Qua ngày mới": showScreen('home') → nav hiện lại

let _onTabChange = null; // callback(tabName)
let _currentScreen = 'title';

const NAV_HIDDEN_SCREENS = new Set(['service', 'title', 'tutorial']);

/**
 * Khởi tạo bottom nav.
 * @param {function} onTabChange - Gọi khi người chơi bấm tab, nhận tên màn hình.
 */
export function initNav({ onTabChange }) {
  _onTabChange = onTabChange;

  const tabs = document.querySelectorAll('.bottom-nav-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      if (target && _onTabChange) _onTabChange(target);
    });
  });
}

/**
 * Cập nhật trạng thái hiển thị nav và tab đang active.
 * @param {string} screenName - Tên màn hình hiện tại.
 */
export function updateNav(screenName) {
  _currentScreen = screenName;
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;

  // Ẩn hoàn toàn khi đang ở màn service/title/tutorial
  if (NAV_HIDDEN_SCREENS.has(screenName)) {
    nav.classList.add('hidden');
    return;
  }

  // Màn summary vẫn giữ nav (nhưng summary full-screen nằm trên)
  nav.classList.remove('hidden');

  // Đánh dấu tab đang active (chỉ với 4 tab chính)
  const tabs = nav.querySelectorAll('.bottom-nav-tab');
  tabs.forEach((tab) => {
    const target = tab.dataset.target;
    // home và summary đều "active" tab Quán khi ở summary
    const isActive =
      target === screenName ||
      (screenName === 'summary' && target === 'home');
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
}
