// V4 — Hybrid: Magazine card layout + Constellation wave nodes
// V2's organic wave positions, no connecting line — just milestone nodes + V3 editorial chrome

const { useState: useState4, useEffect: useEffect4, useRef: useRef4, useCallback: useCallback4 } = React;

function TimelineHybrid({ entries, tweaks }) {
  const {
    accent = '#FFB800',
    glow = 0.5,
    nodeStyle = 'dot',
    density = 'standard',
    autoAdvance = 0,
    grainIntensity = 0.05,
    navStyle = 'pill',
  } = tweaks;

  // Newest first
  const orderedEntries = [...entries].reverse();
  const n = orderedEntries.length;
  const [active, setActive] = useState4(0);
  const wheelRef = useRef4(null);
  const touchRef = useRef4({ startX: 0, startY: 0 });

  const goNext = useCallback4(() => setActive((a) => Math.min(a + 1, n - 1)), [n]);
  const goPrev = useCallback4(() => setActive((a) => Math.max(a - 1, 0)), []);

  // Auto-advance
  useEffect4(() => {
    if (!autoAdvance) return;
    const id = setInterval(goNext, autoAdvance * 1000);
    return () => clearInterval(id);
  }, [autoAdvance, goNext]);

  // Keyboard nav
  useEffect4(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  // Wheel / trackpad scroll nav — debounced so one flick = one step
  useEffect4(() => {
    let timeout = null;
    const onWheel = (e) => {
      e.preventDefault();
      if (timeout) return; // debounce
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (dx > 30) goNext();
      else if (dx < -30) goPrev();
      timeout = setTimeout(() => { timeout = null; }, 500);
    };
    const el = wheelRef.current;
    if (el) el.addEventListener('wheel', onWheel, { passive: false });
    return () => { if (el) el.removeEventListener('wheel', onWheel); };
  }, [goNext, goPrev]);

  // Touch swipe
  useEffect4(() => {
    const onStart = (e) => {
      touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY };
    };
    const onEnd = (e) => {
      const dx = e.changedTouches[0].clientX - touchRef.current.startX;
      const dy = e.changedTouches[0].clientY - touchRef.current.startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx < 0) goNext(); else goPrev();
      }
    };
    const el = wheelRef.current;
    if (el) {
      el.addEventListener('touchstart', onStart, { passive: true });
      el.addEventListener('touchend', onEnd, { passive: true });
    }
    return () => {
      if (el) {
        el.removeEventListener('touchstart', onStart);
        el.removeEventListener('touchend', onEnd);
      }
    };
  }, [goNext, goPrev]);

  const STEP = 320;
  const trackWidth = (n - 1) * STEP + 900;
  const centerOffset = 450;

  // Organic wave Y offsets
  const yOffsets = orderedEntries.map((_, i) => Math.sin(i * 1.2) * 22);
  const railCenterY = 240;

  const atStart = active === 0;
  const atEnd = active === n - 1;

  // ── NAV VARIANT RENDERERS ────────────────────────────────────────

  // V-A: Ghost arrows (original, kept as baseline)
  const NavArrows = () => (
    <>
      {['prev','next'].map((dir) => {
        const disabled = dir === 'prev' ? atStart : atEnd;
        return (
          <button key={dir} onClick={dir==='prev'?goPrev:goNext} disabled={disabled}
            aria-label={dir}
            style={{
              position:'absolute', top:'50%',
              [dir==='prev'?'left':'right']: 28,
              transform:'translateY(-50%)', zIndex:30,
              width:44, height:44, background:'transparent',
              border:`1px solid rgba(255,255,255,${disabled?'0.06':'0.18'})`,
              borderRadius:2, color:disabled?'rgba(255,255,255,0.15)':'#e0e2e6',
              cursor:disabled?'not-allowed':'pointer',
              display:'grid', placeItems:'center', transition:'all 0.25s',
            }}
            onMouseEnter={(e)=>{
              if(disabled) return;
              e.currentTarget.style.borderColor=accent;
              e.currentTarget.style.boxShadow=`0 0 18px ${accent}40`;
              e.currentTarget.style.color=accent;
            }}
            onMouseLeave={(e)=>{
              e.currentTarget.style.borderColor=`rgba(255,255,255,${disabled?'0.06':'0.18'})`;
              e.currentTarget.style.boxShadow='none';
              e.currentTarget.style.color=disabled?'rgba(255,255,255,0.15)':'#e0e2e6';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              {dir==='prev'
                ?<path d="M9 2 L4 7 L9 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square"/>
                :<path d="M5 2 L10 7 L5 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square"/>}
            </svg>
          </button>
        );
      })}
    </>
  );

  // V-B: Centered floating pill — year display, tap halves to nav
  const NavPill = () => (
    <div style={{
      position:'absolute', bottom:36, left:'50%', transform:'translateX(-50%)',
      zIndex:30, display:'flex', alignItems:'center',
      border:'1px solid rgba(255,255,255,0.14)', borderRadius:999,
      backdropFilter:'blur(12px)', background:'rgba(255,255,255,0.04)',
      overflow:'hidden',
    }}>
      <button onClick={goPrev} disabled={atStart} style={{
        background:'transparent', border:'none', padding:'10px 20px',
        cursor:atStart?'not-allowed':'pointer', opacity:atStart?0.2:1,
        color:'#e0e2e6', fontFamily:'Space Grotesk', fontSize:11,
        letterSpacing:'0.15em', transition:'all 0.2s',
      }}
        onMouseEnter={(e)=>{ if(!atStart){ e.currentTarget.style.color=accent; }}}
        onMouseLeave={(e)=>{ e.currentTarget.style.color='#e0e2e6'; }}
      >←</button>
      <div style={{
        padding:'10px 18px', borderLeft:'1px solid rgba(255,255,255,0.1)',
        borderRight:'1px solid rgba(255,255,255,0.1)',
        fontFamily:'Space Grotesk', fontSize:12, letterSpacing:'0.2em',
        color:accent, textTransform:'uppercase', whiteSpace:'nowrap',
      }}>
        {orderedEntries[active].year} · {orderedEntries[active].chapter}
      </div>
      <button onClick={goNext} disabled={atEnd} style={{
        background:'transparent', border:'none', padding:'10px 20px',
        cursor:atEnd?'not-allowed':'pointer', opacity:atEnd?0.2:1,
        color:'#e0e2e6', fontFamily:'Space Grotesk', fontSize:11,
        letterSpacing:'0.15em', transition:'all 0.2s',
      }}
        onMouseEnter={(e)=>{ if(!atEnd){ e.currentTarget.style.color=accent; }}}
        onMouseLeave={(e)=>{ e.currentTarget.style.color='#e0e2e6'; }}
      >→</button>
    </div>
  );

  // V-C: Scrubber track — thin bar at bottom, draggable thumb
  const NavScrubber = () => {
    const trackW = 320;
    const thumbX = (active / (entries.length - 1)) * trackW;
    return (
      <div style={{
        position:'absolute', bottom:36, left:'50%',
        transform:'translateX(-50%)', zIndex:30,
        display:'flex', flexDirection:'column', alignItems:'center', gap:10,
      }}>
        {/* Year labels */}
        <div style={{ display:'flex', width:trackW, justifyContent:'space-between' }}>
          {orderedEntries.map((e,i) => (
            <button key={e.id} onClick={()=>setActive(i)} style={{
              background:'none', border:'none', padding:0, cursor:'pointer',
              fontFamily:'Space Grotesk', fontSize:9, letterSpacing:'0.15em',
              color: i===active ? accent : 'rgba(255,255,255,0.3)',
              transition:'color 0.3s',
            }}>{e.year}</button>
          ))}
        </div>
        {/* Track */}
        <div style={{ position:'relative', width:trackW, height:2 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.12)', borderRadius:1 }} />
          {/* Filled portion */}
          <div style={{
            position:'absolute', left:0, top:0, height:2,
            width: thumbX + 8,
            background:`linear-gradient(90deg, ${accent}60, ${accent})`,
            borderRadius:1, transition:'width 0.5s cubic-bezier(0.4,0,0.2,1)',
          }} />
          {/* Thumb */}
          <div style={{
            position:'absolute', top:'50%',
            left: thumbX,
            transform:'translate(-50%, -50%)',
            width:8, height:8, borderRadius:'50%',
            background:accent,
            boxShadow:`0 0 10px ${accent}`,
            transition:'left 0.5s cubic-bezier(0.4,0,0.2,1)',
          }} />
          {/* Clickable segments */}
          {orderedEntries.map((e,i) => (
            <div key={e.id} onClick={()=>setActive(i)} style={{
              position:'absolute', top:-8,
              left: (i/(n-1))*trackW - 16,
              width:32, height:18,
              cursor:'pointer',
            }} />
          ))}
        </div>
      </div>
    );
  };

  // V-D: Invisible edge tap zones — gradient edge cues on hover
  const NavEdgeZones = () => {
    const [hoverLeft, setHoverLeft] = useState4(false);
    const [hoverRight, setHoverRight] = useState4(false);
    return (
      <>
        {/* Left zone */}
        <div
          onClick={goPrev}
          onMouseEnter={()=>setHoverLeft(true)}
          onMouseLeave={()=>setHoverLeft(false)}
          style={{
            position:'absolute', top:0, left:0, bottom:0, width:80,
            zIndex:30, cursor:atStart?'default':'w-resize',
            background: hoverLeft && !atStart
              ? `linear-gradient(90deg, ${accent}18, transparent)`
              : 'transparent',
            transition:'background 0.3s',
            display:'flex', alignItems:'center', justifyContent:'flex-start',
            paddingLeft:20,
          }}
        >
          {hoverLeft && !atStart && (
            <span style={{
              fontFamily:'Space Grotesk', fontSize:10, letterSpacing:'0.3em',
              color:accent, textTransform:'uppercase', opacity:0.8,
              writingMode:'vertical-rl', transform:'rotate(180deg)',
            }}>prev</span>
          )}
        </div>
        {/* Right zone */}
        <div
          onClick={goNext}
          onMouseEnter={()=>setHoverRight(true)}
          onMouseLeave={()=>setHoverRight(false)}
          style={{
            position:'absolute', top:0, right:0, bottom:0, width:80,
            zIndex:30, cursor:atEnd?'default':'e-resize',
            background: hoverRight && !atEnd
              ? `linear-gradient(270deg, ${accent}18, transparent)`
              : 'transparent',
            transition:'background 0.3s',
            display:'flex', alignItems:'center', justifyContent:'flex-end',
            paddingRight:20,
          }}
        >
          {hoverRight && !atEnd && (
            <span style={{
              fontFamily:'Space Grotesk', fontSize:10, letterSpacing:'0.3em',
              color:accent, textTransform:'uppercase', opacity:0.8,
              writingMode:'vertical-rl',
            }}>next</span>
          )}
        </div>
      </>
    );
  };

  // V-E: Counter — large editorial numbers at bottom-left/right; prev entry year left, next right
  const NavCounter = () => (
    <>
      {/* Prev */}
      <button onClick={goPrev} disabled={atStart} style={{
        position:'absolute', bottom:32, left:48, zIndex:30,
        background:'transparent', border:'none', cursor:atStart?'not-allowed':'pointer',
        textAlign:'left', padding:0, opacity: atStart ? 0.12 : 1,
        transition:'opacity 0.3s',
      }}
        onMouseEnter={(e)=>{ if(!atStart) e.currentTarget.querySelector('.cyr').style.color=accent; }}
        onMouseLeave={(e)=>{ if(!atStart) e.currentTarget.querySelector('.cyr').style.color='rgba(255,255,255,0.18)'; }}
      >
        <div className="cyr" style={{
          fontFamily:'Space Grotesk', fontSize:64, fontWeight:700,
          lineHeight:1, letterSpacing:'-0.06em',
          color:'rgba(255,255,255,0.18)',
          transition:'color 0.25s',
        }}>{active > 0 ? orderedEntries[active-1].year : ''}</div>
        {active > 0 && <div style={{
          fontFamily:'Space Grotesk', fontSize:10, letterSpacing:'0.2em',
          color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginTop:4,
        }}>{orderedEntries[active-1].role.slice(0,20)}</div>}
      </button>
      {/* Next */}
      <button onClick={goNext} disabled={atEnd} style={{
        position:'absolute', bottom:32, right:48, zIndex:30,
        background:'transparent', border:'none', cursor:atEnd?'not-allowed':'pointer',
        textAlign:'right', padding:0, opacity: atEnd ? 0.12 : 1,
        transition:'opacity 0.3s',
      }}
        onMouseEnter={(e)=>{ if(!atEnd) e.currentTarget.querySelector('.cyr').style.color=accent; }}
        onMouseLeave={(e)=>{ if(!atEnd) e.currentTarget.querySelector('.cyr').style.color='rgba(255,255,255,0.18)'; }}
      >
        <div className="cyr" style={{
          fontFamily:'Space Grotesk', fontSize:64, fontWeight:700,
          lineHeight:1, letterSpacing:'-0.06em',
          color:'rgba(255,255,255,0.18)',
          transition:'color 0.25s',
        }}>{active < n-1 ? orderedEntries[active+1].year : ''}</div>
        {active < n-1 && <div style={{
          fontFamily:'Space Grotesk', fontSize:10, letterSpacing:'0.2em',
          color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginTop:4,
        }}>{orderedEntries[active+1].role.slice(0,20)}</div>}
      </button>
    </>
  );

  // V-F: Year strip — minimal ticker at bottom edge; years as clickable labels, active glows
  const NavYearStrip = () => (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0, zIndex:30,
      display:'flex', justifyContent:'center',
      borderTop:'1px solid rgba(255,255,255,0.06)',
    }}>
      {orderedEntries.map((e,i) => {
        const isActive = i === active;
        return (
          <button key={e.id} onClick={()=>setActive(i)} style={{
            flex:1, background:'transparent', border:'none',
            padding:'14px 8px', cursor:'pointer',
            borderRight: i < n-1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            display:'flex', flexDirection:'column', alignItems:'center', gap:6,
            position:'relative', transition:'background 0.3s',
          }}
            onMouseEnter={(e)=>{ e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}
            onMouseLeave={(e)=>{ e.currentTarget.style.background='transparent'; }}
          >
            {/* Active indicator line */}
            <div style={{
              position:'absolute', top:0, left:0, right:0, height:1,
              background: isActive ? accent : 'transparent',
              boxShadow: isActive ? `0 0 8px ${accent}` : 'none',
              transition:'all 0.4s',
            }} />
            <div style={{
              fontFamily:'Space Grotesk', fontSize:13, fontWeight: isActive ? 600 : 400,
              letterSpacing:'0.15em', color: isActive ? accent : 'rgba(255,255,255,0.25)',
              transition:'all 0.3s',
            }}>{e.year}</div>
            <div style={{
              fontFamily:'Space Grotesk', fontSize:8, letterSpacing:'0.2em',
              color: isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
              textTransform:'uppercase', transition:'all 0.3s',
            }}>{e.chapter}</div>
          </button>
        );
      })}
    </div>
  );

  // V-G: Orbit — a semicircular arc at bottom center; entries as dots on the arc
  const NavOrbit = () => {
    const r = 90; // arc radius
    const arcSpan = 140; // degrees total
    const startAngle = 180 + (180 - arcSpan) / 2; // centered bottom
    return (
      <div style={{
        position:'absolute', bottom:-r+40, left:'50%',
        transform:'translateX(-50%)', zIndex:30,
        width: r*2+60, height: r+40,
        pointerEvents:'none',
      }}>
        <svg width={r*2+60} height={r+40} style={{ overflow:'visible', pointerEvents:'none' }}>
          {/* Arc */}
          {(() => {
            const cx = r+30, cy = r+10;
            const a1 = (startAngle) * Math.PI / 180;
            const a2 = (startAngle + arcSpan) * Math.PI / 180;
            const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
            const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
            return <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
              stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />;
          })()}
          {/* Entry dots */}
          {orderedEntries.map((e,i) => {
            const angle = (startAngle + (i/(n-1)) * arcSpan) * Math.PI / 180;
            const cx = r+30, cy = r+10;
            const nx = cx + r * Math.cos(angle);
            const ny = cy + r * Math.sin(angle);
            const isActive = i === active;
            return (
              <g key={e.id} style={{ pointerEvents:'all', cursor:'pointer' }} onClick={()=>setActive(i)}>
                {isActive && <circle cx={nx} cy={ny} r={14} fill={accent} fillOpacity={0.1} />}
                <circle cx={nx} cy={ny} r={isActive?5:3}
                  fill={isActive?accent:'rgba(255,255,255,0.3)'}
                  style={{ filter: isActive ? `drop-shadow(0 0 6px ${accent})` : 'none', transition:'all 0.4s' }} />
                <text x={nx} y={ny - (isActive?14:10)}
                  textAnchor="middle"
                  style={{
                    fontFamily:'Space Grotesk', fontSize:9,
                    fill: isActive ? accent : 'rgba(255,255,255,0.3)',
                    letterSpacing:'0.1em', transition:'all 0.4s',
                  }}>{e.year}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // V-H: Ghost text — no chrome at all; translucent prev/next role names float at edges
  const NavGhostText = () => {
    const [hl, setHl] = useState4(null);
    const prevEntry = active > 0 ? orderedEntries[active-1] : null;
    const nextEntry = active < n-1 ? orderedEntries[active+1] : null;
    return (
      <>
        {prevEntry && (
          <div
            onClick={goPrev}
            onMouseEnter={()=>setHl('prev')}
            onMouseLeave={()=>setHl(null)}
            style={{
              position:'absolute', left:0, top:0, bottom:0, width:'18%',
              zIndex:30, cursor:'pointer', display:'flex', alignItems:'center',
              paddingLeft:40,
            }}
          >
            <div style={{
              transform: hl==='prev' ? 'translateX(0)' : 'translateX(-8px)',
              opacity: hl==='prev' ? 0.7 : 0.18,
              transition:'all 0.35s ease',
            }}>
              <div style={{
                fontFamily:'Space Grotesk', fontSize:9, letterSpacing:'0.3em',
                color:'#fff', textTransform:'uppercase', marginBottom:6,
              }}>← {prevEntry.year}</div>
              <div style={{
                fontFamily:'Space Grotesk', fontSize:14, fontWeight:600,
                color:'#fff', textTransform:'uppercase', letterSpacing:'0.05em',
                lineHeight:1.2,
              }}>{prevEntry.role}</div>
            </div>
          </div>
        )}
        {nextEntry && (
          <div
            onClick={goNext}
            onMouseEnter={()=>setHl('next')}
            onMouseLeave={()=>setHl(null)}
            style={{
              position:'absolute', right:0, top:0, bottom:0, width:'18%',
              zIndex:30, cursor:'pointer', display:'flex', alignItems:'center',
              justifyContent:'flex-end', paddingRight:40,
            }}
          >
            <div style={{
              textAlign:'right',
              transform: hl==='next' ? 'translateX(0)' : 'translateX(8px)',
              opacity: hl==='next' ? 0.7 : 0.18,
              transition:'all 0.35s ease',
            }}>
              <div style={{
                fontFamily:'Space Grotesk', fontSize:9, letterSpacing:'0.3em',
                color:'#fff', textTransform:'uppercase', marginBottom:6,
              }}>{nextEntry.year} →</div>
              <div style={{
                fontFamily:'Space Grotesk', fontSize:14, fontWeight:600,
                color:'#fff', textTransform:'uppercase', letterSpacing:'0.05em',
                lineHeight:1.2,
              }}>{nextEntry.role}</div>
            </div>
          </div>
        )}
      </>
    );
  };

  const NavControl = () => {
    if (navStyle === 'arrows')      return <NavArrows />;
    if (navStyle === 'pill')        return <NavPill />;
    if (navStyle === 'scrubber')    return <NavScrubber />;
    if (navStyle === 'edge')        return <NavEdgeZones />;
    if (navStyle === 'counter')     return <NavCounter />;
    if (navStyle === 'year-strip')  return <NavYearStrip />;
    if (navStyle === 'orbit')       return <NavOrbit />;
    if (navStyle === 'ghost-text')  return <NavGhostText />;
    return <NavPill />;
  };

  return (
    <div
      ref={wheelRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: '#101417' }}
    >
      <GrainBg intensity={grainIntensity} />





      {/* Nav control */}
      <NavControl />

      {/* Track */}
      <div className="absolute left-0 right-0" style={{ top: '50%', transform: 'translateY(-50%)', height: 480, overflow: 'hidden' }}>
        <div
          className="relative h-full"
          style={{
            width: trackWidth,
            transform: `translateX(calc(50vw - ${centerOffset + active * STEP}px))`,
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Curved dotted path connecting all nodes (V2 highlight) */}
          <svg
            className="absolute pointer-events-none"
            style={{ top: 0, left: 0, width: trackWidth, height: 480 }}
          >
            <defs>
              <linearGradient id="hybridPathGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={accent} stopOpacity="0" />
                <stop offset="18%" stopColor={accent} stopOpacity="0.45" />
                <stop offset="82%" stopColor={accent} stopOpacity="0.45" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={orderedEntries.map((_, i) => {
                const x = centerOffset + i * STEP;
                const y = railCenterY + yOffsets[i];
                if (i === 0) return `M ${x} ${y}`;
                const px = centerOffset + (i - 1) * STEP;
                const py = railCenterY + yOffsets[i - 1];
                const cx1 = px + STEP * 0.5;
                const cx2 = x - STEP * 0.5;
                return `C ${cx1} ${py}, ${cx2} ${y}, ${x} ${y}`;
              }).join(' ')}
              stroke="url(#hybridPathGrad)"
              strokeWidth="1"
              strokeDasharray="3 5"
              fill="none"
            />
          </svg>

          {/* Entries — alternating above/below, nodes riding the wave */}
          {orderedEntries.map((e, i) => {
            const x = centerOffset + i * STEP;
            const y = railCenterY + yOffsets[i];
            const dist = Math.abs(i - active);
            const state = dist === 0 ? 'active' : dist === 1 ? 'adjacent' : 'inactive';
            const above = i % 2 === 0;

            return (
              <div key={e.id} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)' }}>
                {/* Connector line from node to card */}
                {state !== 'inactive' && (
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: above ? -120 : 8,
                    width: 1,
                    height: 100,
                    background: state === 'active'
                      ? `linear-gradient(${above ? '0deg' : '180deg'}, ${accent}90, ${accent}08)`
                      : 'linear-gradient(rgba(255,255,255,0.18), rgba(255,255,255,0.02))',
                    transform: 'translateX(-50%)',
                  }} />
                )}

                {/* Milestone node */}
                <button
                  onClick={() => setActive(i)}
                  style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', position: 'relative', zIndex: 2 }}
                >
                  <TimelineNode style={nodeStyle} state={state} accent={accent} glow={glow} />
                </button>

                {/* Card */}
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
                        fontFamily: 'Inter', fontSize: 13, color: '#c4c7c4', marginBottom: 14,
                      }}>
                        {e.org} <span style={{ opacity: 0.5 }}>·</span> <span style={{ opacity: 0.6 }}>{e.place}</span>
                      </div>
                      {density !== 'compact' && (
                        <p style={{
                          fontFamily: 'Inter', fontSize: 13.5, fontStyle: 'italic',
                          lineHeight: 1.55, color: '#e0e2e6', opacity: 0.85,
                          margin: 0, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto',
                        }}>
                          "{e.tagline}"
                        </p>
                      )}
                      {density === 'detailed' && (
                        <div className="flex justify-center flex-wrap" style={{ gap: 6, marginTop: 14 }}>
                          {e.keywords.map((k) => (
                            <span key={k} style={{
                              fontFamily: 'Space Grotesk', fontSize: 9.5, letterSpacing: '0.18em',
                              color: '#c4c7c4', textTransform: 'uppercase',
                              padding: '4px 9px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 2,
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

      {/* Bottom strip: clean — no dots, no resume link */}
    </div>
  );
}

window.TimelineHybrid = TimelineHybrid;
