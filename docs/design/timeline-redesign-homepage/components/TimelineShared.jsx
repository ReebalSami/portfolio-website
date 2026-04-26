// Shared visual primitives for all timeline variants.
// Exposes: TimelineNode, TimelineCard, RailTicks, NavArrows, ProgressDots, GrainBg

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// --- Grain background ---
function GrainBg({ intensity = 0.05 }) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='${intensity}'/></svg>`;
  return (
    <div
      className="absolute inset-0 pointer-events-none mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
        backgroundSize: '180px 180px',
      }}
    />
  );
}

// --- Node renderer (4 styles) ---
// styles: 'dot' | 'bar' | 'bracket' | 'ruler-cluster'
function TimelineNode({ style = 'bracket', state = 'inactive', accent = '#FFB800', glow = 0.5 }) {
  // state: 'active' | 'adjacent' | 'inactive'
  const isActive = state === 'active';
  const isAdjacent = state === 'adjacent';
  const op = isActive ? 1 : isAdjacent ? 0.6 : 0.35;
  const glowPx = Math.round(8 + glow * 24);
  const glowAlpha = 0.15 + glow * 0.55;

  if (style === 'dot') {
    return (
      <div className="relative grid place-items-center" style={{ width: 40, height: 40 }}>
        {isActive && (
          <div
            className="absolute rounded-full animate-pulse"
            style={{
              width: 36, height: 36,
              border: `1px solid ${accent}`,
              opacity: 0.35,
            }}
          />
        )}
        <div
          className="rounded-full"
          style={{
            width: isActive ? 10 : 6, height: isActive ? 10 : 6,
            background: accent,
            opacity: op,
            boxShadow: isActive ? `0 0 ${glowPx}px ${accent}${Math.round(glowAlpha * 255).toString(16).padStart(2, '0')}` : 'none',
          }}
        />
      </div>
    );
  }
  if (style === 'bar') {
    return (
      <div className="relative grid place-items-center" style={{ width: 40, height: 40 }}>
        <div style={{
          width: 1.5, height: isActive ? 28 : 16,
          background: accent, opacity: op,
          boxShadow: isActive ? `0 0 ${glowPx}px ${accent}` : 'none',
        }} />
        <div className="absolute rounded-full" style={{ width: 4, height: 4, background: accent, opacity: op }} />
      </div>
    );
  }
  if (style === 'ruler-cluster') {
    // central tall tick + flanking minor ticks (your DESIGN.md ruler motif)
    return (
      <div className="relative grid place-items-center" style={{ width: 60, height: 40 }}>
        {[-20, -10, 0, 10, 20].map((dx) => {
          const isCenter = dx === 0;
          const h = isCenter ? (isActive ? 28 : 18) : Math.abs(dx) === 10 ? 8 : 12;
          return (
            <div key={dx} style={{
              position: 'absolute', left: `calc(50% + ${dx}px)`, top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 1, height: h,
              background: isCenter ? accent : '#ffffff',
              opacity: isCenter ? op : 0.25,
              boxShadow: isCenter && isActive ? `0 0 ${glowPx}px ${accent}` : 'none',
            }} />
          );
        })}
        {isActive && (
          <div className="absolute rounded-full" style={{ width: 4, height: 4, background: accent, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        )}
      </div>
    );
  }
  // 'bracket' — the user's choice (option 4): 4 corner brackets around center dot
  const bracketSize = isActive ? 28 : 14;
  const cornerLen = isActive ? 8 : 4;
  const cornerColor = isActive ? accent : '#ffffff';
  const cornerOp = isActive ? 1 : 0.35;
  return (
    <div className="relative grid place-items-center" style={{ width: 48, height: 48 }}>
      {isActive && (
        <div
          className="absolute rounded-sm"
          style={{
            width: bracketSize + 16, height: bracketSize + 16,
            boxShadow: `0 0 ${glowPx}px ${accent}${Math.round(glowAlpha * 255).toString(16).padStart(2, '0')}`,
          }}
        />
      )}
      {/* 4 corners */}
      {[
        { top: 0, left: 0, borders: 'border-t border-l' },
        { top: 0, right: 0, borders: 'border-t border-r' },
        { bottom: 0, left: 0, borders: 'border-b border-l' },
        { bottom: 0, right: 0, borders: 'border-b border-r' },
      ].map((p, i) => (
        <div key={i} className={p.borders} style={{
          position: 'absolute',
          ...p,
          width: cornerLen, height: cornerLen,
          borderColor: cornerColor,
          opacity: cornerOp,
          left: p.left !== undefined ? `calc(50% - ${bracketSize / 2}px)` : undefined,
          right: p.right !== undefined ? `calc(50% - ${bracketSize / 2}px)` : undefined,
          top: p.top !== undefined ? `calc(50% - ${bracketSize / 2}px)` : undefined,
          bottom: p.bottom !== undefined ? `calc(50% - ${bracketSize / 2}px)` : undefined,
        }} />
      ))}
      <div className="rounded-full" style={{
        width: isActive ? 5 : 3, height: isActive ? 5 : 3,
        background: accent, opacity: op,
      }} />
    </div>
  );
}

// --- Card ---
// density: 'compact' | 'standard' | 'detailed'
function TimelineCard({ entry, state = 'active', density = 'standard', accent = '#FFB800', align = 'above' }) {
  const isActive = state === 'active';
  const isAdjacent = state === 'adjacent';

  if (state === 'inactive') return null;

  // compact card for adjacent-but-not-active
  if (!isActive) {
    return (
      <div
        className="text-center transition-all duration-500 select-none"
        style={{
          opacity: isAdjacent ? 0.45 : 0.2,
          transform: 'translateY(0)',
        }}
      >
        <div style={{
          fontFamily: 'Space Grotesk', fontSize: 11, letterSpacing: '0.2em',
          color: accent, opacity: 0.7, marginBottom: 6,
        }}>
          {entry.year}
        </div>
        <div style={{
          fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: 500,
          color: '#e0e2e6', textTransform: 'uppercase', letterSpacing: '0.05em',
          maxWidth: 180,
        }}>
          {entry.role}
        </div>
      </div>
    );
  }

  // active card
  const showKeywords = density !== 'compact';
  const showTagline = density === 'detailed' || density === 'standard';
  const showOrg = true;

  return (
    <div className="text-center transition-all duration-500 select-none" style={{ maxWidth: 360 }}>
      {/* chapter caps */}
      <div style={{
        fontFamily: 'Space Grotesk', fontSize: 10, letterSpacing: '0.3em',
        color: '#8e918f', textTransform: 'uppercase', marginBottom: 12,
      }}>
        Chapter · {entry.chapter}
      </div>

      {/* year range */}
      <div style={{
        fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.15em',
        color: accent, marginBottom: 10, textTransform: 'uppercase',
      }}>
        {entry.yearRange}
      </div>

      {/* role */}
      <h3 style={{
        fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 600,
        color: '#ffffff', letterSpacing: '-0.01em', lineHeight: 1.2,
        textTransform: 'uppercase', marginBottom: 6,
      }}>
        {entry.role}
      </h3>

      {/* org · place */}
      {showOrg && (
        <div style={{
          fontFamily: 'Inter', fontSize: 13, color: '#c4c7c4',
          marginBottom: showTagline ? 14 : 8,
        }}>
          {entry.org} · <span style={{ opacity: 0.6 }}>{entry.place}</span>
        </div>
      )}

      {/* tagline */}
      {showTagline && entry.tagline && (
        <p style={{
          fontFamily: 'Inter', fontSize: 13, lineHeight: 1.55,
          color: '#c4c7c4', opacity: 0.85, marginBottom: 16,
          maxWidth: 320, marginLeft: 'auto', marginRight: 'auto',
        }}>
          {entry.tagline}
        </p>
      )}

      {/* keywords */}
      {showKeywords && (
        <div className="flex justify-center flex-wrap" style={{ gap: 6, marginTop: 14 }}>
          {entry.keywords.map((k) => (
            <span key={k} style={{
              fontFamily: 'Space Grotesk', fontSize: 9.5, letterSpacing: '0.18em',
              color: '#c4c7c4', textTransform: 'uppercase',
              padding: '4px 9px',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 2,
              backdropFilter: 'blur(4px)',
            }}>
              {k}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Nav arrows (ghost, your design system) ---
function NavArrows({ onPrev, onNext, atStart, atEnd, accent = '#FFB800' }) {
  const btn = (dir, onClick, disabled) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 44, height: 44,
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.18)',
        color: '#e0e2e6',
        borderRadius: 2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.25 : 1,
        transition: 'all 0.25s',
        display: 'grid', placeItems: 'center',
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.boxShadow = `0 0 18px ${accent}40, inset 0 0 12px ${accent}10`;
        e.currentTarget.style.color = accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.color = '#e0e2e6';
      }}
      aria-label={dir === 'prev' ? 'Previous' : 'Next'}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        {dir === 'prev'
          ? <path d="M9 2 L4 7 L9 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
          : <path d="M5 2 L10 7 L5 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />}
      </svg>
    </button>
  );
  return (
    <div className="flex" style={{ gap: 8 }}>
      {btn('prev', onPrev, atStart)}
      {btn('next', onNext, atEnd)}
    </div>
  );
}

// --- Progress dots minimap ---
function ProgressDots({ count, active, onPick, accent = '#FFB800' }) {
  return (
    <div className="flex items-center" style={{ gap: 6 }}>
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active;
        return (
          <button
            key={i}
            onClick={() => onPick(i)}
            aria-label={`Go to entry ${i + 1}`}
            style={{
              width: isActive ? 22 : 6, height: 2,
              background: isActive ? accent : 'rgba(255,255,255,0.2)',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.4s ease',
              padding: 0,
              boxShadow: isActive ? `0 0 8px ${accent}` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

// expose globally for sibling babel scripts
Object.assign(window, { GrainBg, TimelineNode, TimelineCard, NavArrows, ProgressDots });
