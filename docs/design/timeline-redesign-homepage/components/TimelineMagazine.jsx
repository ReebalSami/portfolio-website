// V3 — Magazine Track
// Cards alternate above/below a centered rail; editorial pull-quote feel; no card "card" chrome — pure typography

const { useState: useState3, useEffect: useEffect3 } = React;

function TimelineMagazine({ entries, tweaks }) {
  const {
    accent = '#FFB800',
    glow = 0.5,
    nodeStyle = 'bracket',
    showTicks = true,
    density = 'standard',
    autoAdvance = 0,
    grainIntensity = 0.05,
  } = tweaks;

  const initialActive = Math.max(0, entries.findIndex((e) => e.active));
  const [active, setActive] = useState3(initialActive < 0 ? 0 : initialActive);

  useEffect3(() => {
    if (!autoAdvance) return;
    const id = setInterval(() => setActive((a) => (a + 1) % entries.length), autoAdvance * 1000);
    return () => clearInterval(id);
  }, [autoAdvance, entries.length]);

  useEffect3(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setActive((a) => Math.min(a + 1, entries.length - 1));
      if (e.key === 'ArrowLeft') setActive((a) => Math.max(a - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entries.length]);

  const STEP = 320;
  const trackWidth = (entries.length - 1) * STEP + 900;
  const centerOffset = 450;

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#101417' }}>
      <GrainBg intensity={grainIntensity} />

      {/* ambient */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '60vw', height: 300,
          background: `radial-gradient(ellipse at center, ${accent}1a, transparent 70%)`,
          filter: `blur(${50 + glow * 80}px)`,
          opacity: 0.5 + glow * 0.4,
        }}
      />

      {/* Header — left */}
      <div className="absolute" style={{ top: 56, left: 64, maxWidth: 380 }}>
        <div style={{
          fontFamily: 'Space Grotesk', fontSize: 10, letterSpacing: '0.4em',
          color: accent, textTransform: 'uppercase', marginBottom: 10,
        }}>
          Vol. 2026 · Issue 04
        </div>
        <h2 style={{
          fontFamily: 'Space Grotesk', fontSize: 80, fontWeight: 700,
          color: '#ffffff', letterSpacing: '-0.05em', lineHeight: 0.9, margin: 0,
        }}>
          Journey
        </h2>
        <div style={{
          fontFamily: 'Inter', fontStyle: 'italic', fontSize: 13,
          color: '#c4c7c4', opacity: 0.7, marginTop: 14, lineHeight: 1.6,
        }}>
          From ledgers in Damascus to multi-agent systems in Hamburg.
        </div>
      </div>

      {/* Top-right meta */}
      <div className="absolute" style={{ top: 56, right: 64, textAlign: 'right' }}>
        <div style={{
          fontFamily: 'Space Grotesk', fontSize: 11, letterSpacing: '0.2em',
          color: '#8e918f', textTransform: 'uppercase',
        }}>
          {String(active + 1).padStart(2, '0')} / {String(entries.length).padStart(2, '0')}
        </div>
        <div style={{
          fontFamily: 'Space Grotesk', fontSize: 11, letterSpacing: '0.2em',
          color: accent, textTransform: 'uppercase', marginTop: 6,
        }}>
          {entries[active].chapter}
        </div>
      </div>

      {/* Track — centered vertically */}
      <div className="absolute left-0 right-0" style={{ top: '50%', transform: 'translateY(-50%)', height: 480, overflow: 'hidden' }}>
        <div
          className="relative h-full"
          style={{
            width: trackWidth,
            transform: `translateX(calc(50vw - ${centerOffset + active * STEP}px))`,
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Centered rail */}
          <div className="absolute" style={{
            top: 240, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 6%, rgba(255,255,255,0.18) 94%, transparent 100%)',
          }} />

          {/* Ticks */}
          {showTicks && (
            <div className="absolute" style={{ top: 234, left: 0, right: 0, height: 14 }}>
              {Array.from({ length: Math.floor(trackWidth / 20) }).map((_, i) => {
                const isMajor = i % 5 === 0;
                return (
                  <div key={i} style={{
                    position: 'absolute', left: i * 20,
                    top: isMajor ? 0 : 4,
                    width: 1, height: isMajor ? 14 : 6,
                    background: '#ffffff', opacity: isMajor ? 0.15 : 0.07,
                  }} />
                );
              })}
            </div>
          )}

          {/* Entries — alternating above/below */}
          {entries.map((e, i) => {
            const x = centerOffset + i * STEP;
            const dist = Math.abs(i - active);
            const state = dist === 0 ? 'active' : dist === 1 ? 'adjacent' : 'inactive';
            const above = i % 2 === 0;

            return (
              <div key={e.id} style={{ position: 'absolute', left: x, top: 240, transform: 'translate(-50%, -50%)' }}>
                {/* Connector line from rail to card */}
                {state !== 'inactive' && (
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: above ? -120 : 8,
                    width: 1,
                    height: 100,
                    background: state === 'active'
                      ? `linear-gradient(${above ? '0deg' : '180deg'}, ${accent}80, ${accent}10)`
                      : 'linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
                    transform: 'translateX(-50%)',
                  }} />
                )}

                {/* Node on rail */}
                <button
                  onClick={() => setActive(i)}
                  style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', position: 'relative', zIndex: 2 }}
                >
                  <TimelineNode style={nodeStyle} state={state} accent={accent} glow={glow} />
                </button>

                {/* Card content */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  [above ? 'bottom' : 'top']: 110,
                  transform: 'translateX(-50%)',
                  width: 320,
                }}>
                  {state === 'active' ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.2em',
                        color: accent, textTransform: 'uppercase', marginBottom: 10,
                      }}>{e.yearRange}</div>
                      <h3 style={{
                        fontFamily: 'Space Grotesk', fontSize: 26, fontWeight: 600,
                        color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.15,
                        textTransform: 'uppercase', margin: '0 0 8px',
                      }}>{e.role}</h3>
                      <div style={{
                        fontFamily: 'Inter', fontSize: 13, color: '#c4c7c4',
                        marginBottom: 14,
                      }}>
                        {e.org} <span style={{ opacity: 0.5 }}>·</span> <span style={{ opacity: 0.6 }}>{e.place}</span>
                      </div>
                      {density !== 'compact' && (
                        <p style={{
                          fontFamily: 'Inter', fontSize: 13.5, fontStyle: 'italic',
                          lineHeight: 1.55, color: '#e0e2e6', opacity: 0.85,
                          margin: 0, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto',
                        }}>
                          “{e.tagline}”
                        </p>
                      )}
                      {density === 'detailed' && (
                        <div className="flex justify-center flex-wrap" style={{ gap: 6, marginTop: 14 }}>
                          {e.keywords.map((k) => (
                            <span key={k} style={{
                              fontFamily: 'Space Grotesk', fontSize: 9.5, letterSpacing: '0.18em',
                              color: '#c4c7c4', textTransform: 'uppercase',
                              padding: '4px 9px',
                              border: '1px solid rgba(255,255,255,0.12)',
                              borderRadius: 2,
                            }}>{k}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', opacity: state === 'adjacent' ? 0.5 : 0.25 }}>
                      <div style={{
                        fontFamily: 'Space Grotesk', fontSize: 11, letterSpacing: '0.2em',
                        color: accent, opacity: 0.7, marginBottom: 6,
                      }}>{e.year}</div>
                      <div style={{
                        fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: 500,
                        color: '#e0e2e6', textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>{e.role}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute" style={{ bottom: 48, left: 64, right: 64 }}>
        <div className="flex items-center justify-between">
          <a href="#" style={{
            fontFamily: 'Space Grotesk', fontSize: 11, letterSpacing: '0.2em',
            color: '#c4c7c4', textTransform: 'uppercase', textDecoration: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 2,
          }}>Full résumé →</a>
          <ProgressDots count={entries.length} active={active} onPick={setActive} accent={accent} />
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
  );
}

window.TimelineMagazine = TimelineMagazine;
