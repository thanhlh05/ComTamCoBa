// js/servetype.js — Ăn tại quán / Mang đi (mục 28)
export const SERVE_DINE_IN = 'dine_in';
export const SERVE_TAKEAWAY = 'takeaway';

/** 60% tại quán, 40% mang đi */
export function rollServeType() {
  return Math.random() < 0.6 ? SERVE_DINE_IN : SERVE_TAKEAWAY;
}

export function serveTypeIcon(type) {
  return type === SERVE_TAKEAWAY ? '🥡' : '🍽';
}

export function serveTypeLabel(type) {
  return type === SERVE_TAKEAWAY ? 'Mang đi' : 'Tại quán';
}

/**
 * Container đúng với loại phục vụ?
 * dine_in → phải dĩa; takeaway → phải hộp.
 */
export function isCorrectContainer(serveType, container) {
  if (serveType === SERVE_TAKEAWAY) return container === 'box';
  return container === 'plate';
}

/**
 * Đủ điều kiện giao theo loại phục vụ?
 * takeaway cần thêm bọc (bag === true).
 */
export function isServeReady(serveType, container, bagged) {
  if (!isCorrectContainer(serveType, container)) return false;
  if (serveType === SERVE_TAKEAWAY && !bagged) return false;
  return true;
}

/**
 * Số lỗi loại phục vụ (0 hoặc 1) — tính như thiếu 1 món (mục 37).
 */
export function serveTypeErrorCount(serveType, container, bagged) {
  if (!container) return 1; // chưa chọn dĩa/hộp
  if (!isCorrectContainer(serveType, container)) return 1;
  if (serveType === SERVE_TAKEAWAY && !bagged) return 1;
  return 0;
}