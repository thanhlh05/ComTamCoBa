// js/reviews.js — Tab Đánh giá (mục 21 GAME_DESIGN.md)
import { getState, saveState } from './state.js';
import { GAME_DATA } from './data.js';
import { formatStar } from './ui.js';

/**
 * Xác định lý do chính theo thứ tự ưu tiên mục 21.
 */
export function resolveReviewReason(info) {
  if (info.left) return 'left';
  if ((info.errors || 0) >= 1) return 'wrong';
  if (info.isSlightBurn) return 'burn';
  if (info.priceTooHigh) return 'expensive';
  if ((info.patiencePct ?? 100) < 50) return 'slow';
  return 'good';
}

/** Rút gọn order: "Cơm sườn bì + trứng" */
export function formatOrderShort(orderIds) {
  if (!orderIds || !orderIds.length) return '';
  const map = GAME_DATA.orderShortNames || {};
  const parts = orderIds.map((id) => map[id] || GAME_DATA.menu[id]?.name || id);
  const main = parts[0] || 'Cơm';
  const extras = parts.slice(1);
  if (!extras.length) return main;
  return `${main} ${extras.join(' + ')}`;
}

function itemName(id) {
  return GAME_DATA.menu[id]?.name || id;
}

/**
 * Chọn câu bình luận khớp lý do + món thiếu/thừa + tên quán.
 */
function pickComment(reason, { missing = [], extra = [], shopName }) {
  const shop = (shopName && String(shopName).trim()) || 'Cô Ba';
  const comments = GAME_DATA.reviewComments || {};
  let pool;
  let item = '';

  if (reason === 'wrong') {
    if (missing.length > 0) {
      pool = comments.wrongMissing || comments.wrong || ['Thiếu món rồi.'];
      item = itemName(missing[0]);
    } else if (extra.length > 0) {
      pool = comments.wrongExtra || comments.wrong || ['Thừa món rồi.'];
      item = itemName(extra[0]);
    } else {
      pool = comments.wrong || ['Không đúng đơn.'];
    }
  } else {
    pool = comments[reason] || comments.good || ['OK'];
  }

  let text = pool[Math.floor(Math.random() * pool.length)] || 'OK';
  text = text.replaceAll('{shop}', shop).replaceAll('{item}', item || 'món');
  return text;
}

/**
 * Ghi 1 đánh giá: tăng starCounts + đẩy vào reviews (max 30).
 */
export function pushReview({
  stars,
  reason,
  customerType,
  orderIds,
  missing = [],
  extra = [],
}) {
  const state = getState();
  const s = Math.max(1, Math.min(5, Number(stars) || 1));

  if (!state.starCounts) {
    state.starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }

  state.starCounts[s] = (Number(state.starCounts[s]) || 0) + 1;

  const names = GAME_DATA.reviewNames || ['Khách'];
  const name = names[Math.floor(Math.random() * names.length)];

  const comment = pickComment(reason || 'good', {
    missing,
    extra,
    shopName: state.shopName,
  });

  const entry = {
    name,
    stars: s,
    comment,
    reason: reason || 'good',
    typeId: customerType?.id || '',
    typeIcon: customerType?.icon || '👤',
    typeLabel: customerType?.label || 'Khách',
    orderText: formatOrderShort(orderIds || []),
    day: state.day || 1,
    ts: Date.now(),
  };

  if (!Array.isArray(state.reviews)) {
    state.reviews = [];
  }

  state.reviews.unshift(entry);

  while (state.reviews.length > 30) {
    state.reviews.pop();
  }

  saveState(state);
  return entry;
}

function formatReviewTime(ts, day) {
  const d = ts ? new Date(ts) : null;

  if (!d || Number.isNaN(d.getTime())) {
    return `Ngày ${day || '?'}`;
  }

  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');

  return `Ngày ${day || '?'} · ${hh}:${mm}`;
}

/** Render nội dung tab Đánh giá vào container */
export function renderReviewsPanel(container) {
  if (!container) return;

  const state = getState();

  const counts = state.starCounts || {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  const total =
    (counts[1] || 0) +
    (counts[2] || 0) +
    (counts[3] || 0) +
    (counts[4] || 0) +
    (counts[5] || 0);

  // Sao quán = trung bình 20 đánh giá gần nhất.
  // Dùng cùng state.star với tab Quán và HUD màn Bán hàng.
  const shopStar = Number(state.star) || 4.0;

  // Trung bình mọi thời gian chỉ dùng làm ghi chú phụ.
  let allTimeAvg = 0;

  if (total > 0) {
    allTimeAvg =
      ((counts[1] || 0) * 1 +
        (counts[2] || 0) * 2 +
        (counts[3] || 0) * 3 +
        (counts[4] || 0) * 4 +
        (counts[5] || 0) * 5) /
      total;

    allTimeAvg = Math.round(allTimeAvg * 10) / 10;
  }

  const maxBar = Math.max(
    1,
    counts[1],
    counts[2],
    counts[3],
    counts[4],
    counts[5]
  );

  // Các ngày có review (giảm dần)
  const allReviews = Array.isArray(state.reviews)
    ? state.reviews
    : [];

  const daysWithReviews = [
    ...new Set(
      allReviews
        .map((r) => r.day)
        .filter(Boolean)
    ),
  ].sort((a, b) => b - a);

  container.innerHTML = `
    <div class="reviews-summary">
      <div class="reviews-avg">
        <span class="reviews-avg-num">${shopStar.toFixed(1)}</span>
        <span class="reviews-avg-star">⭐</span>
        <span class="reviews-avg-total">${total} lượt đánh giá</span>
      </div>

      ${
        total > 0 && Math.abs(allTimeAvg - shopStar) >= 0.05
          ? `<p class="reviews-alltime-note">TB mọi thời gian: ${allTimeAvg.toFixed(1)}⭐ (Sao quán tính 20 lần gần nhất)</p>`
          : ''
      }

      <div class="reviews-bars">
        ${[5, 4, 3, 2, 1]
          .map((n) => {
            const c = counts[n] || 0;
            const pct = total
              ? Math.round((c / maxBar) * 100)
              : 0;

            return `
            <div class="reviews-bar-row">
              <span class="reviews-bar-label">${n}★</span>
              <div class="reviews-bar-track">
                <div class="reviews-bar-fill" style="width:${pct}%"></div>
              </div>
              <span class="reviews-bar-count">${c}</span>
            </div>`;
          })
          .join('')}
      </div>
    </div>

    <div class="reviews-filters" role="group" aria-label="Lọc sao">
      <button
        type="button"
        class="reviews-filter-chip active"
        data-filter="all"
      >
        Tất cả
      </button>

      <button
        type="button"
        class="reviews-filter-chip"
        data-filter="5"
      >
        5★
      </button>

      <button
        type="button"
        class="reviews-filter-chip"
        data-filter="low"
      >
        ≤2★
      </button>
    </div>

    <div class="reviews-sort-row">
      <label class="reviews-sort-label">
        Sắp xếp
        <select id="reviews-sort" class="reviews-select">
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </label>

      <label class="reviews-sort-label">
        Ngày
        <select id="reviews-day" class="reviews-select">
          <option value="all">Tất cả ngày</option>

          ${daysWithReviews
            .map(
              (d) =>
                `<option value="${d}">Ngày ${d}</option>`
            )
            .join('')}
        </select>
      </label>
    </div>

    <div id="reviews-list" class="reviews-list"></div>
  `;

  const listEl = container.querySelector('#reviews-list');

  let filter = 'all';
  let sortMode = 'newest';
  let dayFilter = 'all';

  function paintList() {
    let rows = [...allReviews];

    if (filter === '5') {
      rows = rows.filter((r) => r.stars === 5);
    } else if (filter === 'low') {
      rows = rows.filter((r) => r.stars <= 2);
    }

    if (dayFilter !== 'all') {
      const d = Number(dayFilter);
      rows = rows.filter((r) => Number(r.day) === d);
    }

    rows.sort((a, b) => {
      const ta = a.ts || 0;
      const tb = b.ts || 0;

      return sortMode === 'oldest'
        ? ta - tb
        : tb - ta;
    });

    if (rows.length === 0) {
      listEl.innerHTML =
        `<p class="reviews-empty">Chưa có đánh giá khớp bộ lọc.</p>`;
      return;
    }

    const shop =
        (state.shopName && String(state.shopName).trim()) || 'Cô Ba';

    listEl.innerHTML = rows
    .map((r) => {
        let comment = r.comment || '';

        // Review cũ có thể còn cứng "Cô Ba" — đổi theo tên quán hiện tại khi hiện
        if (shop !== 'Cô Ba') {
        comment = comment.replaceAll('Cô Ba', shop);
        }

        return `
    <div class="review-card">
        <div class="review-head">
        <span class="review-type">${r.typeIcon || '👤'}</span>
        <span class="review-name">${r.name}</span>
        <span class="review-stars">
            ${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}
        </span>
    </div>

    <p class="review-comment">${comment}</p>

    <div class="review-meta">
      ${
        r.orderText
          ? `<span class="review-order">${r.orderText}</span>`
          : ''
      }

      <span class="review-time">
        ${formatReviewTime(r.ts, r.day)}
      </span>
    </div>
  </div>`;
  })
  .join('');
  }

  container
    .querySelectorAll('.reviews-filter-chip')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        filter = btn.dataset.filter;

        container
          .querySelectorAll('.reviews-filter-chip')
          .forEach((b) => {
            b.classList.toggle('active', b === btn);
          });

        paintList();
      });
    });

  container
    .querySelector('#reviews-sort')
    ?.addEventListener('change', (e) => {
      sortMode = e.target.value;
      paintList();
    });

  container
    .querySelector('#reviews-day')
    ?.addEventListener('change', (e) => {
      dayFilter = e.target.value;
      paintList();
    });

  paintList();
}