import { getState, buyIngredient, buyUpgrade } from './state.js';
import { GAME_DATA, ASSETS } from './data.js';
import { formatMoney, formatStar } from './ui.js';

let activeTab = 'ingredients';
let cachedOnOpenService = null;

/**
 * Hiển thị toàn bộ màn hình chuẩn bị (HUD + nội dung tab đang chọn).
 */
export function renderPrepScreen() {
  const state = getState();

  // 1. Cập nhật HUD: Ngày, Tiền, Sao
  const dayEl = document.getElementById('prep-hud-day');
  const moneyEl = document.getElementById('prep-hud-money');
  const starEl = document.getElementById('prep-hud-star');

  if (dayEl) dayEl.textContent = `Ngày ${state.day || 1}`;
  if (moneyEl) moneyEl.textContent = formatMoney(state.money);
  if (starEl) starEl.textContent = formatStar(state.star || 4.0);

  // 2. Cập nhật trạng thái Tab bar
  const tabIngredientsBtn = document.getElementById('prep-tab-ingredients');
  const tabUpgradesBtn = document.getElementById('prep-tab-upgrades');

  if (tabIngredientsBtn && tabUpgradesBtn) {
    const isIng = activeTab === 'ingredients';
    tabIngredientsBtn.classList.toggle('active', isIng);
    tabIngredientsBtn.setAttribute('aria-selected', String(isIng));
    tabUpgradesBtn.classList.toggle('active', !isIng);
    tabUpgradesBtn.setAttribute('aria-selected', String(!isIng));
  }

  // 3. Render danh sách theo tab
  const contentEl = document.getElementById('prep-content');
  if (!contentEl) return;

  if (activeTab === 'ingredients') {
    contentEl.innerHTML = renderIngredientsList(state);
  } else {
    contentEl.innerHTML = renderUpgradesList(state);
  }
}

/**
 * Tạo HTML danh sách nguyên liệu theo mục 3 GAME_DESIGN.
 */
function renderIngredientsList(state) {
  const items = Object.values(GAME_DATA.menu);

  return items
    .map((item) => {
      const icon = ASSETS[item.id] || '🍚';
      const stock = state.inventory?.[item.id] || 0;
      const isLocked = (item.id === 'cha' || item.id === 'canh') && !Boolean(state.upgrades?.unlockMenu);
      const batchCost = item.cost * 10;
      const canAfford = !isLocked && state.money >= batchCost;

      const metaHtml = isLocked
        ? '<span class="lock-tag">🔒 Cần mở khóa nâng cấp</span>'
        : `Vốn: <strong>${formatMoney(item.cost)}</strong>/phần`;

      const btnText = isLocked
        ? 'Chưa mở'
        : `Mua lố 10<small>${formatMoney(batchCost)}</small>`;

      return `
        <div class="prep-card ${isLocked ? 'locked' : ''}">
          <div class="card-info">
            <div class="card-icon" aria-hidden="true">${icon}</div>
            <div class="card-details">
              <div class="card-name">${item.name}</div>
              <div class="card-meta">${metaHtml}</div>
              <div class="card-stock">Tồn kho: <strong>${stock}</strong> phần</div>
            </div>
          </div>
          <div class="card-action">
            <button
              type="button"
              class="buy-btn ${!canAfford ? 'disabled' : ''}"
              data-action="buy-ingredient"
              data-id="${item.id}"
              ${canAfford ? '' : 'disabled'}
              aria-label="Mua 10 phần ${item.name}"
            >
              ${btnText}
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

/**
 * Tạo HTML danh sách nâng cấp theo mục 8 GAME_DESIGN.
 */
function renderUpgradesList(state) {
  const upgrades = Object.values(GAME_DATA.upgrades);

  return upgrades
    .map((upgrade) => {
      const icon = ASSETS[upgrade.id] || '⭐';
      const currentLevel = Number(state.upgrades?.[upgrade.id]) || 0;
      const isMax = currentLevel >= upgrade.limit;
      const cost = isMax
        ? 0
        : Array.isArray(upgrade.cost)
        ? upgrade.cost[currentLevel]
        : upgrade.cost;
      const canAfford = !isMax && state.money >= cost;

      let statusHtml = '';
      if (upgrade.limit === 1) {
        statusHtml = isMax
          ? '<span class="status-tag success">Đã sở hữu</span>'
          : '<span class="status-tag">Chưa mua</span>';
      } else {
        statusHtml = isMax
          ? `<span class="status-tag success">Cấp ${currentLevel}/${upgrade.limit} (Tối đa)</span>`
          : `<span class="status-tag">Cấp ${currentLevel}/${upgrade.limit}</span>`;
      }

      const btnText = isMax
        ? 'Đã tối đa'
        : `Mua<small>${formatMoney(cost)}</small>`;

      return `
        <div class="prep-card ${isMax ? 'maxed' : ''}">
          <div class="card-info">
            <div class="card-icon" aria-hidden="true">${icon}</div>
            <div class="card-details">
              <div class="card-name">${upgrade.name}</div>
              <div class="card-meta">${upgrade.effect}</div>
              <div class="card-status">${statusHtml}</div>
            </div>
          </div>
          <div class="card-action">
            <button
              type="button"
              class="buy-btn ${!canAfford ? 'disabled' : ''}"
              data-action="buy-upgrade"
              data-id="${upgrade.id}"
              ${canAfford ? '' : 'disabled'}
              aria-label="Mua nâng cấp ${upgrade.name}"
            >
              ${btnText}
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

/**
 * Xử lý khi nhấn nút mua nguyên liệu hoặc nâng cấp.
 */
function handleContentClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;

  const { action, id } = button.dataset;
  if (!action || !id) return;

  if (action === 'buy-ingredient') {
    const result = buyIngredient(id, 10);
    if (result.success) {
      renderPrepScreen();
    }
  } else if (action === 'buy-upgrade') {
    const result = buyUpgrade(id);
    if (result.success) {
      renderPrepScreen();
    }
  }
}

/**
 * Khởi tạo sự kiện màn chuẩn bị.
 */
export function initPrepScreen(options = {}) {
  if (options.onOpenService) {
    cachedOnOpenService = options.onOpenService;
  }

  // Chuyển tab
  const tabIngredientsBtn = document.getElementById('prep-tab-ingredients');
  const tabUpgradesBtn = document.getElementById('prep-tab-upgrades');

  tabIngredientsBtn?.addEventListener('click', () => {
    activeTab = 'ingredients';
    renderPrepScreen();
  });

  tabUpgradesBtn?.addEventListener('click', () => {
    activeTab = 'upgrades';
    renderPrepScreen();
  });

  // Uỷ quyền sự kiện mua hàng trong danh sách
  const contentEl = document.getElementById('prep-content');
  contentEl?.addEventListener('click', handleContentClick);

  // Nút Mở bán
  const openServiceBtn = document.getElementById('btn-open-service');
  openServiceBtn?.addEventListener('click', () => {
    if (typeof cachedOnOpenService === 'function') {
      cachedOnOpenService();
    }
  });

  // Render lần đầu
  renderPrepScreen();
}
