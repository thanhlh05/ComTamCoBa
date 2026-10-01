import {
  getState,
  buyIngredient,
  buyUpgrade,
  discardIngredient,
  saveState,
  rollTodayCostEvent,
  getEffectiveCost,
  setStaffRestPending,
} from './state.js';
import { GAME_DATA, ASSETS } from './data.js';
import { formatMoney, formatStar } from './ui.js';
import {
  getPendingPrice,
  getActivePrice,
  adjustPendingPrice,
  getPriceLabel,
  priceBounds,
  ensurePriceMaps,
  getPendingComboPrice,
  comboPriceBounds,
  setPendingComboPrice,
} from './pricing.js';

let activeTab = 'ingredients';
let cachedOnOpenService = null;
let discardItemId = null;
let discardMax = 0;
let buyTargetId = null;
let buyQty = 10;

const PRICE_INPUT_MIN = 0;
const PRICE_INPUT_MAX = 1000000;

function sanitizeMenuPrice(rawValue) {
  if (rawValue === '' || rawValue === null || rawValue === undefined) return null;
  const str = String(rawValue).trim();
  if (str === '') return null;
  const numeric = Number(str);
  if (!Number.isFinite(numeric)) return null;
  const rounded = Math.round(numeric);
  return Math.max(PRICE_INPUT_MIN, Math.min(PRICE_INPUT_MAX, rounded));
}

/**
 * Hiển thị toàn bộ màn hình chuẩn bị (HUD + nội dung tab đang chọn).
 */
export function renderPrepScreen() {
  const state = getState();
  ensurePriceMaps(state);
  rollTodayCostEvent(state);

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
  const tabPricingBtn = document.getElementById('prep-tab-pricing');
  const tabDrinksBtn = document.getElementById('prep-tab-drinks');

  if (tabIngredientsBtn && tabUpgradesBtn && tabPricingBtn && tabDrinksBtn) {
    const isIng = activeTab === 'ingredients';
    const isUpgrade = activeTab === 'upgrades';
    const isPricing = activeTab === 'pricing';
    const isDrinks = activeTab === 'drinks';

    tabIngredientsBtn.classList.toggle('active', isIng);
    tabIngredientsBtn.setAttribute('aria-selected', String(isIng));
    tabUpgradesBtn.classList.toggle('active', isUpgrade);
    tabUpgradesBtn.setAttribute('aria-selected', String(isUpgrade));
    tabPricingBtn.classList.toggle('active', isPricing);
    tabPricingBtn.setAttribute('aria-selected', String(isPricing));
    tabDrinksBtn.classList.toggle('active', isDrinks);
    tabDrinksBtn.setAttribute('aria-selected', String(isDrinks));
  }

  // 3. Render danh sách theo tab
  const contentEl = document.getElementById('prep-content');
  if (!contentEl) return;

  if (activeTab === 'ingredients') {
    contentEl.innerHTML = renderIngredientsList(state);
  } else if (activeTab === 'pricing') {
    contentEl.innerHTML = renderPricingList(state);
  } else if (activeTab === 'drinks') {
    contentEl.innerHTML = renderDrinksList(state);
  } else {
    contentEl.innerHTML = renderUpgradesList(state);
  }
}

/**
 * Cảnh báo hao qua đêm (mục 22 / mục 3).
 */
function spoilageHint(itemId, stock, state) {
  if (stock <= 0) return '';

  const hasFridge = Boolean(state.upgrades?.fridge);
  const canSpoil =
    (itemId === 'suon' || itemId === 'cha') && !hasFridge;

  if (canSpoil) {
    const lost = Math.floor(stock * 0.5);
    return `<div class="spoil-hint spoil-warn">🟠 Qua đêm sẽ hao ${lost} phần</div>`;
  }

  return `<div class="spoil-hint spoil-ok">🟢 Không hao qua đêm</div>`;
}

function renderPriceRow(itemId, state) {
  const pending = getPendingPrice(itemId, state);
  const active = getActivePrice(itemId, state);
  const { min, max } = priceBounds(itemId);
  const label = getPriceLabel(itemId, pending);
  const labelHtml = label
    ? `<span class="price-label price-${label.kind}">${label.text}</span>`
    : '';
  const delayed =
    pending !== active
      ? `<span class="price-delayed">Áp dụng ngày bán tiếp theo</span>`
      : '';

  return `
    <div class="price-row">
      <span class="price-row-title">Giá bán</span>
      <div class="price-controls">
        <button type="button" class="price-btn" data-action="price-down" data-id="${itemId}" aria-label="Giảm giá">−</button>
        <span class="price-value">${formatMoney(pending)}</span>
        <button type="button" class="price-btn" data-action="price-up" data-id="${itemId}" aria-label="Tăng giá">+</button>
      </div>
      ${labelHtml}
      ${delayed}
      <span class="price-range">Khung ${formatMoney(min)} – ${formatMoney(max)}</span>
    </div>`;
}

/**
 * Tạo HTML danh sách nguyên liệu — M15 mua 1/5/10/tùy chỉnh.
 */
function renderIngredientsList(state) {
  const items = Object.values(GAME_DATA.menu).filter((item) => item.group !== 'drink');
  const ev = state.todayCostEvent;

  const banner = ev?.message
    ? `<div class="cost-event-banner">${ev.message}</div>`
    : '';

  return banner + items
    .map((item) => {
      const icon = ASSETS[item.id] || '🍚';
      const stock = Number(state.inventory?.[item.id]) || 0;

      const isLocked =
        (item.id === 'cha' || item.id === 'canh') &&
        !Boolean(state.upgrades?.unlockMenu);

      const spoilHtml = !isLocked
        ? spoilageHint(item.id, stock, state)
        : '';

      const unitCost = getEffectiveCost(item.id, state);

      const metaHtml = isLocked
        ? '<span class="lock-tag">🔒 Cần mở khóa nâng cấp</span>'
        : `Vốn: <strong>${formatMoney(unitCost)}</strong>/phần`;

      // Panel mua mở rộng khi chọn món này
      const isBuying =
        !isLocked && buyTargetId === item.id;

      let actionHtml = '';

      if (isLocked) {
        actionHtml = `
          <button
            type="button"
            class="buy-btn disabled"
            disabled
          >Chưa mở</button>`;
      } else if (isBuying) {
        const total = getEffectiveCost(item.id, state) * buyQty;
        const canAfford =
          state.money >= total && buyQty > 0;

        const afterStock = stock + buyQty;

        actionHtml = `
          <div class="buy-panel">
            <div class="buy-qty-row">
              <button
                type="button"
                class="buy-qty-chip ${buyQty === 1 ? 'active' : ''}"
                data-action="set-buy-qty"
                data-qty="1"
              >1</button>

              <button
                type="button"
                class="buy-qty-chip ${buyQty === 5 ? 'active' : ''}"
                data-action="set-buy-qty"
                data-qty="5"
              >5</button>

              <button
                type="button"
                class="buy-qty-chip ${buyQty === 10 ? 'active' : ''}"
                data-action="set-buy-qty"
                data-qty="10"
              >10</button>

              <button
                type="button"
                class="buy-qty-chip ${![1, 5, 10].includes(buyQty) ? 'active' : ''}"
                data-action="set-buy-custom"
                data-id="${item.id}"
              >Tùy chỉnh</button>
            </div>

            <div class="buy-preview">
              <span>SL: <strong>${buyQty}</strong></span>
              <span>Thành tiền: <strong>${formatMoney(total)}</strong></span>
              <span>Kho sau: <strong>${afterStock}</strong></span>
            </div>

            <div class="buy-panel-actions">
              <button
                type="button"
                class="buy-cancel-btn"
                data-action="cancel-buy"
              >Huỷ</button>

              <button
                type="button"
                class="buy-btn ${!canAfford ? 'disabled' : ''}"
                data-action="confirm-buy"
                data-id="${item.id}"
                ${canAfford ? '' : 'disabled'}
              >
                Mua
                <small>${formatMoney(total)}</small>
              </button>
            </div>
          </div>`;
      } else {
        const discardBtn =
          stock > 0
            ? `
              <button
                type="button"
                class="discard-btn"
                data-action="discard-ingredient"
                data-id="${item.id}"
                data-stock="${stock}"
              >Đổ bỏ</button>`
            : '';

        actionHtml = `
          <div class="card-action-col">
            <button
              type="button"
              class="buy-btn"
              data-action="open-buy"
              data-id="${item.id}"
            >Mua</button>

            ${discardBtn}
          </div>`;
      }

      return `
        <div class="prep-card ${isLocked ? 'locked' : ''} ${isBuying ? 'buying' : ''}">
          <div class="card-info">
            <div class="card-icon" aria-hidden="true">${icon}</div>

            <div class="card-details">
              <div class="card-name">${item.name}</div>

              <div class="card-meta">${metaHtml}</div>

                <div class="card-stock">
                  Tồn kho: <strong>${stock}</strong> phần
                </div>
                ${spoilHtml}
            </div>
          </div>
          <div class="card-action">
            ${actionHtml}
          </div>
        </div>`;
    })
      .join('');
}

function renderDrinksList(state) {
  const hasFridge = Boolean(state.upgrades?.drinkFridge);
  const items = Object.values(GAME_DATA.menu).filter((item) => item.group === 'drink');

  return items
    .map((item) => {
      const icon = ASSETS[item.id] || '🥤';
      const stock = Number(state.inventory?.[item.id]) || 0;
      const isLocked = Boolean(item.needsDrinkFridge) && !hasFridge;

      const unitCost = getEffectiveCost(item.id, state);

      const metaHtml = isLocked
        ? '<span class="lock-tag">🔒 Cần Tủ nước giải khát</span>'
        : `Vốn: <strong>${formatMoney(unitCost)}</strong>/phần`;

      const isBuying = !isLocked && buyTargetId === item.id;
      let actionHtml = '';

      if (isLocked) {
        actionHtml = `<button type="button" class="buy-btn disabled" disabled>Chưa mở</button>`;
      } else if (isBuying) {
        const total = getEffectiveCost(item.id, state) * buyQty;
        const canAfford = state.money >= total && buyQty > 0;
        const afterStock = stock + buyQty;

        actionHtml = `
          <div class="buy-panel">
            <div class="buy-qty-row">
              <button type="button" class="buy-qty-chip ${buyQty === 1 ? 'active' : ''}" data-action="set-buy-qty" data-qty="1">1</button>
              <button type="button" class="buy-qty-chip ${buyQty === 5 ? 'active' : ''}" data-action="set-buy-qty" data-qty="5">5</button>
              <button type="button" class="buy-qty-chip ${buyQty === 10 ? 'active' : ''}" data-action="set-buy-qty" data-qty="10">10</button>
              <button type="button" class="buy-qty-chip ${![1, 5, 10].includes(buyQty) ? 'active' : ''}" data-action="set-buy-custom" data-id="${item.id}">Tùy chỉnh</button>
            </div>

            <div class="buy-preview">
              <span>SL: <strong>${buyQty}</strong></span>
              <span>Thành tiền: <strong>${formatMoney(total)}</strong></span>
              <span>Kho sau: <strong>${afterStock}</strong></span>
            </div>

            <div class="buy-panel-actions">
              <button type="button" class="buy-cancel-btn" data-action="cancel-buy">Huỷ</button>
              <button type="button" class="buy-btn ${!canAfford ? 'disabled' : ''}" data-action="confirm-buy" data-id="${item.id}" ${canAfford ? '' : 'disabled'}>
                Mua <small>${formatMoney(total)}</small>
              </button>
            </div>
          </div>`;
      } else {
        const discardBtn =
          stock > 0
            ? `<button type="button" class="discard-btn" data-action="discard-ingredient" data-id="${item.id}" data-stock="${stock}">Đổ bỏ</button>`
            : '';

        actionHtml = `
          <div class="card-action-col">
            <button type="button" class="buy-btn" data-action="open-buy" data-id="${item.id}">Mua</button>
            ${discardBtn}
          </div>`;
      }

      return `
        <div class="prep-card ${isLocked ? 'locked' : ''} ${isBuying ? 'buying' : ''}">
          <div class="card-info">
            <div class="card-icon" aria-hidden="true">${icon}</div>

            <div class="card-details">
              <div class="card-name">${item.name}</div>
              <div class="card-meta">${metaHtml}</div>
              <div class="card-stock">Tồn kho: <strong>${stock}</strong> phần</div>
            </div>
          </div>

          <div class="card-action">${actionHtml}</div>
        </div>`;
    })
    .join('');
}

function renderPricingList(state) {
  const menuItems = Object.values(GAME_DATA.menu || {}).filter((item) => {
    if (!item?.id) return false;
    // Chưa tủ nước → ẩn xá xị / cam / sữa đậu
    if (item.needsDrinkFridge && !state.upgrades?.drinkFridge) return false;
    // Chưa mở Chả+Canh → ẩn chả / canh (cùng luật)
    if ((item.id === 'cha' || item.id === 'canh') && !state.upgrades?.unlockMenu) return false;
    return true;
  });

  return `
    <div class="pricing-table">
      <div class="pricing-row pricing-header">
        <span class="pricing-name">Món</span>
        <span class="pricing-active">Hiện tại</span>
        <span class="pricing-input-label">Giá mới</span>
      </div>
      ${menuItems.map((item) => {
        const active = getActivePrice(item.id, state);
        const pending = getPendingPrice(item.id, state);
        const value = Number.isFinite(pending) ? pending : active;

        const note =
          pending !== active
            ? '<div class="pricing-delay">Áp dụng từ ngày bán tiếp theo</div>'
            : '';

        const label =
          Number(value) === 0
            ? '<span class="price-label price-free">FREE</span>'
            : (() => {
                const info = getPriceLabel(item.id, value);

                return info
                  ? `<span class="price-label price-${info.kind}">${info.text}</span>`
                  : '';
              })();

        return `
          <div class="pricing-row">
            <span class="pricing-name">${item.name}</span>

            <span class="pricing-active">
              ${formatMoney(active)}
            </span>

            <div class="pricing-input-wrap">
              <input
                class="pricing-input"
                type="number"
                inputmode="numeric"
                min="${PRICE_INPUT_MIN}"
                max="${PRICE_INPUT_MAX}"
                step="1000"
                data-action="price-input"
                data-id="${item.id}"
                value="${Math.max(
                  PRICE_INPUT_MIN,
                  Math.min(
                    PRICE_INPUT_MAX,
                    Number(value) || 0
                  )
                )}"
                aria-label="Giá mới cho ${item.name}"
              />
            </div>

            <div class="pricing-meta">
              ${label}
            </div>

            ${note}
          </div>
        `;
      }).join('')}

      ${Object.values(GAME_DATA.combos || {}).map((combo) => {
        const { min, max, sum } =
          comboPriceBounds(combo.id, state);

        const pending =
          getPendingComboPrice(combo.id, state);

        const active =
          state.comboPrices?.[combo.id];

        const activeShow =
          Number.isFinite(active)
            ? active
            : pending;

        const note =
          Number.isFinite(active) &&
          active !== pending
            ? '<div class="pricing-delay">Áp dụng từ ngày bán tiếp theo</div>'
            : '';

        return `
          <div class="pricing-row pricing-combo">
            <span class="pricing-name">
              🍱 ${combo.name}
            </span>

            <span class="pricing-active">
              ${formatMoney(activeShow)}
            </span>

            <div class="pricing-input-wrap">
              <input
                class="pricing-input"
                type="number"
                inputmode="numeric"
                min="${min}"
                max="${max}"
                step="1000"
                data-action="combo-price-input"
                data-id="${combo.id}"
                value="${pending}"
                aria-label="Giá combo ${combo.name}"
              />
            </div>

            <div class="pricing-meta">
              <span class="price-label price-mid">
                Khung ${formatMoney(min)}–${formatMoney(max)}
              </span>
            </div>

            <div class="pricing-delay">
              Tổng lẻ: ${formatMoney(sum)} · chỉ 50%–100%
            </div>

            ${note}
          </div>
        `;
      }).join('')}
    </div>
  `;
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
      // M29 — công tắc Cho nghỉ (chỉ nhân viên đã thuê)
      let restHtml = '';

      if (
        (upgrade.id === 'staffGrill' || upgrade.id === 'staffCook') &&
        isMax
      ) {
        const pending = Boolean(
          state.staffRestPending?.[upgrade.id]
        );

        const active = Boolean(
          state.staffRestActive?.[upgrade.id]
        );

        restHtml = `
          <label class="staff-rest-toggle">
            <input
              type="checkbox"
              data-action="toggle-staff-rest"
              data-id="${upgrade.id}"
              ${pending ? 'checked' : ''}
            />
            <span>Cho nghỉ hôm nay${active ? ' (đang nghỉ)' : ''}</span>
          </label>

          <div class="staff-rest-hint">
            Áp dụng từ ngày bán tiếp theo
          </div>
        `;
      }
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
              ${restHtml}
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

  if (!action) return;

  if (action === 'open-buy') {
    buyTargetId = id;
    buyQty = 10;
    renderPrepScreen();

  } else if (action === 'cancel-buy') {
    buyTargetId = null;
    buyQty = 10;
    renderPrepScreen();

  } else if (action === 'set-buy-qty') {
    buyQty = Math.max(
      1,
      Number(button.dataset.qty) || 1
    );

    renderPrepScreen();

  } else if (action === 'set-buy-custom') {
    openCustomBuyDialog(id);

  } else if (action === 'confirm-buy') {
    const result = buyIngredient(id, buyQty);

    if (result.success) {
      buyTargetId = null;
      buyQty = 10;
      renderPrepScreen();
    }

  } else if (action === 'buy-upgrade') {
    const result = buyUpgrade(id);

    if (result.success) {
      renderPrepScreen();
    }

  } else if (action === 'discard-ingredient') {
    openDiscardDialog(
      id,
      Number(button.dataset.stock) || 0
    );
  } else if (action === 'price-up') {
    adjustPendingPrice(id, +1);
    renderPrepScreen();
  } else if (action === 'price-down') {
    adjustPendingPrice(id, -1);
    renderPrepScreen();
  }
}

function handlePricingInput(event) {
  const input = event.target.closest('input[data-action="price-input"]');
  if (!input) return;

  const itemId = input.dataset.id;
  if (!itemId) return;

  // Đang gõ dở (rỗng) — không đụng gì, giữ focus
  const raw = String(input.value ?? '').trim();
  if (raw === '') return;

  const nextValue = sanitizeMenuPrice(raw);
  if (nextValue === null) return;

  const state = getState();
  if (!state.pendingMenuPrices) state.pendingMenuPrices = {};
  state.pendingMenuPrices[itemId] = nextValue;
  saveState(state);

  // CHỈ cập nhật nhãn — KHÔNG gán input.value, KHÔNG renderPrepScreen()
  updatePricingRowMeta(input, itemId, nextValue, state);
}

function updatePricingRowMeta(input, itemId, value, state) {
  const row = input.closest('.pricing-row');
  if (!row) return;

  const meta = row.querySelector('.pricing-meta');
  if (meta) {
    if (Number(value) === 0) {
      meta.innerHTML = '<span class="price-label price-free">FREE</span>';
    } else {
      const info = getPriceLabel(itemId, value);
      meta.innerHTML = info
        ? `<span class="price-label price-${info.kind}">${info.text}</span>`
        : '';
    }
  }

  // Ghi chú "Áp dụng từ ngày bán tiếp theo"
  const active = getActivePrice(itemId, state);
  let note = row.querySelector('.pricing-delay');
  if (value !== active) {
    if (!note) {
      note = document.createElement('div');
      note.className = 'pricing-delay';
      note.textContent = 'Áp dụng từ ngày bán tiếp theo';
      row.appendChild(note);
    }
  } else if (note) {
    note.remove();
  }
}

function ensureDiscardDialog() {
  let el = document.getElementById('prep-discard-dialog');
  if (el) return el;

  el = document.createElement('div');
  el.id = 'prep-discard-dialog';
  el.className = 'pause-confirm-dialog hidden';
  el.innerHTML = `
    <div class="confirm-card">
      <p id="prep-discard-msg">Đổ bỏ bao nhiêu phần?</p>
      <div class="discard-input-wrap">
        <button type="button" class="hour-btn" id="prep-discard-minus" aria-label="Giảm">−</button>
        <input id="prep-discard-qty" class="discard-qty-input" type="number" min="1" inputmode="numeric" />
        <button type="button" class="hour-btn" id="prep-discard-plus" aria-label="Tăng">+</button>
      </div>
      <p class="discard-max-hint" id="prep-discard-hint"></p>
      <div class="confirm-buttons">
        <button id="prep-discard-cancel" class="btn-secondary" type="button">Huỷ bỏ</button>
        <button id="prep-discard-confirm" class="btn-primary" type="button">Đổ bỏ</button>
      </div>
    </div>
  `;
  document.getElementById('screen-prep')?.appendChild(el);

  const qtyInput = () => document.getElementById('prep-discard-qty');

  document.getElementById('prep-discard-minus')?.addEventListener('click', () => {
    const input = qtyInput();
    if (!input) return;
    input.value = String(Math.max(1, (Number(input.value) || 1) - 1));
  });
  document.getElementById('prep-discard-plus')?.addEventListener('click', () => {
    const input = qtyInput();
    if (!input) return;
    input.value = String(Math.min(discardMax, (Number(input.value) || 1) + 1));
  });
  document.getElementById('prep-discard-cancel')?.addEventListener('click', closeDiscardDialog);
  document.getElementById('prep-discard-confirm')?.addEventListener('click', () => {
    const n = Math.floor(Number(qtyInput()?.value) || 0);
    if (n < 1 || n > discardMax) return;
    const result = discardIngredient(discardItemId, n);
    closeDiscardDialog();
    if (result.success) renderPrepScreen();
  });

  return el;
}

function openDiscardDialog(itemId, stock) {
  if (stock <= 0) return;
  discardItemId = itemId;
  discardMax = stock;
  const item = GAME_DATA.menu[itemId];
  const el = ensureDiscardDialog();
  const msg = document.getElementById('prep-discard-msg');
  const hint = document.getElementById('prep-discard-hint');
  const input = document.getElementById('prep-discard-qty');
  if (msg) msg.textContent = `Đổ bỏ ${item?.name || 'nguyên liệu'}? Không hoàn tiền.`;
  if (hint) hint.textContent = `Tối đa ${stock} phần trong kho`;
  if (input) {
    input.max = String(stock);
    input.value = String(stock); // mặc định đổ hết (dễ dọn kho)
    input.min = '1';
  }
  el.classList.remove('hidden');
}

function closeDiscardDialog() {
  document.getElementById('prep-discard-dialog')?.classList.add('hidden');
  discardItemId = null;
  discardMax = 0;
}

function openCustomBuyDialog(itemId) {
  const item = GAME_DATA.menu[itemId];

  if (!item) return;

  const state = getState();

  const unitCost = getEffectiveCost(item.id, state);

  const maxByMoney = unitCost > 0
    ? Math.floor((Number(state.money) || 0) / unitCost)
    : 0;

  const suggested = Math.max(
    1,
    Math.min(buyQty || 10, maxByMoney || 1)
  );

  let el = document.getElementById(
    'prep-custom-buy-dialog'
  );

  if (!el) {
    el = document.createElement('div');
    el.id = 'prep-custom-buy-dialog';
    el.className = 'pause-confirm-dialog hidden';

    el.innerHTML = `
      <div class="confirm-card">
        <p id="prep-custom-buy-msg">
          Nhập số lượng muốn mua
        </p>

        <div class="discard-input-wrap">
          <button
            type="button"
            class="hour-btn"
            id="prep-custom-minus"
          >−</button>

          <input
            id="prep-custom-qty"
            class="discard-qty-input"
            type="number"
            min="1"
            inputmode="numeric"
          />

          <button
            type="button"
            class="hour-btn"
            id="prep-custom-plus"
          >+</button>
        </div>

        <p
          class="discard-max-hint"
          id="prep-custom-hint"
        ></p>

        <div class="confirm-buttons">
          <button
            id="prep-custom-cancel"
            class="btn-secondary"
            type="button"
          >Huỷ bỏ</button>

          <button
            id="prep-custom-ok"
            class="btn-primary"
            type="button"
          >Chọn</button>
        </div>
      </div>
    `;

    document
      .getElementById('screen-prep')
      ?.appendChild(el);

    const input = () =>
      document.getElementById('prep-custom-qty');

    document
      .getElementById('prep-custom-minus')
      ?.addEventListener('click', () => {
        const i = input();

        if (i) {
          i.value = String(
            Math.max(
              1,
              (Number(i.value) || 1) - 1
            )
          );
        }

        updateCustomBuyHint();
      });

    document
      .getElementById('prep-custom-plus')
      ?.addEventListener('click', () => {
        const i = input();

        if (i) {
          i.value = String(
            Math.max(
              1,
              (Number(i.value) || 1) + 1
            )
          );
        }

        updateCustomBuyHint();
      });

    input()?.addEventListener(
      'input',
      updateCustomBuyHint
    );

    document
      .getElementById('prep-custom-cancel')
      ?.addEventListener('click', () => {
        el.classList.add('hidden');
      });

    document
      .getElementById('prep-custom-ok')
      ?.addEventListener('click', () => {
        const n = Math.floor(
          Number(input()?.value) || 0
        );

        if (n < 1) return;

        buyQty = n;
        buyTargetId = itemId;

        el.classList.add('hidden');

        renderPrepScreen();
      });
  }

  // Gắn item hiện tại vào hint
  el.dataset.itemId = itemId;

  const msg = document.getElementById(
    'prep-custom-buy-msg'
  );

  const inputEl = document.getElementById(
    'prep-custom-qty'
  );

  if (msg) {
    msg.textContent =
      `Mua bao nhiêu phần ${item.name}?`;
  }

  if (inputEl) {
    inputEl.value = String(suggested);
  }

  updateCustomBuyHint();

  el.classList.remove('hidden');
}

function updateCustomBuyHint() {
  const el = document.getElementById(
    'prep-custom-buy-dialog'
  );

  const itemId = el?.dataset.itemId;

  const item = itemId
    ? GAME_DATA.menu[itemId]
    : null;

  const n = Math.floor(
    Number(
      document.getElementById(
        'prep-custom-qty'
      )?.value
    ) || 0
  );

  const hint = document.getElementById(
    'prep-custom-hint'
  );

  if (!hint || !item) return;

  const state = getState();

  const total =
    getEffectiveCost(item.id, state) * Math.max(0, n);

  const ok =
    n >= 1 &&
    total <= (Number(state.money) || 0);

  hint.textContent =
    n < 1
      ? 'Nhập số ≥ 1'
      : `Thành tiền ${formatMoney(total)}${
          ok ? '' : ' — Không đủ tiền'
        }`;

  hint.style.color =
    ok || n < 1
      ? ''
      : 'var(--danger)';
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
  const tabPricingBtn = document.getElementById('prep-tab-pricing');
  const tabDrinksBtn = document.getElementById('prep-tab-drinks');

  tabIngredientsBtn?.addEventListener('click', () => {
  activeTab = 'ingredients';
  buyTargetId = null;
  renderPrepScreen();
  });

  tabUpgradesBtn?.addEventListener('click', () => {
  activeTab = 'upgrades';
  buyTargetId = null;
  renderPrepScreen();
  });

  tabPricingBtn?.addEventListener('click', () => {
    activeTab = 'pricing';
    buyTargetId = null;
    renderPrepScreen();
  });

  tabDrinksBtn?.addEventListener('click', () => {
    activeTab = 'drinks';
    buyTargetId = null;
    renderPrepScreen();
  });

  // Uỷ quyền sự kiện mua hàng trong danh sách
  const contentEl = document.getElementById('prep-content');
  contentEl?.addEventListener('click', handleContentClick);

  contentEl?.addEventListener('change', (event) => {
    const input = event.target.closest(
      'input[data-action="toggle-staff-rest"]'
    );

    if (!input) return;

    const id = input.dataset.id;

    if (!id) return;

    setStaffRestPending(id, input.checked);
    renderPrepScreen();
  });

  contentEl?.addEventListener('input', handlePricingInput);

  contentEl?.addEventListener('input', (event) => {
    const input = event.target.closest(
      'input[data-action="combo-price-input"]'
    );

    if (!input) return;

    const id = input.dataset.id;

    if (!id) return;

    const raw = String(
      input.value ?? ''
    ).trim();

    if (raw === '') return;

    setPendingComboPrice(
      id,
      raw
    );
  });

  contentEl?.addEventListener('change', (event) => {
    const input = event.target.closest('input[data-action="price-input"]');
    if (!input) return;
    const itemId = input.dataset.id;
    if (!itemId) return;

    const nextValue = sanitizeMenuPrice(input.value);
    if (nextValue === null) {
      // Giá không hợp lệ → trả về pending hiện tại
      const state = getState();
      input.value = String(getPendingPrice(itemId, state));
      return;
    }
    input.value = String(nextValue);
    const state = getState();
    if (!state.pendingMenuPrices) state.pendingMenuPrices = {};
    state.pendingMenuPrices[itemId] = nextValue;
    saveState(state);
    updatePricingRowMeta(input, itemId, nextValue, state);
  });

  contentEl?.addEventListener('change', (event) => {
    const input = event.target.closest(
      'input[data-action="combo-price-input"]'
    );

    if (!input) return;

    const id = input.dataset.id;

    if (!id) return;

    const state = getState();

    const { min, max } =
      comboPriceBounds(id, state);

    let n = Math.round(
      Number(input.value)
    );

    if (!Number.isFinite(n)) {
      n = min;
    }

    n = Math.max(
      min,
      Math.min(max, n)
    );

    input.value = String(n);

    setPendingComboPrice(
      id,
      n,
      state
    );
  });
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
