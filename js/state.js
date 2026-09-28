const STORAGE_KEY = 'com_tam_save_v1';

export const initialState = {
  money: 200000,
  day: 1,
  star: 4.0,
  inventory: {
    com: 0,
    suon: 0,
    bi: 0,
    cha: 0,
    trung: 0,
    canh: 0,
    tra: 0,
  },
  upgrades: {},
};

export function getDefaultState() {
  return JSON.parse(JSON.stringify(initialState));
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return getDefaultState();

  try {
    const parsed = JSON.parse(raw);
    return {
      ...getDefaultState(),
      ...parsed,
      inventory: {
        ...getDefaultState().inventory,
        ...(parsed.inventory || {}),
      },
      upgrades: { ...(parsed.upgrades || {}) },
    };
  } catch (error) {
    console.warn('Không tải được save, dùng trạng thái mặc định:', error);
    return getDefaultState();
  }
}
