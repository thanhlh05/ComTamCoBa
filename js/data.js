export const GAME_DATA = {
  currency: {
    startMoney: 200000,
    rentByDay: { base: 30000, step: 5000, max: 80000 },
    loan: 100000,
  },
  menu: {
    com: { id: 'com', name: 'Cơm tấm', price: 15000, cost: 3000, required: true, group: 'main' },
    suon: { id: 'suon', name: 'Sườn nướng', price: 20000, cost: 9000, required: false, group: 'extra' },
    bi: { id: 'bi', name: 'Bì', price: 8000, cost: 2500, required: false, group: 'extra' },
    cha: { id: 'cha', name: 'Chả trứng', price: 10000, cost: 3500, required: false, group: 'extra', unlockCost: 150000 },
    trung: { id: 'trung', name: 'Trứng ốp la', price: 7000, cost: 2500, required: false, group: 'extra' },
    canh: { id: 'canh', name: 'Canh khổ qua', price: 5000, cost: 1500, required: false, group: 'extra', unlockCost: 150000 },
    tra: { id: 'tra', name: 'Trà đá', price: 5000, cost: 1000, required: false, group: 'drink' },
  },
  customers: {
    dayCount(day) {
      return Math.min(30, 10 + 2 * (day - 1));
    },
    types: [
      { id: 'hoc_sinh', label: 'Học sinh', icon: '👧', patience: 45, extraMin: 0, extraMax: 1, tip: 0, unlockDay: 1 },
      { id: 'van_phong', label: 'Dân văn phòng', icon: '💼', patience: 30, extraMin: 1, extraMax: 2, tip: 0.1, unlockDay: 1 },
      { id: 'bac_tai', label: 'Bác tài xế', icon: '🛵', patience: 40, extraMin: 1, extraMax: 2, tip: 0.05, unlockDay: 2 },
      { id: 'du_lich', label: 'Khách du lịch', icon: '📷', patience: 35, extraMin: 2, extraMax: 4, tip: 0.25, unlockDay: 4 },
      { id: 'shipper', label: 'Shipper', icon: '📦', patience: 20, extraMin: 1, extraMax: 2, tip: 0.3, unlockDay: 6 },
    ],
    gapSeconds(day, star, bonusSignage = 0, dayLengthSeconds = 180) {
      const count = this.dayCount(day);
      return (dayLengthSeconds / count) * (1.4 - 0.1 * star) / (1 + bonusSignage);
    },
  },
  star: {
    start: 4.0,
    recentWindow: 20,
  },
  upgrades: {
    grillLarge: { id: 'grillLarge', name: 'Vỉ nướng lớn', cost: [150000, 300000], effect: '4 → 6 → 8 ô', limit: 2 },
    fanCoal: { id: 'fanCoal', name: 'Quạt than', cost: 200000, effect: 'Sườn chín nhanh hơn 20%', limit: 1 },
    ledSign: { id: 'ledSign', name: 'Bảng hiệu đèn led', cost: 250000, effect: 'Khách đến nhiều hơn 15%', limit: 1 },
    fanMotor: { id: 'fanMotor', name: 'Quạt máy', cost: 300000, effect: 'Kiên nhẫn khách +15%', limit: 1 },
    fridge: { id: 'fridge', name: 'Tủ lạnh', cost: 350000, effect: 'Sườn/chả không hao qua đêm', limit: 1 },
    unlockMenu: { id: 'unlockMenu', name: 'Mở món Chả + Canh', cost: 150000, effect: 'Thêm 2 món vào menu', limit: 1 },
    assistant: { id: 'assistant', name: 'Thuê chị Hai phụ bếp', cost: 500000, effect: 'Tự lắp giúp 1 món mỗi 10s', limit: 1 },
  },
  events: {
    chance: 0.3,
    list: [
      { id: 'rain', name: 'Trời mưa', effect: { customerMultiplier: 0.7, shipperMultiplier: 2 } },
      { id: 'school', name: 'Tan học', effect: { studentMultiplier: 2 } },
      { id: 'power', name: 'Cúp điện', effect: { patienceMultiplier: 0.85 } },
      { id: 'praise', name: 'Có người khen trên mạng', effect: { customerMultiplier: 1.25 } },
      { id: 'swnPrice', name: 'Tăng giá sườn', effect: { porkCostMultiplier: 1.3 } },
    ],
  },
  grill: {
    slots: 4,
    cookDuration: 8,
    burnDuration: 12,
    burnThreshold: 100,
    stages: {
      raw: { min: 0, max: 59, label: 'sống' },
      good: { min: 60, max: 90, label: 'chín vàng' },
      slightBurn: { min: 91, max: 100, label: 'hơi cháy' },
      burnt: { min: 101, max: 999, label: 'cháy đen' },
    },
  },
  timing: {
    dayLength: 180,       // mặc định 3 phút = 180 giây
    openHour: 5,          // giờ mở quán mặc định
    closeHour: 23,        // giờ đóng quán mặc định
    dayDurationMinutes: 3,// 3/4/5/6 phút — thay đổi trong Cài đặt
    minHour: 5,           // khung giờ tối thiểu
    maxHour: 23,          // khung giờ tối đa
    durationOptions: [3, 4, 5, 6],
    saveAfterPurchase: true,
    saveAfterSummary: true,
  },
  assets: {
    placeholder: {
      com: '🍚',
      suon: '🍖',
      bi: '🥓',
      cha: '🥮',
      trung: '🍳',
      canh: '🍲',
      tra: '🧊',
      student: '👧',
      office: '💼',
      driver: '🛵',
      tourist: '📷',
      shipper: '📦',
      grillLarge: '🔥',
      fanCoal: '💨',
      ledSign: '✨',
      fanMotor: '🌀',
      fridge: '❄️',
      unlockMenu: '🍳',
      assistant: '👩‍🍳',
    },
  },
    // --- M13: Đánh giá (mục 21) ---
  reviewNames: [
    'Nguyễn Minh', 'Trần Quốc Anh', 'Lê Hoàng Nam', 'Phạm Gia Hân', 'Mai Thảo',
    'Đỗ Thanh Tùng', 'Vũ Ngọc Lan', 'Bùi Anh Khoa', 'Hoàng Bảo Trân', 'Phan Đức Huy',
    'Trương Mỹ Linh', 'Đặng Quang Vinh', 'Ngô Thu Hà', 'Lý Gia Bảo', 'Đinh Nhật Nam',
  ],
  reviewComments: {
    left: [
      'Trời ơi, đơn đâu rồi?',
      'Chờ lâu quá, thôi con đi chỗ khác.',
      'Hết kiên nhẫn rồi {shop} ơi!',
    ],
    wrongMissing: [
      '{shop} ơi con gọi thêm {item} mà đâu rồi?',
      'Thiếu {item} rồi, lần sau kiểm tra lại nha.',
      'Không thấy {item} trong phần của con.',
    ],
    wrongExtra: [
      'Sao lại có thêm {item}? Con không gọi món này.',
      'Phần dư {item} rồi {shop} ơi.',
    ],
    wrong: [
      'Không đúng đơn mình gọi luôn.',
      'Lần sau kiểm tra lại đơn giúp con nha.',
    ],
    burn: [
      'Cơm ngon mà sườn hơi khét.',
      'Sườn cháy nhẹ, ăn vẫn được nhưng tiếc.',
      'Sườn hơi đen rồi {shop} ơi.',
    ],
    expensive: [
      'Ngon nhưng hơi mắc.',
      'Đồ ổn mà giá cao so với chỗ khác.',
    ],
    slow: [
      'Đúng món nhưng chờ hơi lâu.',
      'Ngon, lần sau giao nhanh hơn nha.',
    ],
    good: [
      'Sườn nướng ngon nha, phục vụ nhanh!',
      'Ngon, mai quay lại!',
      '{shop} làm cơm tấm đỉnh thật!',
      'Đúng gu, sẽ giới thiệu bạn bè.',
    ],
  },
};

export const ASSETS = GAME_DATA.assets.placeholder;
