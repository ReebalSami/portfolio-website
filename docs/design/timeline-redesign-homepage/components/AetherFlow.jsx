// AetherFlow — canvas particle network background.
// Drifting particles connect with lines when within a distance threshold.
// Inspired by the "aether flow" aesthetic: flowing light particles that wave
// and link with each other. Tuned to amber/dark palette for the journey timeline.

function AetherFlow({
  accent = '#d58400',
  density = 80,           // particle count baseline (scales with area)
  maxDistance = 140,      // px under which two particles get connected
  speed = 0.25,           // base drift speed
  particleSize = 1.4,     // base radius
  glow = 0.55,            // overall opacity multiplier
  waveAmplitude = 0.6,    // sine-wave influence on vertical drift
  waveFrequency = 0.0015, // wave spatial frequency
  mouseInfluence = 120,   // px radius mouse repulsion
  mouseStrength = 0.6,    // strength of mouse repulsion
  className = '',
  style = {},
}) {
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(0);
  const particlesRef = React.useRef([]);
  const mouseRef = React.useRef({ x: -9999, y: -9999, active: false });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    let t0 = performance.now();

    // Parse hex accent → rgb
    const hex = accent.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const seed = () => {
      // Density scales with area so it feels consistent at any size
      const area = w * h;
      const target = Math.max(20, Math.floor((area / (1280 * 720)) * density));
      const arr = new Array(target).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed * 0.6,
        // give each particle a phase so they don't all wave in unison
        phase: Math.random() * Math.PI * 2,
        size: particleSize * (0.6 + Math.random() * 0.9),
        alpha: 0.4 + Math.random() * 0.6,
      }));
      particlesRef.current = arr;
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const onLeave = () => { mouseRef.current.active = false; };

    const tick = (now) => {
      const dt = Math.min(48, now - t0);
      t0 = now;
      const elapsed = now * 0.001;

      ctx.clearRect(0, 0, w, h);

      const ps = particlesRef.current;
      const m = mouseRef.current;

      // Update positions
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];

        // Sine wave influence — gentle vertical sway based on x position + time
        const wave = Math.sin(p.x * waveFrequency + elapsed * 0.5 + p.phase) * waveAmplitude * 0.05;
        p.vy += wave * 0.01;

        // Mouse repulsion
        if (m.active) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const d2 = dx * dx + dy * dy;
          const r2 = mouseInfluence * mouseInfluence;
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / mouseInfluence) * mouseStrength;
            p.vx += (dx / d) * f * 0.3;
            p.vy += (dy / d) * f * 0.3;
          }
        }

        // Damp velocities so they don't accelerate forever
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Re-energize so they keep drifting
        const minSpeed = speed * 0.4;
        const sp = Math.hypot(p.vx, p.vy);
        if (sp < minSpeed) {
          const ang = Math.atan2(p.vy, p.vx) || (Math.random() * Math.PI * 2);
          p.vx = Math.cos(ang) * minSpeed * (0.8 + Math.random() * 0.4);
          p.vy = Math.sin(ang) * minSpeed * (0.8 + Math.random() * 0.4);
        }

        // Integrate
        p.x += p.vx * dt * 0.06;
        p.y += p.vy * dt * 0.06;

        // Wrap edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }

      // Draw connecting lines first (under particles)
      const maxD2 = maxDistance * maxDistance;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < ps.length; i++) {
        const a = ps[i];
        for (let j = i + 1; j < ps.length; j++) {
          const c = ps[j];
          const dx = a.x - c.x;
          const dy = a.y - c.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxD2) {
            const d = Math.sqrt(d2);
            const t = 1 - d / maxDistance;
            const alpha = t * t * 0.55 * glow;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(c.x, c.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        // Soft halo
        const haloR = p.size * 4;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloR);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.5 * p.alpha * glow})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(255, 245, 220, ${p.alpha * glow})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [accent, density, maxDistance, speed, particleSize, glow, waveAmplitude, waveFrequency, mouseInfluence, mouseStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'auto',
        ...style,
      }}
    />
  );
}

window.AetherFlow = AetherFlow;
