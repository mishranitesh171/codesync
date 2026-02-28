import { useEffect, useRef } from 'react';

const CODE_TAGS = [
  { text: 'function( )', color: '#a78bfa' },
  { text: 'API', color: '#38bdf8' },
  { text: 'React', color: '#61dafb' },
  { text: '{ }', color: '#f472b6' },
  { text: '< />', color: '#fb923c' },
  { text: 'WebRTC', color: '#4ade80' },
  { text: 'async', color: '#facc15' },
  { text: 'socket.io', color: '#c084fc' },
  { text: 'MongoDB', color: '#22c55e' },
  { text: 'const', color: '#6c63ff' },
  { text: 'npm i', color: '#ef4444' },
  { text: '=>', color: '#f97316' },
  { text: 'git push', color: '#f43f5e' },
  { text: 'useState', color: '#38bdf8' },
  { text: '.map( )', color: '#a3e635' },
  { text: 'JWT', color: '#fbbf24' },
];

const AuthBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    // Get pixel positions for "CodeSync" text
    const getTextPixels = () => {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = W;
      offCanvas.height = H;
      const offCtx = offCanvas.getContext('2d');

      const fontSize = Math.min(W * 0.14, 120);
      offCtx.font = `900 ${fontSize}px "Inter", sans-serif`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillStyle = '#fff';
      offCtx.fillText('CodeSync', W / 2, H * 0.18);

      const imageData = offCtx.getImageData(0, 0, W, H);
      const pixels = [];
      const gap = 8; // sample every 8 pixels

      for (let y = 0; y < H; y += gap) {
        for (let x = 0; x < W; x += gap) {
          const i = (y * W + x) * 4;
          if (imageData.data[i + 3] > 128) {
            pixels.push({ x, y });
          }
        }
      }
      return pixels;
    };

    const targetPixels = getTextPixels();
    const PARTICLE_COUNT = Math.min(targetPixels.length, 300);

    // Shuffle and pick targets
    const shuffled = targetPixels.sort(() => Math.random() - 0.5).slice(0, PARTICLE_COUNT);

    // Create particles
    const balls = [];
    const ballColors = [
      { main: '#ff4444', light: '#ff8888', dark: '#aa0000', shine: '#ffcccc' },
      { main: '#ffffff', light: '#ffffff', dark: '#aaaaaa', shine: '#ffffff' },
      { main: '#6c63ff', light: '#8b83ff', dark: '#4a42cc', shine: '#c4c0ff' },
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 3 + Math.random() * 5;
      const colorSet = ballColors[i % ballColors.length];
      balls.push({
        x: Math.random() * W,
        y: -20 - Math.random() * H * 2,
        targetX: shuffled[i].x,
        targetY: shuffled[i].y,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        radius: r,
        ...colorSet,
      });
    }

    // Falling code tag badges
    const tags = [];
    const TAG_COUNT = 14;
    for (let i = 0; i < TAG_COUNT; i++) {
      const tag = CODE_TAGS[i % CODE_TAGS.length];
      tags.push({
        x: Math.random() * W,
        y: -40 - Math.random() * H * 2,
        targetX: 0,
        targetY: 0,
        vx: (Math.random() - 0.5) * 3,
        vy: 1 + Math.random() * 3,
        text: tag.text,
        color: tag.color,
        fontSize: 10 + Math.random() * 4,
        rotation: 0,
        rotTarget: 0,
      });
    }

    // Assign tag targets (scattered around the text)
    tags.forEach((tag, i) => {
      const angle = (i / TAG_COUNT) * Math.PI * 2;
      const dist = Math.min(W, H) * 0.3 + Math.random() * 40;
      tag.targetX = W / 2 + Math.cos(angle) * dist;
      tag.targetY = H * 0.18 + Math.sin(angle) * dist * 0.4;
    });

    // Explosion particles (created on blast)
    let sparks = [];

    /*
     * PHASES:
     * 0 = FALLING (balls drop from top, 3s)
     * 1 = FORMING (balls move toward "CodeSync" targets, 2.5s)
     * 2 = HOLD    (text visible, glow, 2s)
     * 3 = BLAST   (explode outward, 2s)
     * 4 = RESET   (re-scatter above, 0.5s then back to 0)
     */
    let phase = 0;
    let phaseTime = 0;
    const PHASE_DURATIONS = [3000, 2500, 2000, 2000, 500];

    const draw3DBall = (b) => {
      // 3D sphere
      const grad = ctx.createRadialGradient(
        b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.05,
        b.x + b.radius * 0.1, b.y + b.radius * 0.1, b.radius
      );
      grad.addColorStop(0, b.light);
      grad.addColorStop(0.5, b.main);
      grad.addColorStop(1, b.dark);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = b.shine + '60';
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawTag = (tag) => {
      ctx.save();
      ctx.translate(tag.x, tag.y);
      ctx.rotate(tag.rotation);

      ctx.font = `700 ${tag.fontSize}px "JetBrains Mono", monospace`;
      const tw = ctx.measureText(tag.text).width;
      const pw = tw + 14;
      const ph = tag.fontSize + 8;

      ctx.fillStyle = 'rgba(15, 15, 30, 0.75)';
      ctx.beginPath();
      ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 6);
      ctx.fill();

      ctx.strokeStyle = tag.color + '60';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 6);
      ctx.stroke();

      ctx.fillStyle = tag.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tag.text, 0, 1);
      ctx.restore();
    };

    let lastTime = performance.now();
    let frame;

    const animate = (now) => {
      const dt = now - lastTime;
      lastTime = now;
      phaseTime += dt;

      ctx.clearRect(0, 0, W, H);

      // Phase transitions
      if (phaseTime > PHASE_DURATIONS[phase]) {
        phaseTime = 0;
        phase = (phase + 1) % 5;

        if (phase === 3) {
          // BLAST: create sparks
          sparks = [];
          for (let i = 0; i < 80; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            sparks.push({
              x: W / 2 + (Math.random() - 0.5) * 100,
              y: H * 0.18 + (Math.random() - 0.5) * 60,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1,
              color: ['#ff4444', '#ffffff', '#6c63ff', '#a78bfa', '#facc15'][Math.floor(Math.random() * 5)],
              r: 2 + Math.random() * 4,
            });
          }

          // Give balls explosion velocity
          balls.forEach(b => {
            const angle = Math.atan2(b.y - H * 0.18, b.x - W / 2) + (Math.random() - 0.5) * 0.5;
            const speed = 5 + Math.random() * 10;
            b.vx = Math.cos(angle) * speed;
            b.vy = Math.sin(angle) * speed;
          });
          tags.forEach(t => {
            const angle = Math.atan2(t.y - H * 0.18, t.x - W / 2) + (Math.random() - 0.5);
            const speed = 4 + Math.random() * 8;
            t.vx = Math.cos(angle) * speed;
            t.vy = Math.sin(angle) * speed;
            t.rotTarget = (Math.random() - 0.5) * 2;
          });
        }

        if (phase === 0) {
          // RESET: scatter to top
          balls.forEach(b => {
            b.x = Math.random() * W;
            b.y = -20 - Math.random() * H * 2;
            b.vx = (Math.random() - 0.5) * 4;
            b.vy = 2 + Math.random() * 4;
          });
          tags.forEach(t => {
            t.x = Math.random() * W;
            t.y = -40 - Math.random() * H * 2;
            t.vx = (Math.random() - 0.5) * 3;
            t.vy = 1 + Math.random() * 3;
            t.rotation = 0;
          });
          sparks = [];
        }
      }

      const progress = Math.min(phaseTime / PHASE_DURATIONS[phase], 1);

      // === UPDATE BALLS ===
      balls.forEach(b => {
        if (phase === 0) {
          // FALLING: gravity + bounce
          b.vy += 0.15;
          b.x += b.vx;
          b.y += b.vy;
          b.vx *= 0.99;

          if (b.y + b.radius > H) {
            b.y = H - b.radius;
            b.vy *= -0.6;
          }
          if (b.x < b.radius) { b.x = b.radius; b.vx *= -0.7; }
          if (b.x > W - b.radius) { b.x = W - b.radius; b.vx *= -0.7; }

        } else if (phase === 1) {
          // FORMING: ease toward target
          const ease = 0.04 + progress * 0.06;
          b.x += (b.targetX - b.x) * ease;
          b.y += (b.targetY - b.y) * ease;
          b.vx = 0; b.vy = 0;

        } else if (phase === 2) {
          // HOLD: slight vibration
          b.x = b.targetX + (Math.random() - 0.5) * 0.5;
          b.y = b.targetY + (Math.random() - 0.5) * 0.5;

        } else if (phase === 3) {
          // BLAST: fly outward
          b.vy += 0.1;
          b.x += b.vx;
          b.y += b.vy;
          b.vx *= 0.98;
          b.vy *= 0.98;
        }

        draw3DBall(b);
      });

      // === UPDATE TAGS ===
      tags.forEach(t => {
        if (phase === 0) {
          t.vy += 0.1;
          t.x += t.vx;
          t.y += t.vy;
          t.vx *= 0.99;
          if (t.y > H - 20) { t.y = H - 20; t.vy *= -0.5; }
          if (t.x < 40) { t.x = 40; t.vx *= -0.6; }
          if (t.x > W - 40) { t.x = W - 40; t.vx *= -0.6; }
          t.rotation *= 0.98;

        } else if (phase === 1) {
          const ease = 0.03 + progress * 0.04;
          t.x += (t.targetX - t.x) * ease;
          t.y += (t.targetY - t.y) * ease;
          t.rotation *= 0.95;

        } else if (phase === 2) {
          t.x = t.targetX + (Math.random() - 0.5) * 0.3;
          t.y = t.targetY + (Math.random() - 0.5) * 0.3;

        } else if (phase === 3) {
          t.vy += 0.08;
          t.x += t.vx;
          t.y += t.vy;
          t.vx *= 0.98;
          t.rotation += t.rotTarget * 0.02;
        }

        drawTag(t);
      });

      // === GLOW EFFECT during HOLD ===
      if (phase === 2) {
        const glowPulse = 0.5 + Math.sin(phaseTime * 0.005) * 0.3;
        ctx.save();
        ctx.globalAlpha = glowPulse * 0.15;
        ctx.shadowColor = '#6c63ff';
        ctx.shadowBlur = 60;
        const fontSize = Math.min(W * 0.14, 120);
        ctx.font = `900 ${fontSize}px "Inter", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#6c63ff';
        ctx.fillText('CodeSync', W / 2, H * 0.18);
        ctx.restore();
      }

      // === SPARKS ===
      sparks.forEach((s, i) => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05;
        s.life -= 0.015;
        if (s.life <= 0) { sparks.splice(i, 1); return; }

        ctx.globalAlpha = s.life;
        // Glow
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
        g.addColorStop(0, s.color + '80');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    const handleResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="auth-bg-canvas" />;
};

export default AuthBackground;
