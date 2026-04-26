// V2 — Constellation Path
// Nodes connected by a flowing dotted path that curves up/down by index — closer to Stitch ref but in your palette

const { useState: useState2, useEffect: useEffect2, useRef: useRef2 } = React;

function TimelineConstellation({ entries, tweaks }) {
  const {
    accent = '#FFB800',
    glow = 0.5,
    nodeStyle = 'dot',
    showTicks = false,
    density = 'standard',
    autoAdvance = 0,
    grainIntensity = 0.05,
  } = tweaks;

  const initialActive = Math.max(0, entries.findIndex((e) => e.active));
  const [active, setActive] = useState2(initialActive < 0 ? 0 : initialActive);

  useEffect2(() => {
    if (!autoAdvance) return;
    const id = setInterval(() => setActive((a) => (a + 1) % entries.length), autoAdvance * 1000);
    return () => clearInterval(id);
  }, [autoAdvance, entries.length]);

  useEffect2(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setActive((a) => Math.min(a + 1, entries.length - 1));
      if (e.key === 'ArrowLeft') setActive((a) => Math.max(a - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entries.length]);

  const STEP = 280;
  const trackWidth = (entries.length - 1) * STEP + 800;
  const centerOffset = 400;

  // Generate curve y-offsets per node (organic wave)
  const yOffsets = entries.map((_, i) => Math.sin(i * 1.2) * 18);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#101417' }}>
      <GrainBg intensity={grainIntensity} />

      {/* Large ambient amber */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '55%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '80vw', height: 500,
          background: `radial-gradient(ellipse at center, ${accent}30, transparent 65%)`,
          filter: `blur(${60 + glow * 100}px)`,
          opacity: 0.4 + glow * 0.4,
        }}
      />

      {/* Header */}
      <div className="absolute" style={{ top: 56, left: 64, right: 64 }}>
        <div className="flex items-end justify-between">
          <h2 style={{
            fontFamily: 'Space Grotesk', fontSize: 56, fontWeight: 700,
            color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1, margin: 0,
          }}>
            Journey<span style={{ color: accent }}>.</span>
          </h2>
          <div style={{
            fontFamily: 'Inter', fontSize: 12, color: '#c4c7c4', opacity: 0.7,
            maxWidth: 320, textAlign: 'right', lineHeight: 1.6,
          }}>
            A constellation of roles. Click a star.
          </div>
        </div>
      </div>

      {/* Active card */}
      <div
        className="absolute"
        style={{
          left: '50%', top: '38%',
          transform: 'translate(-50%, -100%)',
          paddingBottom: 56,
        }}
      >
        <TimelineCard entry={entries[active]} state="active" density={density} accent={accent} />
      </div>

      {/* Track */}
      <div className="absolute left-0 right-0" style={{ top: '54%', height: 280, overflow: 'hidden' }}>
        <div
          className="relative h-full"
          style={{
            width: trackWidth,
            transform: `translateX(calc(50vw - ${centerOffset + active * STEP}px))`,
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Curved dotted path connecting all nodes */}
          <svg
            className="absolute pointer-events-none"
            style={{ top: 0, left: 0, width: trackWidth, height: 280 }}
          >
            <defs>
              <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={accent} stopOpacity="0" />
                <stop offset="20%" stopColor={accent} stopOpacity="0.4" />
                <stop offset="80%" stopColor={accent} stopOpacity="0.4" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={entries.map((_, i) => {
                const x = centerOffset + i * STEP;
                const y = 90 + yOffsets[i];
                if (i === 0) return `M ${x} ${y}`;
                const px = centerOffset + (i - 1) * STEP;
                const py = 90 + yOffsets[i - 1];
                const cx1 = px + STEP * 0.5;
                const cx2 = x - STEP * 0.5;
                return `C ${cx1} ${py}, ${cx2} ${y}, ${x} ${y}`;
              }).join(' ')}
              stroke="url(#pathGrad)"
              strokeWidth="1"
              strokeDasharray="3 5"
              fill="none"
            />
          </svg>

          {/* Optional ruler ticks under path */}
          {showTicks && (
            <div className="absolute" style={{ bottom: 80, left: 0, right: 0, height: 8 }}>
              {Array.from({ length: Math.floor(trackWidth / 16) }).map((_, i) => {
                const isMajor = i % 6 === 0;
                return (
                  <div key={i} style={{
                    position: 'absolute', left: i * 16, top: 0,
                    width: 1, height: isMajor ? 8 : 4,
                    background: '#ffffff', opacity: isMajor ? 0.15 : 0.06,
                  }} />
                );
              })}
            </div>
          )}

          {/* Nodes */}
          {entries.map((e, i) => {
            const x = centerOffset + i * STEP;
            const y = 90 + yOffsets[i];
            const dist = Math.abs(i - active);
            const state = dist === 0 ? 'active' : dist === 1 ? 'adjacent' : 'inactive';
            return (
              <div key={e.id} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)' }}>
                <button
                  onClick={() => setActive(i)}
                  style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  <TimelineNode style={nodeStyle} state={state} accent={accent} glow={glow} />
                </button>
                {/* year label */}
                <div style={{
                  position: 'absolute',
                  top: state === 'active' ? 38 : 28,
                  left: '50%', transform: 'translateX(-50%)',
                  fontFamily: 'Space Grotesk',
                  fontSize: state === 'active' ? 14 : 11,
                  fontWeight: state === 'active' ? 600 : 500,
                  letterSpacing: '0.2em',
                  color: state === 'active' ? accent : '#8e918f',
                  opacity: state === 'inactive' ? 0.5 : 1,
                  whiteSpace: 'nowrap', transition: 'all 0.4s',
                }}>
                  {e.year}
                </div>
                {state === 'adjacent' && (
                  <div style={{
                    position: 'absolute', top: 50, left: '50%',
                    transform: 'translateX(-50%)',
                    fontFamily: 'Space Grotesk', fontSize: 10,
                    color: '#c4c7c4', opacity: 0.55,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    whiteSpace: 'nowrap',
                  }}>
                    {e.role.length > 22 ? e.role.slice(0, 20) + '…' : e.role}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute" style={{ bottom: 56, left: 64, right: 64 }}>
        <div className="flex items-center justify-between">
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, letterSpacing: '0.3em', color: '#8e918f', textTransform: 'uppercase' }}>
            <span style={{ color: accent }}>{String(active + 1).padStart(2, '0')}</span>
            <span style={{ opacity: 0.4 }}> / {String(entries.length).padStart(2, '0')}</span>
          </div>
          <ProgressDots count={entries.length} active={active} onPick={setActive} accent={accent} />
          <div className="flex items-center" style={{ gap: 16 }}>
            <a href="#" style={{
              fontFamily: 'Space Grotesk', fontSize: 11, letterSpacing: '0.2em',
              color: '#c4c7c4', textTransform: 'uppercase', textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 2,
            }}>Full résumé →</a>
            <NavArrows
              onPrev={() => setActive((a) => Math.max(a - 1, 0))}
              onNext={() => setActive((a) => Math.min(a + 1, entries.length - 1))}
              atStart={active === 0}
              atEnd={active === entries.length - 1}
              accent={accent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

window.TimelineConstellation = TimelineConstellation;
