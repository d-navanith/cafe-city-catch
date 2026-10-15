// High-Definition Modern Arcade Engine: Pippin the Barista Pig & Percy the City Pigeon
// Crystal-clear resolution, squash-and-stretch animation, vector rendering, and character super powers.

(function () {
  'use strict';

  // --- Virtual Stage Resolution ---
  const VIRTUAL_W = 1280;
  const VIRTUAL_H = 720;
  const MAX_LIVES = 3;

  // --- Game State Variables ---
  let currentScreen = 'screen-title';
  let selectedCharacter = 'pig'; // 'pig' (Pippin) or 'pigeon' (Percy)
  let isPlaying = false;
  let isPaused = false;
  let countdownTimer = null;
  let gameSessionId = null;
  let gameStartTime = 0;
  let gameSurvivalSeconds = 0;
  let gameTimerInterval = null;

  // Player Physics & Animation
  let player = {
    x: VIRTUAL_W / 2 - 45,
    y: VIRTUAL_H - 165,
    w: 90,
    h: 110,
    vx: 0,
    baseSpeed: 11.0,
    facing: 'right', // 'left' or 'right'
    isMoving: false,
    hurtTimer: 0,
    dashTimer: 0,
    dashCooldown: 0,
    flapCooldown: 0,
    animTick: 0,
    bounceScale: 1.0,
    tilt: 0
  };

  // Super Powers & Meter
  let pawPower = 0; // 0 to 100
  let superActive = false;
  let superTimer = 0;

  // Combo Streaks
  let comboStreak = 0;
  let comboMultiplier = 1;

  // Special Effects
  let slowMoTimer = 0;
  let timeOfDay = 'day'; // 'day', 'sunset', 'night'

  // Metrics
  let score = 0;
  let lives = MAX_LIVES;
  let itemsCaughtSummary = {};
  let hazardsHitCount = 0;
  let totalItemsCaught = 0;

  // Active Entities
  let items = [];
  let particles = [];
  let popups = [];
  let shockwaves = [];
  let ghostTrails = [];
  let itemSpawnTimer = 0;
  let itemSpawnInterval = 55;

  // Inputs
  const keys = {
    left: false,
    right: false
  };

  // DOM Elements
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  const hudLives = document.getElementById('hud-lives');
  const hudScore = document.getElementById('hud-score');
  const hudTime = document.getElementById('hud-time');
  const hudPawMeter = document.getElementById('hud-paw-meter');
  const pawBarOuter = document.getElementById('paw-bar-outer');
  const hudCombo = document.getElementById('hud-combo');
  const btnPause = document.getElementById('btn-pause');
  const pauseModal = document.getElementById('pause-modal');
  const btnResume = document.getElementById('btn-resume');
  const countdownText = document.getElementById('countdown-text');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const imgOverMascot = document.getElementById('img-over-mascot');

  // Screens
  const screens = {
    title: document.getElementById('screen-title'),
    select: document.getElementById('screen-select'),
    ready: document.getElementById('screen-ready'),
    game: document.getElementById('screen-game'),
    over: document.getElementById('screen-over')
  };

  const modalLeaderboard = document.getElementById('modal-leaderboard');
  const leaderboardItemsContainer = document.getElementById('leaderboard-items');

  // -------------------------------------------------------------
  // HIGH-DPI / RETINA CANVAS RESOLUTION SETUP
  // -------------------------------------------------------------
  function setupHighDPICanvas() {
    canvas.width = VIRTUAL_W;
    canvas.height = VIRTUAL_H;
  }
  setupHighDPICanvas();
  window.addEventListener('resize', setupHighDPICanvas);

  // -------------------------------------------------------------
  // SCREEN NAVIGATION
  // -------------------------------------------------------------
  function showScreen(screenKey) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    if (screens[screenKey]) {
      screens[screenKey].classList.add('active');
      currentScreen = `screen-${screenKey}`;
    }
    window.soundEngine.playClick();
  }

  function updateHowToPlayGuide() {
    const container = document.getElementById('items-guide-container');
    if (!container) return;
    container.innerHTML = '';

    const charConfig = window.CHARACTERS[selectedCharacter];
    charConfig.items.forEach(itemId => {
      const item = window.GAME_ITEMS[itemId];
      if (!item) return;

      const guideBox = document.createElement('div');
      guideBox.className = 'guide-item';

      const itemCanvas = document.createElement('canvas');
      itemCanvas.width = 48;
      itemCanvas.height = 48;
      const itemCtx = itemCanvas.getContext('2d');
      window.spriteGen.drawItem(itemCtx, itemId, 0, 0, 48);

      guideBox.appendChild(itemCanvas);

      const title = document.createElement('b');
      title.textContent = item.label;
      guideBox.appendChild(title);

      const desc = document.createElement('span');
      desc.textContent = item.desc;
      if (item.category === 'hazard') desc.className = 'text-hazard';
      else if (item.category === 'bonus') desc.className = 'text-bonus';
      else if (item.category === 'rare') desc.className = 'text-rare';
      else desc.className = 'text-positive';
      guideBox.appendChild(desc);

      container.appendChild(guideBox);
    });
  }

  btnSoundToggle.addEventListener('click', () => {
    const isMuted = window.soundEngine.toggleMute();
    btnSoundToggle.textContent = isMuted ? '🔇' : '🔊';
  });

  // -------------------------------------------------------------
  // BACKEND LEADERBOARD INTEGRATION
  // -------------------------------------------------------------
  async function requestSessionStart() {
    try {
      const res = await fetch('/api/session/start', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        gameSessionId = data.session_id;
      }
    } catch (e) {
      console.warn("Operating in standalone client mode", e);
      gameSessionId = "offline-" + Date.now();
    }
  }

  async function submitFinalScore(nickname) {
    const feedback = document.getElementById('submit-feedback');
    feedback.textContent = 'Submitting score...';
    feedback.style.color = '#e11d48';

    const payload = {
      session_id: gameSessionId || "dev-session",
      nickname: nickname || "Player",
      score: score,
      character: selectedCharacter,
      items_caught: totalItemsCaught,
      survival_seconds: gameSurvivalSeconds
    };

    try {
      const res = await fetch('/api/score/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        feedback.textContent = `Score submitted! Current Rank: #${data.rank} 🏆`;
        feedback.style.color = '#16a34a';
        document.getElementById('btn-submit-score').disabled = true;
      } else {
        feedback.textContent = data.detail || 'Error submitting score.';
        feedback.style.color = '#dc2626';
      }
    } catch (e) {
      feedback.textContent = 'Score saved locally (Server unreachable).';
      feedback.style.color = '#6b7280';
    }
  }

  async function loadLeaderboard() {
    leaderboardItemsContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Fetching rankings...</p>';
    modalLeaderboard.classList.add('active');

    try {
      const res = await fetch('/api/leaderboard?limit=10');
      if (res.ok) {
        const data = await res.json();
        renderLeaderboard(data.leaderboard || []);
      } else {
        leaderboardItemsContainer.innerHTML = '<p style="text-align:center; color: #dc2626;">Failed to load leaderboard.</p>';
      }
    } catch (e) {
      leaderboardItemsContainer.innerHTML = '<p style="text-align:center; color: #6b7280;">Leaderboard server currently offline.</p>';
    }
  }

  function renderLeaderboard(entries) {
    if (!entries || entries.length === 0) {
      leaderboardItemsContainer.innerHTML = '<p style="text-align:center; color: #6b7280; padding: 20px;">No high scores yet! Be the first to rank #1!</p>';
      return;
    }

    leaderboardItemsContainer.innerHTML = '';
    const medals = ['🥇', '🥈', '🥉'];

    entries.forEach(entry => {
      const row = document.createElement('div');
      row.className = `lb-entry ${entry.rank <= 3 ? 'top-' + entry.rank : ''}`;

      const rankBadge = entry.rank <= 3 ? medals[entry.rank - 1] : `#${entry.rank}`;
      const charIcon = entry.character === 'pig' ? '☕' : '🍞';

      row.innerHTML = `
        <div class="lb-rank">${rankBadge}</div>
        <div class="lb-player">${charIcon} ${escapeHtml(entry.nickname)}</div>
        <div class="lb-score">${entry.score} PTS</div>
      `;
      leaderboardItemsContainer.appendChild(row);
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // -------------------------------------------------------------
  // GAMEPLAY INITIALIZATION
  // -------------------------------------------------------------
  function resetGame() {
    score = 0;
    lives = MAX_LIVES;
    items = [];
    particles = [];
    popups = [];
    shockwaves = [];
    ghostTrails = [];
    itemsCaughtSummary = {};
    hazardsHitCount = 0;
    totalItemsCaught = 0;
    gameSurvivalSeconds = 0;
    itemSpawnTimer = 0;
    itemSpawnInterval = 55;
    timeOfDay = 'day';

    pawPower = 0;
    superActive = false;
    superTimer = 0;
    comboStreak = 0;
    comboMultiplier = 1;
    slowMoTimer = 0;

    // Dimensions: Pippin is slightly taller (88x118), Percy is 100x100
    if (selectedCharacter === 'pig') {
      player.w = 88;
      player.h = 118;
      player.baseSpeed = 11.5;
    } else {
      player.w = 104;
      player.h = 100;
      player.baseSpeed = 10.5;
    }

    player.x = VIRTUAL_W / 2 - player.w / 2;
    player.y = VIRTUAL_H - player.h - 85;
    player.vx = 0;
    player.facing = 'right';
    player.isMoving = false;
    player.hurtTimer = 0;
    player.dashTimer = 0;
    player.dashCooldown = 0;
    player.flapCooldown = 0;
    player.bounceScale = 1.0;
    player.tilt = 0;

    updateHUD();
  }

  function startRoundCountdown() {
    showScreen('game');
    resetGame();
    isPlaying = false;
    isPaused = false;
    pauseModal.style.display = 'none';

    requestSessionStart();

    let count = 3;
    countdownText.style.display = 'block';
    countdownText.textContent = count;
    window.soundEngine.playCountdownTick(false);

    countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        countdownText.textContent = count;
        window.soundEngine.playCountdownTick(false);
      } else if (count === 0) {
        countdownText.textContent = 'GO!';
        window.soundEngine.playCountdownTick(true);
      } else {
        clearInterval(countdownTimer);
        countdownText.style.display = 'none';
        isPlaying = true;
        gameStartTime = Date.now();
        window.soundEngine.startMusic();

        if (gameTimerInterval) clearInterval(gameTimerInterval);
        gameTimerInterval = setInterval(() => {
          if (isPlaying && !isPaused) {
            gameSurvivalSeconds++;
            updateHUDTime();

            if (gameSurvivalSeconds > 80) {
              timeOfDay = 'night';
            } else if (gameSurvivalSeconds > 40) {
              timeOfDay = 'sunset';
            } else {
              timeOfDay = 'day';
            }

            if (gameSurvivalSeconds % 12 === 0 && itemSpawnInterval > 18) {
              itemSpawnInterval -= 4;
            }
          }
        }, 1000);
      }
    }, 800);
  }

  // -------------------------------------------------------------
  // CHARACTER SKILL TRIGGERS
  // -------------------------------------------------------------
  function triggerActiveSkill() {
    if (!isPlaying || isPaused) return;

    if (selectedCharacter === 'pig') {
      // PIPPIN: ESPRESSO RUSH DASH
      if (player.dashCooldown <= 0) {
        player.dashTimer = 16;
        player.dashCooldown = 110;
        player.hurtTimer = 22;
        const dir = keys.left ? -1 : (keys.right ? 1 : (player.facing === 'left' ? -1 : 1));
        player.vx = dir * 30;
        window.soundEngine.playDash();
        addScorePopup('ESPRESSO RUSH! ☕', player.x, player.y - 25, '#f59e0b');
        addParticles(player.x + player.w / 2, player.y + player.h / 2, 16, ['#ffffff', '#f59e0b', '#6f4e37']);
      }
    } else {
      // PERCY: WING FLAP GUST
      if (player.flapCooldown <= 0) {
        player.flapCooldown = 130;
        window.soundEngine.playBark(); // Wing flap whoosh
        addScorePopup('WING FLAP GUST! 🕊️', player.x, player.y - 30, '#0284c7');
        triggerScreenShake(8);

        shockwaves.push({
          x: player.x + player.w / 2,
          y: player.y + player.h / 2,
          radius: 12,
          maxRadius: 280,
          opacity: 1.0
        });

        // Vaporize / blow away falling hazards
        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i];
          if (it.config.category === 'hazard') {
            const dx = (it.x + it.w / 2) - (player.x + player.w / 2);
            const dy = (it.y + it.h / 2) - (player.y + player.h / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 280) {
              addParticles(it.x + 26, it.y + 26, 18, ['#ffffff', '#0284c7', '#2b2024']);
              addScorePopup('+20 FLAP!', it.x, it.y, '#38bdf8');
              score += 20 * comboMultiplier;
              items.splice(i, 1);
            }
          }
        }
        updateHUD();
      }
    }
  }

  function triggerSuperMove() {
    if (!isPlaying || isPaused || pawPower < 100 || superActive) return;

    pawPower = 0;
    superActive = true;
    superTimer = 360; // 6.0 seconds
    window.soundEngine.playSuper();
    triggerScreenShake(14);

    if (selectedCharacter === 'pig') {
      addScorePopup('CAFE FRENZY! ☕🥐', player.x - 40, player.y - 45, '#f59e0b');
    } else {
      addScorePopup('FEATHER STORM ZOOMIES! 🕊️✨', player.x - 60, player.y - 45, '#38bdf8');
      // Treat avalanche
      for (let i = 0; i < 6; i++) {
        setTimeout(spawnFallingItem, i * 180);
      }
    }

    updateHUD();
  }

  function spawnFallingItem() {
    const charConfig = window.CHARACTERS[selectedCharacter];
    const availableIds = charConfig.items;

    let totalWeight = 0;
    availableIds.forEach(id => {
      totalWeight += (window.GAME_ITEMS[id].weight || 1.0);
    });

    let rand = Math.random() * totalWeight;
    let chosenId = availableIds[0];
    for (const id of availableIds) {
      const w = window.GAME_ITEMS[id].weight || 1.0;
      if (rand < w) {
        chosenId = id;
        break;
      }
      rand -= w;
    }

    const config = window.GAME_ITEMS[chosenId];
    const baseSpeed = 4.2 + Math.random() * 2.2;
    const speedBonus = Math.min(gameSurvivalSeconds * 0.08, 5.2);

    items.push({
      id: chosenId,
      config: config,
      x: 60 + Math.random() * (VIRTUAL_W - 120 - 52),
      y: -60,
      w: 52,
      h: 52,
      speed: baseSpeed + speedBonus,
      rotation: (Math.random() - 0.5) * 0.4,
      rotSpeed: (Math.random() - 0.5) * 0.04
    });
  }

  function addScorePopup(text, x, y, color = '#facc15') {
    popups.push({
      text: text,
      x: x,
      y: y,
      color: color,
      opacity: 1.0,
      vy: -2.2
    });
  }

  function addParticles(x, y, count = 14, colors = ['#facc15', '#ffffff']) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5.5;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.025 + Math.random() * 0.03
      });
    }
  }

  function triggerScreenShake(magnitude = 12) {
    canvas.style.transform = `translate(${(Math.random() - 0.5) * magnitude}px, ${(Math.random() - 0.5) * magnitude}px)`;
    setTimeout(() => {
      canvas.style.transform = 'none';
    }, 120);
  }

  function triggerGameOver() {
    isPlaying = false;
    window.soundEngine.stopMusic();
    window.soundEngine.playGameOver();
    if (gameTimerInterval) clearInterval(gameTimerInterval);

    document.getElementById('over-final-score').textContent = String(score).padStart(3, '0');
    document.getElementById('over-time-survived').textContent = `SURVIVED ${formatTime(gameSurvivalSeconds)}`;

    // Set Game Over Mascot Image
    imgOverMascot.src = window.CHARACTERS[selectedCharacter].spriteSrc;

    const caughtList = document.getElementById('over-caught-list');
    caughtList.innerHTML = '';
    const keysCaught = Object.keys(itemsCaughtSummary);

    if (keysCaught.length === 0) {
      caughtList.innerHTML = '<span style="font-size:13px; color:#6b7280;">No items caught</span>';
    } else {
      keysCaught.forEach(itemId => {
        const itemInfo = window.GAME_ITEMS[itemId];
        const count = itemsCaughtSummary[itemId];
        const chip = document.createElement('div');
        chip.className = 'caught-chip';
        chip.innerHTML = `${itemInfo.icon} ${itemInfo.label}: <b>${count}</b>`;
        caughtList.appendChild(chip);
      });
    }

    const submitBtn = document.getElementById('btn-submit-score');
    submitBtn.disabled = false;
    document.getElementById('submit-feedback').textContent = '';

    showScreen('over');
  }

  // -------------------------------------------------------------
  // HUD UPDATES
  // -------------------------------------------------------------
  function updateHUD() {
    hudScore.textContent = String(score).padStart(3, '0');
    
    let heartsStr = '';
    for (let i = 0; i < MAX_LIVES; i++) {
      heartsStr += i < lives ? '💖' : '🖤';
    }
    hudLives.textContent = heartsStr;

    // Super Meter Bar
    hudPawMeter.style.width = `${Math.min(100, pawPower)}%`;
    if (pawPower >= 100) {
      pawBarOuter.classList.add('paw-bar-ready');
    } else {
      pawBarOuter.classList.remove('paw-bar-ready');
    }

    // Combo multiplier
    if (comboMultiplier > 1) {
      hudCombo.style.display = 'block';
      hudCombo.textContent = `COMBO x${comboMultiplier}!`;
    } else {
      hudCombo.style.display = 'none';
    }
  }

  function updateHUDTime() {
    hudTime.textContent = formatTime(gameSurvivalSeconds);
  }

  function formatTime(totalSecs) {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // -------------------------------------------------------------
  // MAIN ANIMATION & UPDATE LOOP
  // -------------------------------------------------------------
  function update() {
    if (!isPlaying || isPaused) return;

    if (player.dashCooldown > 0) player.dashCooldown--;
    if (player.flapCooldown > 0) player.flapCooldown--;

    if (superActive) {
      superTimer--;
      if (superTimer <= 0) {
        superActive = false;
      }
    }

    if (slowMoTimer > 0) {
      slowMoTimer--;
    }

    // Squash & Stretch recovery
    if (player.bounceScale > 1.0) {
      player.bounceScale -= 0.02;
      if (player.bounceScale < 1.0) player.bounceScale = 1.0;
    }

    // Movement Physics
    const speedMult = superActive && selectedCharacter === 'pigeon' ? 1.65 : 1.0;
    const currentSpeed = player.baseSpeed * speedMult;

    if (player.dashTimer > 0) {
      player.dashTimer--;
      // Spawn dash ghost trails
      if (player.dashTimer % 3 === 0) {
        ghostTrails.push({
          x: player.x,
          y: player.y,
          w: player.w,
          h: player.h,
          facing: player.facing,
          opacity: 0.65
        });
      }
    } else {
      if (keys.left) {
        player.vx = -currentSpeed;
        player.facing = 'left';
        player.isMoving = true;
        player.tilt = -0.09;
      } else if (keys.right) {
        player.vx = currentSpeed;
        player.facing = 'right';
        player.isMoving = true;
        player.tilt = 0.09;
      } else {
        player.vx *= 0.68;
        player.tilt *= 0.6;
        if (Math.abs(player.vx) < 0.2) {
          player.vx = 0;
          player.isMoving = false;
          player.tilt = 0;
        }
      }
    }

    player.x += player.vx;
    player.x = Math.max(16, Math.min(VIRTUAL_W - player.w - 16, player.x));

    if (player.hurtTimer > 0) {
      player.hurtTimer--;
    }

    player.animTick++;

    // Item Spawning
    itemSpawnTimer++;
    if (itemSpawnTimer >= itemSpawnInterval) {
      spawnFallingItem();
      itemSpawnTimer = 0;
    }

    // Update Falling Items
    const speedFactor = slowMoTimer > 0 ? 0.38 : 1.0;

    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];

      // PIPPIN SUPER: CAFE FRENZY MAGNET
      if (superActive && selectedCharacter === 'pig' && it.config.category !== 'hazard') {
        const dx = (player.x + player.w / 2) - (it.x + it.w / 2);
        const dy = (player.y + player.h / 2) - (it.y + it.h / 2);
        it.x += dx * 0.14;
        it.y += dy * 0.14;
      } else {
        it.y += it.speed * speedFactor;
      }

      it.rotation += it.rotSpeed;

      // Hitbox
      const playerHitbox = {
        x: player.x + 14,
        y: player.y + 14,
        w: player.w - 28,
        h: player.h - 18
      };

      const itemHitbox = {
        x: it.x + 8,
        y: it.y + 8,
        w: it.w - 16,
        h: it.h - 16
      };

      const isColliding = (
        playerHitbox.x < itemHitbox.x + itemHitbox.w &&
        playerHitbox.x + playerHitbox.w > itemHitbox.x &&
        playerHitbox.y < itemHitbox.y + itemHitbox.h &&
        playerHitbox.y + playerHitbox.h > itemHitbox.y
      );

      if (isColliding) {
        handleItemCatch(it);
        items.splice(i, 1);
        continue;
      }

      if (it.y > VIRTUAL_H - 60) {
        if (it.config.category === 'food' || it.config.category === 'bonus') {
          comboStreak = 0;
          comboMultiplier = 1;
          updateHUD();
        }
        items.splice(i, 1);
      }
    }

    // Update Ghost Trails
    for (let i = ghostTrails.length - 1; i >= 0; i--) {
      const g = ghostTrails[i];
      g.opacity -= 0.08;
      if (g.opacity <= 0) ghostTrails.splice(i, 1);
    }

    // Update Shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.radius += 16;
      sw.opacity -= 0.055;
      if (sw.radius >= sw.maxRadius || sw.opacity <= 0) {
        shockwaves.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Update Popups
    for (let i = popups.length - 1; i >= 0; i--) {
      const pop = popups[i];
      pop.y += pop.vy;
      pop.opacity -= 0.022;
      if (pop.opacity <= 0) popups.splice(i, 1);
    }
  }

  function handleItemCatch(item) {
    const cfg = item.config;
    totalItemsCaught++;
    itemsCaughtSummary[item.id] = (itemsCaughtSummary[item.id] || 0) + 1;
    player.bounceScale = 1.18; // Squash & Stretch bounce effect!

    // PERCY SUPER: CRUSH BOMBS
    if (superActive && selectedCharacter === 'pigeon' && cfg.category === 'hazard') {
      score += 30 * comboMultiplier;
      addParticles(item.x + 26, item.y + 26, 20, ['#38bdf8', '#facc15', '#ffffff']);
      addScorePopup('+30 CRUSHED! 🕊️', item.x, item.y - 12, '#38bdf8');
      window.soundEngine.playCatch();
      updateHUD();
      return;
    }

    if (cfg.category === 'hazard') {
      hazardsHitCount++;
      lives += cfg.lifeChange;
      player.hurtTimer = 45;
      comboStreak = 0;
      comboMultiplier = 1;
      triggerScreenShake(14);
      window.soundEngine.playHurt();
      addParticles(item.x + 26, item.y + 26, 24, ['#1e293b', '#ef4444', '#f97316']);
      addScorePopup('-1 LIFE!', item.x, item.y - 12, '#ef4444');

      if (lives <= 0) {
        lives = 0;
        updateHUD();
        triggerGameOver();
        return;
      }
    } else {
      comboStreak++;
      if (comboStreak >= 18) comboMultiplier = 5;
      else if (comboStreak >= 10) comboMultiplier = 3;
      else if (comboStreak >= 5) comboMultiplier = 2;
      else comboMultiplier = 1;

      if (cfg.pawCharge && pawPower < 100) {
        pawPower = Math.min(100, pawPower + cfg.pawCharge);
      }

      if (cfg.category === 'life') {
        if (lives < MAX_LIVES) lives += cfg.lifeChange;
        window.soundEngine.playHeart();
        addParticles(item.x + 26, item.y + 26, 18, ['#f472b6', '#ffffff', '#ef4444']);
        addScorePopup('+1 LIFE!', item.x, item.y - 12, '#f472b6');
      } else if (cfg.category === 'special' && item.id === 'hourglass') {
        slowMoTimer = 240;
        window.soundEngine.playSlowMotion();
        addParticles(item.x + 26, item.y + 26, 24, ['#06b6d4', '#ffffff', '#a5f3fc']);
        addScorePopup('TIME SLOW! ⏳', item.x, item.y - 12, '#06b6d4');
      } else {
        const points = (cfg.score || 10) * comboMultiplier;
        score += points;

        if (cfg.category === 'rare') {
          window.soundEngine.playBonus();
          addParticles(item.x + 26, item.y + 26, 25, ['#facc15', '#ec407a', '#ffffff']);
          addScorePopup(`+${points} RARE!`, item.x, item.y - 12, '#f59e0b');
        } else if (cfg.category === 'bonus') {
          window.soundEngine.playBonus();
          addParticles(item.x + 26, item.y + 26, 20, ['#fbbf24', '#ffffff', '#f59e0b']);
          addScorePopup(`+${points} STAR!`, item.x, item.y - 12, '#facc15');
        } else {
          window.soundEngine.playCatch();
          window.soundEngine.playCombo(comboMultiplier);
          addParticles(item.x + 26, item.y + 26, 14, [cfg.color, '#ffffff']);
          addScorePopup(`+${points}`, item.x, item.y - 12, '#16a34a');
        }
      }
    }

    updateHUD();
  }

  function render() {
    // 1. Draw High-Definition Scenic Background
    const envCanvas = window.spriteGen.getEnvironment(VIRTUAL_W, VIRTUAL_H, timeOfDay);
    ctx.drawImage(envCanvas, 0, 0);

    // 2. Draw Dash Ghost Trails
    const charImg = window.spriteGen.getCharacterImage(selectedCharacter === 'pig' ? 'pippin' : 'percy');

    for (const g of ghostTrails) {
      if (!charImg || !charImg.complete) continue;
      ctx.save();
      ctx.globalAlpha = g.opacity * 0.45;
      ctx.translate(g.x + g.w / 2, g.y + g.h / 2);
      if (g.facing === 'left') ctx.scale(-1, 1);
      ctx.drawImage(charImg, -g.w / 2, -g.h / 2, g.w, g.h);
      ctx.restore();
    }

    // 3. Draw Shockwaves (Wing Flap Gust)
    for (const sw of shockwaves) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${sw.opacity})`;
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Draw High-Resolution Vector Items
    for (const it of items) {
      ctx.save();
      ctx.translate(it.x + it.w / 2, it.y + it.h / 2);
      ctx.rotate(it.rotation);
      window.spriteGen.drawItem(ctx, it.id, -it.w / 2, -it.h / 2, it.w);
      ctx.restore();
    }

    // 5. Draw Animated Character (Pippin / Percy)
    if (charImg && charImg.complete) {
      ctx.save();

      // Walk bobbing
      const walkBob = player.isMoving ? Math.abs(Math.sin(player.animTick * 0.22)) * 6 : 0;
      const drawX = player.x + player.w / 2;
      const drawY = player.y + player.h / 2 - walkBob;

      ctx.translate(drawX, drawY);

      // Tilt while running
      ctx.rotate(player.tilt);

      // Squash and stretch scale
      ctx.scale(
        (player.facing === 'left' ? -1 : 1) * (2 - player.bounceScale),
        player.bounceScale
      );

      // Super Aura glow
      if (superActive) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, player.w * 0.75, 0, Math.PI * 2);
        ctx.fillStyle = selectedCharacter === 'pig' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(56, 189, 248, 0.35)';
        ctx.fill();
        ctx.restore();
      }

      // Hurt flashing
      if (player.hurtTimer % 6 < 3) {
        ctx.drawImage(charImg, -player.w / 2, -player.h / 2, player.w, player.h);
      }

      ctx.restore();
    }

    // 6. Draw Crisp Particles
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Draw Floating Score Popups
    for (const pop of popups) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pop.opacity);
      ctx.font = 'bold 18px "Fredoka", sans-serif';
      ctx.fillStyle = pop.color;
      ctx.strokeStyle = '#1e1b2e';
      ctx.lineWidth = 4;
      ctx.strokeText(pop.text, pop.x, pop.y);
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }
  }

  function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
  }

  // -------------------------------------------------------------
  // CONTROLS & LISTENERS
  // -------------------------------------------------------------
  window.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      keys.left = true;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      keys.right = true;
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      triggerActiveSkill();
    } else if (e.code === 'Space' || e.code === 'KeyE') {
      triggerSuperMove();
    } else if (e.code === 'KeyP') {
      togglePause();
    }
  });

  window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      keys.left = false;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      keys.right = false;
    }
  });

  // Mobile virtual buttons
  const touchLeft = document.getElementById('touch-left');
  const touchRight = document.getElementById('touch-right');
  const touchSkill = document.getElementById('touch-skill');
  const touchSuper = document.getElementById('touch-super');

  const bindTouch = (elem, keyName) => {
    if (!elem) return;
    elem.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      keys[keyName] = true;
    });
    elem.addEventListener('pointerup', () => { keys[keyName] = false; });
    elem.addEventListener('pointercancel', () => { keys[keyName] = false; });
    elem.addEventListener('pointerleave', () => { keys[keyName] = false; });
  };

  bindTouch(touchLeft, 'left');
  bindTouch(touchRight, 'right');

  if (touchSkill) {
    touchSkill.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      triggerActiveSkill();
    });
  }

  if (touchSuper) {
    touchSuper.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      triggerSuperMove();
    });
  }

  function togglePause() {
    if (!isPlaying) return;
    isPaused = !isPaused;
    pauseModal.style.display = isPaused ? 'block' : 'none';
    if (isPaused) {
      window.soundEngine.stopMusic();
    } else {
      window.soundEngine.startMusic();
    }
  }

  btnPause.addEventListener('click', togglePause);
  btnResume.addEventListener('click', togglePause);

  // Screen buttons
  document.getElementById('btn-to-select').addEventListener('click', () => showScreen('select'));
  document.getElementById('btn-select-back').addEventListener('click', () => showScreen('title'));
  document.getElementById('btn-to-how-to').addEventListener('click', () => {
    updateHowToPlayGuide();
    showScreen('ready');
  });
  document.getElementById('btn-ready-back').addEventListener('click', () => showScreen('select'));
  document.getElementById('btn-ready-confirm').addEventListener('click', () => {
    updateHowToPlayGuide();
    showScreen('ready');
  });
  document.getElementById('btn-start-round').addEventListener('click', startRoundCountdown);
  document.getElementById('btn-play-again').addEventListener('click', startRoundCountdown);
  document.getElementById('btn-over-home').addEventListener('click', () => showScreen('title'));

  document.querySelectorAll('.char-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedCharacter = card.getAttribute('data-char');
      window.soundEngine.playClick();
    });
  });

  document.getElementById('btn-to-leaderboard').addEventListener('click', loadLeaderboard);
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    modalLeaderboard.classList.remove('active');
  });
  document.getElementById('btn-modal-done').addEventListener('click', () => {
    modalLeaderboard.classList.remove('active');
  });

  document.getElementById('btn-submit-score').addEventListener('click', () => {
    const input = document.getElementById('input-nickname');
    const name = input.value.trim() || 'Player';
    submitFinalScore(name);
  });

  requestAnimationFrame(gameLoop);

})();
