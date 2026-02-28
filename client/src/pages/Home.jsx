import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiCode, FiUsers, FiCpu, FiZap, FiGlobe, FiShield, FiArrowRight } from 'react-icons/fi';
import HeroIllustration from '../components/HeroIllustration';

const CODE_SNIPPETS = [
  'const app = express();', 'import React from "react";', 'async function fetchData() {',
  'console.log("Hello World");', 'return response.json();', 'npm install socket.io',
  'git commit -m "feat"', 'const [state, setState]', 'useEffect(() => {', '});',
  'export default App;', 'router.get("/api")', 'try { await db.find() }',
  'socket.emit("join")', 'peer.createOffer()', 'const stream = await',
  '.then(res => res.data)', 'module.exports = {', 'app.listen(5000)',
  'import mongoose from', '<div className="">', 'function Component() {',
  'border-radius: 12px;', 'display: flex;', 'animation: fadeIn 1s;',
];

const Home = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Floating code particles
    const particles = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        text: CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)],
        speed: 0.15 + Math.random() * 0.4,
        opacity: 0.04 + Math.random() * 0.12,
        size: 10 + Math.random() * 4,
        drift: (Math.random() - 0.5) * 0.3,
      });
    }

    // Glowing nodes (connection dots)
    const nodes = [];
    for (let i = 0; i < 60; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 1.5 + Math.random() * 2,
      });
    }

    let animFrame;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connection lines between nearby nodes
      ctx.strokeStyle = 'rgba(108, 99, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.globalAlpha = (1 - dist / 150) * 0.15;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw & move nodes
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#6c63ff';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw floating code text
      ctx.font = '13px "JetBrains Mono", monospace';
      particles.forEach(p => {
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = '#6c63ff';
        ctx.fillText(p.text, p.x, p.y);
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
          p.text = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
        }
      });

      ctx.globalAlpha = 1;
      animFrame = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="landing-page">
      <canvas ref={canvasRef} className="landing-canvas" />

      {/* Header */}
      <header className="landing-header">
        <div className="landing-brand">
          <div className="sidebar-logo-icon">⚡</div>
          <span>CodeSync</span>
        </div>
        <nav className="landing-nav-btns">
          <Link to="/login" className="btn-ghost">Sign In</Link>
          <Link to="/signup" className="btn-primary-glow">
            Get Started <FiArrowRight size={14} />
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-badge animate-slide-up">
          <FiZap size={14} /> Real-Time Collaboration
        </div>
        <h1 className="hero-title animate-slide-up">
          Code Together, <br />
          <span className="gradient-text">Ship Faster.</span>
        </h1>
        <p className="hero-subtitle animate-slide-up">
          A real-time collaborative code editor with AI-powered reviews,
          live cursors, voice & video chat, and instant code execution.
          Built for teams that move fast.
        </p>
        <div className="hero-cta animate-slide-up">
          <Link to="/signup" className="btn-primary-glow btn-lg">
            Start Coding Free <FiArrowRight />
          </Link>
          <Link to="/login" className="btn-outline-glow btn-lg">
            Sign In
          </Link>
        </div>

        <HeroIllustration />

        <div className="hero-stats animate-slide-up">
          <div className="stat-item">
            <span className="stat-number">8+</span>
            <span className="stat-label">Languages</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">Real-Time</span>
            <span className="stat-label">Collaboration</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">AI</span>
            <span className="stat-label">Code Review</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <h2 className="features-heading">
          Everything you need to <span className="gradient-text">collaborate</span>
        </h2>
        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon"><FiCode /></div>
            <h3>Live Code Editor</h3>
            <p>Write code together in real-time with Monaco Editor. See every keystroke from your teammates instantly.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon"><FiUsers /></div>
            <h3>Live Cursors</h3>
            <p>Track your teammates' cursor positions in real-time with color-coded labels. Know who's editing where.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon"><FiCpu /></div>
            <h3>AI Code Review</h3>
            <p>Get instant AI-powered code reviews and suggestions. Chat with AI to debug and improve your code.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon"><FiZap /></div>
            <h3>Instant Execution</h3>
            <p>Run your code in 8+ languages directly in the browser. See output in real-time without switching tabs.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon"><FiGlobe /></div>
            <h3>Voice & Video</h3>
            <p>Built-in WebRTC voice and video calling. Discuss code without leaving the editor.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon"><FiShield /></div>
            <h3>Version History</h3>
            <p>Save and restore code versions with a single click. Never lose your work again.</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="landing-footer-cta">
        <h2>Ready to code with your team?</h2>
        <p>Join thousands of developers collaborating in real-time.</p>
        <Link to="/signup" className="btn-primary-glow btn-lg">
          Get Started — It's Free <FiArrowRight />
        </Link>
      </section>

      <footer className="landing-footer">
        <span>© 2026 CodeSync. Built with ❤️ by Nitesh Kumar</span>
      </footer>
    </div>
  );
};

export default Home;
