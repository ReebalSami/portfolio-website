// V1 — Ruler / Precision Instrument
// Faithful to DESIGN.md: full tick rail, year labels, brackets around active node

const { useState, useEffect, useRef, useCallback } = React;

function TimelineRuler({ entries, tweaks }) {
  const {
    accent = '#FFB800',
    glow = 0.5,
    nodeStyle = 'bracket',
    showTicks = true,
    density = 'standard',
    autoAdvance = 0,
    grainIntensity = 0.05,
    connector = 'none',
  } = tweaks;

  const initialActive = Math.max(0, entries.findIndex((e) => e.active));
  const [active, setActive] = useState(initialActive < 0 ? 0 : initialActive);
  const trackRef = useRef(null);

  // Auto-advance
  useEffect(() => {
    if (!autoAdvance) return;
    const id = setInterval(() => {
      setActive((a) => (a + 1) % entries.length);
    }, autoAdvance * 1000);
    return () => clearInterval(id);
  }, [autoAdvance, entries.length]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setActive((a) => Math.min(a + 1, entries.length - 1));
      if (e.key === 'ArrowLeft') setActive((a) => Math.max(a - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entries.length]);

  // Spacing — entries are evenly distributed across the track
  const STEP = 220; // px between nodes
  const trackWidth = (entries.length - 1) * STEP + 600; // padding
  const centerOffset = 300; // first node at this x
  const railY = 0; // the rail is the central reference; cards/nodes positioned relative

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#101417' }}>
      <GrainBg intensity={grainIntensity} />

      {/* neural mist — large amber radial */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '70vw', height: 420,
          background: `radial-gradient(ellipse at center, ${accent}22, transparent 60%)`,
          filter: `blur(${40 + glow * 80}px)`,
          opacity: 0.35 + glow * 0.5,
        }}
      />

      {/* Header */}
      <div className="absolute" style={{ top: 56, left: 64, right: 64 }}>
        <div className="flex items-baseline justify-between">
          <div>
            <div style={{
              fontFamily: 'Space Grotesk', fontSize: 11, letterSpacing: '0.4em',
              color: accent, textTransform: 'uppercase', marginBottom: 12,
            }}>
              Chapter 01 · Trajectory
            </div>
            <h2 style={{
              fontFamily: 'Space Grotesk', fontSize: 56, fontWeight: 700,
              color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1, margin: 0,
            }}>
              Journey
            </h2>
          </div>
          <div style={{
            fontFamily: 'Inter', fontSize: 11, color: '#8e918f',
            letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'right',
            maxWidth: 280, lineHeight: 1.6,
          }}>
            Banking → Finance Automation → AI Engineering<br/>
            <span style={{ opacity: 0.6 }}>Eleven years on the rail.</span>
          </div>
        </div>
      </div>

      {/* Active card — centered, fixed position above the rail */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '40%',
          transform: 'translate(-50%, -100%)',
          paddingBottom: 48,
        }}
      >
        <TimelineCard
          entry={entries[active]}
          state="active"
          density={density}
          accent={accent}
        />
      </div>

      {/* The Rail — sliding horizontally so active node sits at center */}
      <div
        ref={trackRef}
        className="absolute left-0 right-0"
        style={{ top: '60%', height: 200, overflow: 'hidden' }}
      >
        <div
          className="relative h-full"
          style={{
            width: trackWidth,
            transform: `translateX(calc(50vw - ${centerOffset + active * STEP}px))`,
            transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Main rail line */}
          <div
            className="absolute"
            style={{
              top: 24, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 8%, rgba(255,255,255,0.18) 92%, transparent 100%)',
            }}
          />

          {/* Minor ruler ticks — every 24px between nodes */}
          {showTicks && (
            <div className="absolute" style={{ top: 18, left: 0, right: 0, height: 12 }}>
              {Array.from({ length: Math.floor(trackWidth / 24) }).map((_, i) => {
                const isMajor = i % 4 === 0;
                return (
                  <div key={i} style={{
                    position: 'absolute',
                    left: i * 24,
                    top: isMajor ? 0 : 4,
                    width: 1,
                    height: isMajor ? 12 : 6,
                    background: '#ffffff',
                    opacity: isMajor ? 0.18 : 0.08,
                  }} />
                );
              })}
            </div>
          )}

          {/* Connector dotted curve (optional) */}
          {connector === 'dotted' && (
            <svg
              className="absolute pointer-events-none"
              style={{ top: 0, left: 0, width: trackWidth, height: 200 }}
            >
              <path
                d={entries.map((_, i) => {
                  const x = centerOffset + i * STEP;
                  const y = 24 + (i % 2 === 0 ? -8 : 8);
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                stroke={accent}
                strokeOpacity="0.25"
                strokeWidth="1"
                strokeDasharray="2 4"
                fill="none"
              />
            </svg>
          )}

          {/* Nodes + year labels */}
          {entries.map((e, i) => {
            const x = centerOffset + i * STEP;
            const dist = Math.abs(i - active);
            const state = dist === 0 ? 'active' : dist === 1 ? 'adjacent' : 'inactive';
            return (
              <div key={e.id} style={{ position: 'absolute', left: x, top: 24, transform: 'translate(-50%, -50%)' }}>
                <button
                  onClick={() => setActive(i)}
                  style={{
                    background: 'transparent', border: 'none', padding: 0,
                    cursor: 'pointer', display: 'block',
                  }}
                  aria-label={`${e.year} ${e.role}`}
                >
                  <TimelineNode style={nodeStyle} state={state} accent={accent} glow={glow} />
                </button>
                {/* Year label below the rail */}
                <div style={{
                  position: 'absolute',
                  top: 36,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontFamily: 'Space Grotesk',
                  fontSize: state === 'active' ? 13 : 11,
                  fontWeight: state === 'active' ? 600 : 500,
                  letterSpacing: '0.2em',
                  color: state === 'active' ? accent : '#8e918f',
                  opacity: state === 'inactive' ? 0.5 : 1,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.4s',
                }}>
                  {e.year}
                </div>
                {/* Compact role for adjacent */}
                {state === 'adjacent' && (
                  <div style={{
                    position: 'absolute',
                    top: 60,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontFamily: 'Space Grotesk', fontSize: 10,
                    color: '#c4c7c4', opacity: 0.5,
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

        {/* Center crosshair viewfinder — shows where focus is */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: 0, bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: 1, height: '100%',
            background: `linear-gradient(180deg, transparent 0%, ${accent}30 30%, ${accent}30 70%, transparent 100%)`,
            opacity: 0.4,
          }}
        />
      </div>

      {/* Bottom controls strip */}
      <div className="absolute" style={{ bottom: 56, left: 64, right: 64 }}>
        <div className="flex items-center justify-between">
          <div style={{
            fontFamily: 'Space Grotesk', fontSize: 10, letterSpacing: '0.3em',
            color: '#8e918f', textTransform: 'uppercase',
          }}>
            <span style={{ color: accent }}>{String(active + 1).padStart(2, '0')}</span>
            <span style={{ opacity: 0.4 }}> / {String(entries.length).padStart(2, '0')}</span>
            <span style={{ marginLeft: 24, opacity: 0.6 }}>{entries[active].chapter}</span>
          </div>

          <ProgressDots
            count={entries.length}
            active={active}
            onPick={setActive}
            accent={accent}
          />

          <div className="flex items-center" style={{ gap: 16 }}>
            <a href="#" style={{
              fontFamily: 'Space Grotesk', fontSize: 11, letterSpacing: '0.2em',
              color: '#c4c7c4', textTransform: 'uppercase', textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 2,
            }}>
              Full résumé →
            </a>
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

window.TimelineRuler = TimelineRuler;
