---
name: Reebal Sami Portfolio
colors:
  surface: '#101417'
  surface-dim: '#101417'
  surface-bright: '#363a3d'
  surface-container-lowest: '#0b0f11'
  surface-container-low: '#191c1f'
  surface-container: '#1d2023'
  surface-container-high: '#272a2d'
  surface-container-highest: '#323538'
  on-surface: '#e0e2e6'
  on-surface-variant: '#c4c7c4'
  inverse-surface: '#e0e2e6'
  inverse-on-surface: '#2d3134'
  outline: '#8e918f'
  outline-variant: '#444845'
  surface-tint: '#c7c6c5'
  primary: '#ffffff'
  on-primary: '#2f3130'
  primary-container: '#e3e2e0'
  on-primary-container: '#646463'
  inverse-primary: '#5e5e5d'
  secondary: '#ffdb9d'
  on-secondary: '#412d00'
  secondary-container: '#feb700'
  on-secondary-container: '#6b4b00'
  tertiary: '#ffffff'
  on-tertiary: '#303036'
  tertiary-container: '#e4e1ea'
  on-tertiary-container: '#64636b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e3e2e0'
  primary-fixed-dim: '#c7c6c5'
  on-primary-fixed: '#1a1c1b'
  on-primary-fixed-variant: '#464746'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#ffba20'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#e4e1ea'
  tertiary-fixed-dim: '#c8c5cd'
  on-tertiary-fixed: '#1b1b21'
  on-tertiary-fixed-variant: '#47464d'
  background: '#101417'
  on-background: '#e0e2e6'
  surface-variant: '#323538'
typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.15em
  tick-label:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-edge: 64px
  ruler-increment: 8px
---

## Brand & Style

The design system is a sophisticated fusion of "AI-analog" aesthetics—where the precision of engineering tools meets the organic fluidity of artificial intelligence. It centers on the concept of a "Time Machine on a Ruler," positioning the user as an operator of a high-end precision instrument. 

The visual style is a hybrid of **Minimalism** and **Tactile/Skeuomorphism**. It utilizes deep, cinematic blacks to provide infinite depth, contrasted by razor-sharp white typography and delicate technical markings. The emotional response is one of discovery and "quiet luxury"—professional and cutting-edge, yet warmed by amber "vacuum tube" glows that make the technology feel human and approachable. 

Key visual motifs include:
- **Incremental Precision:** Fine vertical ticks and micro-copy reminiscent of a sliding rule or camera lens.
- **Neural Atmosphere:** Backgrounds are never flat; they contain "neural noise" (fine grain) and soft, pulsing amber light leaks.
- **Cinematic Motion:** Transitions mimic the physical inertia of heavy, well-oiled machinery.

## Colors

The palette is anchored in a high-contrast cinematic dark mode. 

- **Primary (#FAF9F7):** A "paper white" used for high-impact typography and critical interface markings.
- **Secondary (#FFB800):** A warm amber/gold accent. This is not used for fills, but as a "glow" or "lamp" effect to highlight active states and neural focus points.
- **Tertiary (#1C1C22):** The obsidian base. It serves as the canvas for all depth effects and textures.
- **Neutral (#E5E7EB):** A muted silver used for secondary information, ruler increments, and technical metadata to ensure they don't compete with the primary content.

Backgrounds should incorporate a 2% opacity "neural noise" texture overlay to prevent banding in the dark gradients and simulate analog film grain.

## Typography

Typography functions as a navigational tool. **Space Grotesk** provides a technical, futuristic edge for headlines and navigation, while **Inter** ensures maximum readability for body copy and data.

Special attention is given to the `label-caps` and `tick-label` styles. These are used in conjunction with the "ruler" visual language—placed alongside fine lines to denote dates, categories, or technical specs. Headlines should utilize tighter letter-spacing to feel "locked in," while labels should be tracked out for a more deliberate, architectural feel.

## Layout & Spacing

The layout follows a **Fixed Grid** with an emphasis on horizontal expansion. The core experience is a wide-screen carousel that moves along a 12-column grid.

- **The Timeline Axis:** A persistent horizontal line (the "Ruler") sits at a specific Y-intercept (e.g., 75% height). 
- **Rhythmical Increments:** Spacing is strictly mathematical, based on a 4px unit. Technical markings appear every 8px (minor) and 32px (major).
- **Margins:** Large 64px side margins create a "viewfinder" effect, focusing the user's eye on the center of the viewport where the "Time Machine" reveals content.

## Elevation & Depth

Depth is created through **Glassmorphism** and **Light Projection** rather than traditional shadows.

1.  **The Void (Base):** The #1C1C22 background.
2.  **Neural Mist:** Large, low-opacity (#FFB800) radial gradients that sit behind the main content, appearing to "glow" from within the screen.
3.  **Glass Panels:** Content cards use a 40% blur (Backdrop Filter) with a 1px #FAF9F7 stroke at 10% opacity. This makes them feel like high-quality glass slides.
4.  **Light Projection:** Active elements emit a soft amber outer glow (box-shadow: 0 0 20px rgba(255, 184, 0, 0.3)), suggesting they are illuminated by a physical lamp.

## Shapes

The shape language is disciplined and industrial. To maintain the "precision instrument" aesthetic, we avoid overly soft or bubbly shapes.

- **Primary Elements:** Use a `Soft` (0.25rem) radius to take the edge off the harshness without losing the professional feel.
- **Interactive Triggers:** Buttons and inputs should maintain sharp corners or very minimal rounding to resemble machined metal components.
- **The Ruler:** Lines must be exactly 1px or 2px thick—never anti-aliased or soft.

## Components

### The Horizontal Timeline (The Ruler)
The centerpiece of the design system. A continuous horizontal line featuring "tick marks" of varying heights. As the user scrolls, the ruler slides. Content "blooms" upward from the ruler when it passes the center-point.

### Precision Buttons
Ghost-style buttons with a 1px border. On hover, the border glows #FFB800 and the "neural noise" texture within the button becomes more prominent.

### Content Slides (Cards)
Semi-translucent glass panels. They feature a vertical "measuring" line on the left edge that connects the card to the timeline ruler.

### Interactive Ticks
Small, interactive dots or lines on the ruler. When hovered, they reveal micro-metadata (e.g., "PROJECT_04 // 2023") in the `tick-label` typography style.

### Particle Cursor
The cursor is followed by a subtle cluster of amber particles that behave like "digital dust" caught in a projector beam, emphasizing the cinematic nature of the portfolio.