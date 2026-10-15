// Modern High-Resolution Game Data: Pippin the Barista Pig & Percy the City Pigeon

const GAME_ITEMS = {
  // --- Pippin's Cafe & Bakery Treats ---
  coffee: {
    id: 'coffee',
    label: 'Espresso Cup',
    category: 'food',
    score: 10,
    pawCharge: 12,
    characters: ['pig'],
    color: '#8d6e63',
    icon: '☕',
    weight: 1.0,
    desc: '+10 Pts • Charges Coffee Power'
  },
  croissant: {
    id: 'croissant',
    label: 'Butter Croissant',
    category: 'food',
    score: 15,
    pawCharge: 16,
    characters: ['pig'],
    color: '#f57c00',
    icon: '🥐',
    weight: 0.85,
    desc: '+15 Pts • Flaky & Fresh'
  },
  donut: {
    id: 'donut',
    label: 'Glazed Donut',
    category: 'food',
    score: 20,
    pawCharge: 20,
    characters: ['pig'],
    color: '#ec407a',
    icon: '🍩',
    weight: 0.7,
    desc: '+20 Pts • Sweet Sugar Rush'
  },
  boba: {
    id: 'boba',
    label: 'Boba Milk Tea',
    category: 'food',
    score: 35,
    pawCharge: 28,
    characters: ['pig'],
    color: '#ab47bc',
    icon: '🧋',
    weight: 0.45,
    desc: '+35 Pts • Sweet Boba Pearls'
  },
  special_roast: {
    id: 'special_roast',
    label: 'Golden Coffee Bean',
    category: 'rare',
    score: 50,
    pawCharge: 40,
    characters: ['pig'],
    color: '#ffd700',
    icon: '✨☕',
    weight: 0.25,
    desc: '+50 Pts • Rare Gold Roast!'
  },

  // --- Percy's City Street Food ---
  bread: {
    id: 'bread',
    label: 'Bread Slice',
    category: 'food',
    score: 10,
    pawCharge: 12,
    characters: ['pigeon'],
    color: '#d7ccc8',
    icon: '🍞',
    weight: 1.0,
    desc: '+10 Pts • Pigeon Superfood'
  },
  fries: {
    id: 'fries',
    label: 'Crispy Fries',
    category: 'food',
    score: 15,
    pawCharge: 16,
    characters: ['pigeon'],
    color: '#e53935',
    icon: '🍟',
    weight: 0.85,
    desc: '+15 Pts • Salty & Crunchy'
  },
  pretzel: {
    id: 'pretzel',
    label: 'Warm Pretzel',
    category: 'food',
    score: 20,
    pawCharge: 20,
    characters: ['pigeon'],
    color: '#8d5524',
    icon: '🥨',
    weight: 0.7,
    desc: '+20 Pts • Street Classic'
  },
  pizza: {
    id: 'pizza',
    label: 'Pizza Slice',
    category: 'food',
    score: 35,
    pawCharge: 28,
    characters: ['pigeon'],
    color: '#fb8c00',
    icon: '🍕',
    weight: 0.45,
    desc: '+35 Pts • Cheesy Goodness'
  },
  shiny_coin: {
    id: 'shiny_coin',
    label: 'Shiny Gold Coin',
    category: 'rare',
    score: 50,
    pawCharge: 40,
    characters: ['pigeon'],
    color: '#ffd700',
    icon: '🪙',
    weight: 0.25,
    desc: '+50 Pts • Shiny City Treasure!'
  },

  // --- Shared Power-Ups & Bonuses ---
  star: {
    id: 'star',
    label: 'Golden Star',
    category: 'bonus',
    score: 30,
    pawCharge: 22,
    characters: ['pig', 'pigeon'],
    color: '#ffd54f',
    icon: '⭐',
    weight: 0.45,
    desc: '+30 Bonus Points'
  },
  heart: {
    id: 'heart',
    label: 'Life Heart',
    category: 'life',
    lifeChange: 1,
    characters: ['pig', 'pigeon'],
    color: '#e57373',
    icon: '💖',
    weight: 0.25,
    desc: '+1 Life (Recovers health)'
  },
  hourglass: {
    id: 'hourglass',
    label: 'Chrono Bell',
    category: 'special',
    score: 20,
    pawCharge: 20,
    characters: ['pig', 'pigeon'],
    color: '#26c6da',
    icon: '⏳',
    weight: 0.25,
    desc: 'Slows down time for 4s!'
  },

  // --- Hazards ---
  bomb: {
    id: 'bomb',
    label: 'Spike Bomb',
    category: 'hazard',
    lifeChange: -1,
    characters: ['pig', 'pigeon'],
    color: '#263238',
    icon: '💣',
    weight: 0.75,
    desc: '-1 Life (Dodge or Flap!)'
  },
  trash: {
    id: 'trash',
    label: 'Smelly Fishbone Trash',
    category: 'hazard',
    lifeChange: -1,
    characters: ['pig', 'pigeon'],
    color: '#78909c',
    icon: '🗑️',
    weight: 0.7,
    desc: '-1 Life (Avoid at all costs!)'
  }
};

const CHARACTERS = {
  pig: {
    id: 'pig',
    name: 'PIPPIN',
    title: 'THE COFFEE BARISTA',
    tagline: 'Always serving warmth with a cheerful smile!',
    color: '#f48fb1',
    accentColor: '#2d6a4f',
    spriteSrc: '/static/assets/characters/pippin.png',
    items: ['coffee', 'croissant', 'donut', 'boba', 'special_roast', 'star', 'heart', 'hourglass', 'bomb', 'trash'],
    passiveSkill: 'CAFFEINE BOOST',
    passiveDesc: '+15% Base Sprint Speed with buttery smooth acceleration',
    activeSkill: 'ESPRESSO RUSH',
    activeKey: 'SHIFT / TOUCH',
    activeDesc: 'Steam-powered horizontal dash with invulnerability frames',
    superSkill: 'CAFE FRENZY',
    superKey: 'SPACE / E / SUPER BTN',
    superDesc: 'Aroma magnet draws all pastries & coffee cups from the sky straight to Pippin for 6s!'
  },
  pigeon: {
    id: 'pigeon',
    name: 'PERCY',
    title: 'THE CITY PIGEON',
    tagline: 'Walking proudly with a happy beak and hungry eyes!',
    color: '#5c6bc0',
    accentColor: '#ffa726',
    spriteSrc: '/static/assets/characters/percy.png',
    items: ['bread', 'fries', 'pretzel', 'pizza', 'shiny_coin', 'star', 'heart', 'hourglass', 'bomb', 'trash'],
    passiveSkill: 'URBAN RESILIENCE',
    passiveDesc: 'Longer post-hit invulnerability and instant directional pivot',
    activeSkill: 'WING FLAP GUST',
    activeKey: 'SHIFT / TOUCH',
    activeDesc: 'Vigorous wing flap shockwave that blows away falling bombs and trash!',
    superSkill: 'FEATHER STORM ZOOMIES',
    superKey: 'SPACE / E / SUPER BTN',
    superDesc: 'Percy enters frantic peck mode: crushes bombs for points and summons food rain!'
  }
};

window.GAME_ITEMS = GAME_ITEMS;
window.CHARACTERS = CHARACTERS;
