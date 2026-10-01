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
      mam_cay: { id: 'mam_cay', name: 'Nước mắm cay', price: 0, cost: 500, required: false, group: 'sauce' },
      mam_thuong: { id: 'mam_thuong', name: 'Nước mắm thường', price: 0, cost: 500, required: false, group: 'sauce' },
      xa_xi: { id: 'xa_xi', name: 'Xá xị', price: 8000, cost: 2000, required: false, group: 'drink', needsDrinkFridge: true },
      cam_ep: { id: 'cam_ep', name: 'Cam ép', price: 10000, cost: 3000, required: false, group: 'drink', needsDrinkFridge: true },
      sua_dau: { id: 'sua_dau', name: 'Sữa đậu nành', price: 7000, cost: 1500, required: false, group: 'drink', needsDrinkFridge: true },  },
    // M27 — Combo (mục 35)
    // Giá combo = 50%–100% tổng giá lẻ active
    combos: {
      com_suon_tra: {
        id: 'com_suon_tra',
        name: 'Combo Cơm Sườn Trà',
        items: ['com', 'suon', 'tra'],
        // Giá mặc định = 90% tổng giá gốc
        defaultRatio: 0.9,
      },
      com_suon_bi: {
        id: 'com_suon_bi',
        name: 'Combo Cơm Sườn Bì',
        items: ['com', 'suon', 'bi'],
        defaultRatio: 0.9,
      },
    },
  customers: {
    // Tỉ lệ khách gọi nước mắm (~55%)
    fishSauceChance: 0.55,
    dayCount(day) {
      const d = Math.max(1, Number(day) || 1);
      if (d <= 10) return 10 + 2 * (d - 1);
      return Math.min(60, 28 + (d - 10));
    },
    /**
     * heSoSao theo Sao quán (mục 26)
     */
    starFactor(star) {
      const s = Number(star) || 4.0;
      if (s >= 4.5) return 1.25;
      if (s >= 4.0) return 1.0;
      if (s >= 3.0) return 0.9;
      if (s >= 2.0) return 0.8;
      return 0.7;
    },
    /**
     * Khoảng cách khách (giây) — mục 4:
     * (thời lượng / số khách) / (1 + bonus) / heSoSao / heSoGia
     */
    gapSeconds(day, star, bonusSignage = 0, dayLengthSeconds = 180, priceFactor = 1) {
      const count = Math.max(1, this.dayCount(day));
      const heSoSao = this.starFactor(star);
      const heSoGia = Math.max(0.6, Math.min(1.3, Number(priceFactor) || 1));
      const bonus = 1 + (Number(bonusSignage) || 0);
      return dayLengthSeconds / count / bonus / heSoSao / heSoGia;
    },
    types: [
      { id: 'hoc_sinh', label: 'Học sinh', icon: '👧', patience: 45, extraMin: 0, extraMax: 1, tip: 0, unlockDay: 1 },
      { id: 'van_phong', label: 'Dân văn phòng', icon: '💼', patience: 30, extraMin: 1, extraMax: 2, tip: 0.1, unlockDay: 1 },
      { id: 'bac_tai', label: 'Bác tài xế', icon: '🛵', patience: 40, extraMin: 1, extraMax: 2, tip: 0.05, unlockDay: 2 },
      { id: 'du_lich', label: 'Khách du lịch', icon: '📷', patience: 35, extraMin: 2, extraMax: 4, tip: 0.25, unlockDay: 4 },
      { id: 'shipper', label: 'Shipper', icon: '📦', patience: 20, extraMin: 1, extraMax: 2, tip: 0.3, unlockDay: 6 },
    ],
  },
  // M17 — tên ngắn order (đặt ở GỐC GAME_DATA, không nằm trong customers)
  orderShortNames: {
    com: 'Cơm',
    suon: 'sườn',
    bi: 'bì',
    cha: 'chả',
    trung: 'trứng',
    canh: 'canh',
    tra: 'trà',
    mam_cay: 'mắm cay',
    mam_thuong: 'mắm thường',
    xa_xi: 'xá xị',
    cam_ep: 'cam ép',
    sua_dau: 'sữa đậu',
  },

  // M17 — câu thoại (gốc GAME_DATA)
    customerLines: {
    hoc_sinh: [
      'Quán ơi cho con cơm sườn bì, thêm miếng trứng nha!',
      'Cho con cơm sườn với trà đá nha!',
      'Con đói quá, làm nhanh giúp con với!',
      'Cơm sườn thôi cũng được, đừng cay nha cô!',
      'Cho con phần nhỏ thôi, con ăn không hết đâu!',
    ],
    van_phong: [
      'Cho em cơm sườn chả, thêm trà đá.',
      'Cho em một phần bình thường, mang đi giúp em.',
      'Cho em cơm sườn bì, không ớt nha.',
      'Em cần nhanh chút, sắp vào họp rồi ạ.',
      'Thêm canh nếu có, cảm ơn quán!',
    ],
    bac_tai: [
      'Cho tôi phần sườn nhiều cơm nha, làm lẹ giúp tôi!',
      'Cho tôi cơm sườn với trứng, ăn nhanh xong chạy tiếp.',
      'Thêm trà đá cho tỉnh táo nha!',
      'Đóng hộp mang đi giúp, tôi đậu xe ngoài đường.',
      'Sườn chín vàng thôi, đừng cháy nha!',
    ],
    du_lich: [
      'Cho em một phần cơm sườn với trà đá ạ!',
      'Cho em thử một phần cơm tấm đặc biệt ạ!',
      'Nghe nói ở đây ngon, cho em thử phần đầy đủ!',
      'Có thể thêm nước mắm cay được không ạ?',
      'Chụp ảnh món được không? Trông ngon quá!',
    ],
    shipper: [
      'Đơn giao gấp giùm em, cơm sườn 2 phần!',
      'Làm nhanh giúp anh, khách đang chờ!',
      'Cơm sườn bì, đóng hộp mang đi nha!',
      'Thêm trà đá, cảm ơn quán!',
      'Đúng giờ giúp em với, app đang đếm phút!',
    ],
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
    staffGrill: { id: 'staffGrill', name: 'Nhân viên Nướng', cost: 350000, effect: 'Tự gắp sườn chín vào khay', limit: 1 },
    staffCook: { id: 'staffCook', name: 'Nhân viên Làm món', cost: 350000, effect: 'Tự lắp 1 món thiếu mỗi 3s', limit: 1 },
    drinkFridge: { id: 'drinkFridge', name: 'Tủ nước giải khát', cost: 280000, effect: 'Mở khóa Xá xị, Cam ép, Sữa đậu nành', limit: 1 },
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
    // M26 — biến động giá vốn trong ngày (mục 34)
  costEvents: {
    fromDay: 3,
    chance: 0.2, // 20% mỗi ngày từ ngày 3
    list: [
      {
        id: 'suon_up',
        name: 'Sườn tăng giá',
        itemId: 'suon',
        costMult: 1.3,
        message: '📈 Sườn tăng giá hôm nay! Vốn sườn +30%.',
      },
      {
        id: 'trung_down',
        name: 'Trứng được mùa',
        itemId: 'trung',
        costMult: 0.6, // -40%
        message: '🥚 Trứng được mùa! Vốn trứng -40% hôm nay.',
      },
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
      mam_cay: '🌶️',
      mam_thuong: '🐟',
      xa_xi: '🥤',
      cam_ep: '🍊',
      sua_dau: '🥛',
      drinkFridge: '🧊',
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
      staffGrill: '🔥👩‍🍳',
      staffCook: '👩‍🍳',
      combo: '🍱',
    },
  },
    // --- M13: Đánh giá (mục 21) ---
  reviewNames: [
    'Nguyễn Minh', 'Trần Quốc Anh', 'Lê Hoàng Nam', 'Phạm Gia Hân', 'Mai Thảo',
    'Đỗ Thanh Tùng', 'Vũ Ngọc Lan', 'Bùi Anh Khoa', 'Hoàng Bảo Trân', 'Phan Đức Huy',
    'Trương Mỹ Linh', 'Đặng Quang Vinh', 'Ngô Thu Hà', 'Lý Gia Bảo', 'Đinh Nhật Nam',
    'Huỳnh Anh Thư', 'Cao Minh Quân', 'Lâm Phương Nghi', 'Tạ Đức Long', 'Kiều Thanh Hà',
    'Võ Nhật Minh', 'Dương Khánh Vy', 'Phùng Hải Đăng', 'Chu Bảo Ngọc', 'Hồ Quang Huy',
    'Lưu Thị Mai', 'Trịnh Công Sơn', 'Đoàn Thùy Dung', 'Mai Văn Khoa', 'Bành Quốc Bảo',
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
