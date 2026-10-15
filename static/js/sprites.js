// High-Definition Vector & Illustrated Sprite Engine for Pippin & Percy
// Renders ultra-crisp vector food items, character artwork, and modern cafe/city landscapes.

class SpriteGenerator {
  constructor() {
    this.images = {};
    this.envCache = {};
    this.loadCharacterImages();
  }

  loadCharacterImages() {
    const chars = ['pippin', 'percy'];
    chars.forEach(name => {
      const img = new Image();
      img.src = `/static/assets/characters/${name}.png`;
      this.images[name] = img;
    });
  }

  getCharacterImage(name) {
    return this.images[name] || null;
  }

  // ---------------------------------------------------------------------------
  // ULTRA-CRISP VECTOR ITEM RENDERER
  // Draws high-resolution vector illustrations directly to Canvas with smooth anti-aliasing
  // ---------------------------------------------------------------------------
  drawItem(ctx, itemId, x, y, size = 52) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);

    const s = size / 52;
    ctx.scale(s, s);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (itemId) {
      case 'coffee':
        // White ceramic cup with steaming coffee
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#2b2024';
        ctx.lineWidth = 3;

        // Cup body
        ctx.beginPath();
        ctx.moveTo(-16, -10);
        ctx.lineTo(-14, 14);
        ctx.quadraticCurveTo(-14, 20, -4, 20);
        ctx.lineTo(4, 20);
        ctx.quadraticCurveTo(14, 20, 14, 14);
        ctx.lineTo(16, -10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Handle
        ctx.beginPath();
        ctx.arc(16, 2, 8, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();

        // Coffee liquid
        ctx.fillStyle = '#6f4e37';
        ctx.beginPath();
        ctx.ellipse(0, -9, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Steam swirls
        ctx.strokeStyle = 'rgba(160, 140, 130, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-6, -16);
        ctx.quadraticCurveTo(-10, -22, -6, -26);
        ctx.moveTo(4, -16);
        ctx.quadraticCurveTo(8, -22, 4, -26);
        ctx.stroke();
        break;

      case 'croissant':
        // Golden Butter Croissant
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.ellipse(0, 2, 22, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Flaky ridges
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-8, -4);
        ctx.lineTo(-8, 8);
        ctx.moveTo(8, -4);
        ctx.lineTo(8, 8);
        ctx.stroke();
        break;

      case 'donut':
        // Glazed Donut with Sprinkles
        ctx.fillStyle = '#d97706';
        ctx.strokeStyle = '#2b2024';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Strawberry Pink Glaze
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(0, 0, 17, 0, Math.PI * 2);
        ctx.fill();

        // Donut hole
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rainbow sprinkles
        const sprinkles = [
          [-9, -8, '#38bdf8'], [8, -8, '#facc15'],
          [-10, 6, '#4ade80'], [8, 7, '#c084fc'], [0, -12, '#ffffff']
        ];
        sprinkles.forEach(([sx, sy, col]) => {
          ctx.fillStyle = col;
          ctx.fillRect(sx, sy, 4, 2.5);
        });
        break;

      case 'boba':
        // Boba Milk Tea
        ctx.fillStyle = '#e9d5ff';
        ctx.strokeStyle = '#2b2024';
        ctx.lineWidth = 3;

        // Cup
        ctx.beginPath();
        ctx.moveTo(-12, -14);
        ctx.lineTo(-10, 18);
        ctx.quadraticCurveTo(-10, 22, -4, 22);
        ctx.lineTo(4, 22);
        ctx.quadraticCurveTo(10, 22, 10, 18);
        ctx.lineTo(12, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Straw
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(4, -26);
        ctx.stroke();

        // Tapioca pearls
        ctx.fillStyle = '#3b0764';
        [[-5, 14], [0, 16], [5, 14], [-3, 8], [3, 9]].forEach(([px, py]) => {
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
        break;

      case 'special_roast':
        // Golden Coffee Bean
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 22, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Center groove
        ctx.beginPath();
        ctx.moveTo(-4, -14);
        ctx.quadraticCurveTo(6, 0, -4, 14);
        ctx.stroke();

        // Golden spark
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(-5, -6, 4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'bread':
        // Cute Bread Toast Slice
        ctx.fillStyle = '#fed7aa';
        ctx.strokeStyle = '#9a3412';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(-16, -6);
        ctx.quadraticCurveTo(-18, -18, -6, -18);
        ctx.quadraticCurveTo(0, -14, 6, -18);
        ctx.quadraticCurveTo(18, -18, 16, -6);
        ctx.lineTo(14, 16);
        ctx.quadraticCurveTo(14, 19, 9, 19);
        ctx.lineTo(-9, 19);
        ctx.quadraticCurveTo(-14, 19, -14, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Butter pat
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-5, -2, 10, 8);
        break;

      case 'fries':
        // Crispy French Fries
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#2b2024';
        ctx.lineWidth = 3;

        // Container
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.lineTo(-11, 20);
        ctx.lineTo(11, 20);
        ctx.lineTo(14, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Fries sticks
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        [[-8, -18, 5, 20], [-2, -22, 5, 24], [4, -16, 5, 18]].forEach(([fx, fy, fw, fh]) => {
          ctx.fillRect(fx, fy, fw, fh);
          ctx.strokeRect(fx, fy, fw, fh);
        });
        break;

      case 'pretzel':
        // Golden Twisted Pretzel
        ctx.strokeStyle = '#92400e';
        ctx.fillStyle = '#d97706';
        ctx.lineWidth = 6;

        ctx.beginPath();
        ctx.arc(-8, -2, 9, 0, Math.PI * 2);
        ctx.arc(8, -2, 9, 0, Math.PI * 2);
        ctx.stroke();

        // White salt dots
        ctx.fillStyle = '#ffffff';
        [[-10, -5], [-4, 4], [4, 4], [10, -5]].forEach(([sx, sy]) => {
          ctx.fillRect(sx, sy, 3, 3);
        });
        break;

      case 'pizza':
        // Pepperoni Pizza Slice
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(-18, -16);
        ctx.quadraticCurveTo(0, -22, 18, -16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Crust
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-18, -16);
        ctx.quadraticCurveTo(0, -22, 18, -16);
        ctx.stroke();

        // Pepperoni discs
        ctx.fillStyle = '#dc2626';
        [[-4, -6], [5, -4], [0, 8]].forEach(([px, py]) => {
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        });
        break;

      case 'shiny_coin':
        // Shiny Gold Coin
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#a16207';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner circle
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-5, -5, 3.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'star':
        // Lucky Golden Star
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 3;

        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const r = 20;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'heart':
        // Red Heart
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.bezierCurveTo(-18, 2, -22, -14, -8, -16);
        ctx.bezierCurveTo(0, -16, 0, -6, 0, -6);
        ctx.bezierCurveTo(0, -6, 0, -16, 8, -16);
        ctx.bezierCurveTo(22, -14, 18, 2, 0, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glint
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-6, -10, 3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'hourglass':
        // Chrono Hourglass
        ctx.fillStyle = '#06b6d4';
        ctx.strokeStyle = '#155e75';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(-14, -18);
        ctx.lineTo(14, -18);
        ctx.lineTo(2, 0);
        ctx.lineTo(14, 18);
        ctx.lineTo(-14, 18);
        ctx.lineTo(-2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glass caps
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-16, -20, 32, 4);
        ctx.fillRect(-16, 17, 32, 4);
        break;

      case 'bomb':
        // Cartoon Spike Bomb
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(0, 4, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cap & burning fuse
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-4, -17, 8, 5);

        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -17);
        ctx.quadraticCurveTo(8, -25, 12, -22);
        ctx.stroke();

        // Sparkle
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(12, -22, 4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'trash':
        // Crumpled Trash Can with Fishbone
        ctx.fillStyle = '#64748b';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(-14, -8);
        ctx.lineTo(-11, 18);
        ctx.lineTo(11, 18);
        ctx.lineTo(14, -8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lid
        ctx.beginPath();
        ctx.ellipse(0, -9, 16, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Stinky green odor lines
        ctx.strokeStyle = '#84cc16';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-6, -16);
        ctx.quadraticCurveTo(-10, -22, -6, -26);
        ctx.moveTo(6, -15);
        ctx.quadraticCurveTo(10, -20, 6, -24);
        ctx.stroke();
        break;

      default:
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // MODERN 1280x720 HD ENVIRONMENT (Cafe & City Park)
  // ---------------------------------------------------------------------------
  getEnvironment(width = 1280, height = 720, timeOfDay = 'day') {
    const key = `env_${width}_${height}_${timeOfDay}`;
    if (this.envCache[key]) return this.envCache[key];

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    let skyTop, skyBottom, hillFar, hillMid, groundColor, grassColor;

    if (timeOfDay === 'sunset') {
      skyTop = '#5b21b6';
      skyBottom = '#fb923c';
      hillFar = '#7c3aed';
      hillMid = '#c026d3';
      grassColor = '#166534';
      groundColor = '#14532d';
    } else if (timeOfDay === 'night') {
      skyTop = '#0f172a';
      skyBottom = '#1e1b4b';
      hillFar = '#1e293b';
      hillMid = '#0f172a';
      grassColor = '#064e3b';
      groundColor = '#022c22';
    } else { // Sunny Pastel Day
      skyTop = '#bae6fd';
      skyBottom = '#fef08a';
      hillFar = '#86efac';
      hillMid = '#4ade80';
      grassColor = '#22c55e';
      groundColor = '#16a34a';
    }

    // Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.8);
    skyGrad.addColorStop(0, skyTop);
    skyGrad.addColorStop(1, skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Stars & Moon for Night
    if (timeOfDay === 'night') {
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 45; i++) {
        const sx = (i * 97) % width;
        const sy = (i * 53) % (height * 0.45);
        ctx.fillRect(sx, sy, 3, 3);
      }
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(width - 160, 90, 36, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distant Soft Rolling Hills
    ctx.fillStyle = hillFar;
    ctx.beginPath();
    ctx.ellipse(width * 0.25, height * 0.65, width * 0.45, height * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = hillMid;
    ctx.beginPath();
    ctx.ellipse(width * 0.78, height * 0.7, width * 0.5, height * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Foreground Lush Green Meadow
    ctx.fillStyle = grassColor;
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.9, width * 0.7, height * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bottom Running Track / Pavement
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, height - 90, width, 90);

    // Decorative Street / Park Curb
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(0, height - 94, width, 4);

    // Cute Cafe / Park Details
    // Rounded Street Lamppost
    this.drawLamppost(ctx, 120, height - 90);
    this.drawLamppost(ctx, width - 140, height - 90);

    // Soft Fluffy Clouds
    if (timeOfDay !== 'night') {
      this.drawCloud(ctx, 180, 80, 1.2);
      this.drawCloud(ctx, 680, 110, 1.5);
      this.drawCloud(ctx, 1080, 75, 1.0);
    }

    this.envCache[key] = canvas;
    return canvas;
  }

  drawCloud(ctx, x, y, scale = 1.0) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.beginPath();
    ctx.arc(x, y, 25 * scale, 0, Math.PI * 2);
    ctx.arc(x + 24 * scale, y - 10 * scale, 30 * scale, 0, Math.PI * 2);
    ctx.arc(x + 55 * scale, y, 22 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  drawLamppost(ctx, x, groundY) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 3, groundY - 140, 6, 140);
    // Base
    ctx.beginPath();
    ctx.ellipse(x, groundY, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Lamp
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(x, groundY - 145, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 14, groundY - 150, 28, 5);
  }
}

window.spriteGen = new SpriteGenerator();
