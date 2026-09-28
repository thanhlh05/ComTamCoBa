export function formatMoney(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}

export function formatStar(star) {
  return `⭐ ${Number(star || 0).toFixed(1)}`;
}
