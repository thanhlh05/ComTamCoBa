export function formatMoney(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}
