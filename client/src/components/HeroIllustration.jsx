import { useEffect, useRef } from 'react';

const HeroIllustration = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 700;
    const H = canvas.height = 340;

    // White falling particles
    const balls = [];
    for (let i = 0; i < 60; i++) {
      balls.push({
        x: Math.random() * W,
        y: Math.random() * H - H,
        r: 1.5 + Math.random() * 3,
        speed: 0.5 + Math.random() * 1.5,
        opacity: 0.2 + Math.random() * 0.6,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.02,
      });
    }

    // 4 People sitting positions
    const people = [
      { x: 100, y: 220, color: '#6c63ff', skin: '#e8b4a0' },
      { x: 250, y: 200, color: '#a78bfa', skin: '#c68b64' },
      { x: 420, y: 210, color: '#38bdf8', skin: '#f0c8a8' },
      { x: 570, y: 195, color: '#f472b6', skin: '#a67c52' },
    ];

    const drawPerson = (p, time) => {
      const bob = Math.sin(time * 0.002 + p.x) * 2;

      // Chair/desk
      ctx.fillStyle = 'rgba(30, 30, 46, 0.8)';
      ctx.fillRect(p.x - 30, p.y + 45, 60, 8);
      ctx.fillRect(p.x - 25, p.y + 53, 8, 25);
      ctx.fillRect(p.x + 18, p.y + 53, 8, 25);

      // Laptop base
      ctx.fillStyle = '#45475a';
      ctx.beginPath();
      ctx.roundRect(p.x - 22, p.y + 30 + bob, 44, 16, 3);
      ctx.fill();

      // Laptop screen
      ctx.fillStyle = '#1e1e2e';
      ctx.beginPath();
      ctx.roundRect(p.x - 18, p.y + 5 + bob, 36, 26, 3);
      ctx.fill();

      // Screen glow
      const grad = ctx.createLinearGradient(p.x - 14, p.y + 8, p.x + 14, p.y + 28);
      grad.addColorStop(0, p.color + '40');
      grad.addColorStop(1, p.color + '15');
      ctx.fillStyle = grad;
      ctx.fillRect(p.x - 15, p.y + 8 + bob, 30, 20);

      // Code lines on screen
      ctx.fillStyle = p.color + '90';
      const lineY = p.y + 12 + bob;
      for (let i = 0; i < 4; i++) {
        const lw = 8 + Math.random() * 14;
        ctx.fillRect(p.x - 12, lineY + i * 4, lw, 1.5);
      }

      // Screen light glow on face
      ctx.fillStyle = p.color + '08';
      ctx.beginPath();
      ctx.arc(p.x, p.y + 10, 40, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 25 + bob, 14, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = p.skin;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 8 + bob, 12, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = p.x > 300 ? '#2d2d3d' : '#4a3728';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 12 + bob, 12, Math.PI, Math.PI * 2);
      ctx.fill();

      // Arms reaching to laptop
      ctx.strokeStyle = p.skin;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      // Left arm
      ctx.beginPath();
      ctx.moveTo(p.x - 12, p.y + 15 + bob);
      ctx.quadraticCurveTo(p.x - 18, p.y + 28 + bob, p.x - 15, p.y + 33 + bob);
      ctx.stroke();
      // Right arm
      ctx.beginPath();
      ctx.moveTo(p.x + 12, p.y + 15 + bob);
      ctx.quadraticCurveTo(p.x + 18, p.y + 28 + bob, p.x + 15, p.y + 33 + bob);
      ctx.stroke();

      // WiFi signal above (connection indicator)
      const signalAlpha = 0.3 + Math.sin(time * 0.003 + p.x) * 0.2;
      ctx.strokeStyle = `rgba(108, 99, 255, ${signalAlpha})`;
      ctx.lineWidth = 1.5;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(p.x, p.y - 28 + bob, 4 * i, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.stroke();
      }
    };

    // Connection lines between people
    const drawConnections = (time) => {
      for (let i = 0; i < people.length; i++) {
        for (let j = i + 1; j < people.length; j++) {
          const p1 = people[i];
          const p2 = people[j];
          const pulse = Math.sin(time * 0.002 + i + j) * 0.5 + 0.5;

          ctx.strokeStyle = `rgba(108, 99, 255, ${0.05 + pulse * 0.08})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y - 25);
          ctx.lineTo(p2.x, p2.y - 25);
          ctx.stroke();
          ctx.setLineDash([]);

          // Data dot traveling along connection
          const t = (time * 0.001 + i * 0.3) % 1;
          const dotX = p1.x + (p2.x - p1.x) * t;
          const dotY = (p1.y - 25) + ((p2.y - 25) - (p1.y - 25)) * t;
          ctx.fillStyle = `rgba(167, 139, 250, ${0.6 * pulse})`;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    let frame;
    const animate = (time) => {
      ctx.clearRect(0, 0, W, H);

      // Draw connection lines
      drawConnections(time);

      // Draw people
      people.forEach(p => drawPerson(p, time));

      // Draw falling white balls
      balls.forEach(b => {
        b.y += b.speed;
        b.wobble += b.wobbleSpeed;
        b.x += Math.sin(b.wobble) * 0.3;

        if (b.y > H + 10) {
          b.y = -10;
          b.x = Math.random() * W;
        }

        // Glow
        const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 3);
        grd.addColorStop(0, `rgba(255, 255, 255, ${b.opacity * 0.4})`);
        grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core ball
        ctx.globalAlpha = b.opacity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      frame = requestAnimationFrame(animate);
    };

    animate(0);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="hero-illustration">
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-illustration-label">
        <span>Real-time collaboration in action</span>
      </div>
    </div>
  );
};

export default HeroIllustration;
