"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * B2B Sales Lead Pipeline — architecture diagram.
 *
 * Inline React SVG component so the stroke/fill/label colors track the site's
 * class-based dark mode (`html.dark`) reliably. Using a static .svg file with
 * `@media (prefers-color-scheme: dark)` fails when the user toggles the site
 * theme manually.
 *
 * Tokens:
 *   - Ink (stroke + labels): `text-foreground` with stroke="currentColor"
 *   - Warm fills: inline `fill="var(--gallery-warm)"` with opacity classes
 *   - Muted labels: `text-muted-foreground`
 */
export function B2bArchitectureDiagram() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.figure
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="not-prose my-10 overflow-hidden rounded-xl border border-border bg-background/40"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1040 560"
        className="block h-auto w-full text-foreground"
        role="img"
        aria-labelledby="b2b-arch-title b2b-arch-desc"
      >
        <title id="b2b-arch-title">B2B sales lead pipeline architecture</title>
        <desc id="b2b-arch-desc">
          Hand-drawn diagram: news sources feed a crawler, a PostgreSQL store,
          four LLM agents (Targeting, Insights, Contact Discovery, Outreach
          Drafting) with human-in-the-loop feedback producing personalized
          outreach.
        </desc>

        <defs>
          <marker
            id="b2b-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>

        {/* Soft decorative accents */}
        <circle cx="130" cy="80" r="70" className="fill-gallery-warm/10 dark:fill-gallery-warm/15" />
        <circle cx="960" cy="470" r="90" className="fill-gallery-warm/10 dark:fill-gallery-warm/15" />
        <rect
          x="680"
          y="40"
          width="80"
          height="80"
          rx="20"
          transform="rotate(12 720 80)"
          className="fill-gallery-warm/10 dark:fill-gallery-warm/15"
        />

        {/* Title */}
        <text x="40" y="46" className="fill-current font-heading" fontSize="22" fontWeight="700">
          B2B Sales Lead Pipeline
        </text>
        <text
          x="40"
          y="66"
          className="fill-muted-foreground"
          fontSize="13"
          fontStyle="italic"
        >
          Four agents, one news-crawler, and a human in the loop.
        </text>

        {/* News sources cloud */}
        <g transform="translate(60, 140)">
          <path
            d="M 12 22 q -8 -18 8 -22 q 6 -10 20 -6 q 8 -10 22 -4 q 12 -8 24 2 q 14 -2 16 14 q 10 4 4 18 q 6 12 -8 16 q -4 12 -20 8 q -10 8 -22 0 q -14 6 -22 -4 q -14 -2 -16 -14 q -12 -2 -6 -8 Z"
            className="fill-gallery-warm/25 dark:fill-gallery-warm/35"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="80"
            y="45"
            textAnchor="middle"
            className="fill-current"
            fontSize="14"
            fontWeight="500"
          >
            News sites
          </text>
        </g>

        {/* Arrow: news → crawler */}
        <g className="text-foreground">
          <path
            d="M 190 180 q 20 -6 42 0"
            stroke="currentColor"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            markerEnd="url(#b2b-arrow)"
          />
        </g>
        <text
          x="200"
          y="168"
          className="fill-muted-foreground"
          fontSize="12"
          fontStyle="italic"
        >
          crawl
        </text>

        {/* Crawler box */}
        <g transform="translate(240, 140)">
          <rect
            width="150"
            height="80"
            rx="12"
            className="fill-gallery-warm/25 dark:fill-gallery-warm/30"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <text
            x="75"
            y="36"
            textAnchor="middle"
            className="fill-current"
            fontSize="15"
            fontWeight="600"
          >
            Crawler
          </text>
          <text
            x="75"
            y="58"
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="12"
          >
            BeautifulSoup + Oxylabs
          </text>
        </g>

        {/* Arrow: crawler → DB (lengthened so label no longer intersects cylinder) */}
        <g className="text-foreground">
          <path
            d="M 390 180 q 60 0 120 0"
            stroke="currentColor"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            markerEnd="url(#b2b-arrow)"
          />
        </g>
        <text
          x="418"
          y="168"
          className="fill-muted-foreground"
          fontSize="12"
          fontStyle="italic"
        >
          extract + LLM
        </text>

        {/* DB cylinder (shifted right so arrow clears the label) */}
        <g transform="translate(516, 140)">
          <ellipse
            cx="70"
            cy="12"
            rx="60"
            ry="10"
            className="fill-gallery-warm/40 dark:fill-gallery-warm/55"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <path
            d="M 10 12 L 10 72 Q 70 92 130 72 L 130 12 Q 70 32 10 12 Z"
            className="fill-gallery-warm/40 dark:fill-gallery-warm/55"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <path
            d="M 10 32 Q 70 52 130 32"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            opacity="0.6"
          />
          <text
            x="70"
            y="60"
            textAnchor="middle"
            className="fill-current"
            fontSize="14"
            fontWeight="600"
          >
            PostgreSQL
          </text>
          <text
            x="70"
            y="76"
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="11"
          >
            3NF schema
          </text>
        </g>

        {/* Agents group frame */}
        <g transform="translate(40, 290)">
          <rect
            width="960"
            height="220"
            rx="20"
            className="fill-gallery-warm/10 dark:fill-gallery-warm/15"
          />
          <path
            d="M 4 4 L 956 4 L 956 216 L 4 216 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <text
            x="18"
            y="22"
            className="fill-muted-foreground"
            fontSize="12"
            fontStyle="italic"
          >
            Multi-agent research app · Streamlit · shared state
          </text>
        </g>

        {/* Agent 1: Company Targeting */}
        <g transform="translate(80, 340)">
          <rect
            width="180"
            height="70"
            rx="14"
            className="fill-gallery-warm/25 dark:fill-gallery-warm/30"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <text
            x="90"
            y="32"
            textAnchor="middle"
            className="fill-current"
            fontSize="14"
            fontWeight="600"
          >
            Company Targeting
          </text>
          <text
            x="90"
            y="52"
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="11"
          >
            finds fit companies
          </text>
        </g>

        {/* Agent 2: Insights */}
        <g transform="translate(290, 340)">
          <rect
            width="170"
            height="70"
            rx="14"
            className="fill-gallery-warm/25 dark:fill-gallery-warm/30"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <text
            x="85"
            y="32"
            textAnchor="middle"
            className="fill-current"
            fontSize="14"
            fontWeight="600"
          >
            Insights
          </text>
          <text
            x="85"
            y="52"
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="11"
          >
            synthesizes signals
          </text>
        </g>

        {/* Agent 3: Contact Discovery */}
        <g transform="translate(490, 340)">
          <rect
            width="200"
            height="70"
            rx="14"
            className="fill-gallery-warm/25 dark:fill-gallery-warm/30"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <text
            x="100"
            y="32"
            textAnchor="middle"
            className="fill-current"
            fontSize="14"
            fontWeight="600"
          >
            Contact Discovery
          </text>
          <text
            x="100"
            y="52"
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="11"
          >
            decision-makers + verify
          </text>
        </g>

        {/* Agent 4: Outreach Drafting */}
        <g transform="translate(720, 340)">
          <rect
            width="230"
            height="70"
            rx="14"
            className="fill-gallery-warm/40 dark:fill-gallery-warm/50"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <text
            x="115"
            y="32"
            textAnchor="middle"
            className="fill-current"
            fontSize="14"
            fontWeight="600"
          >
            Outreach Drafting
          </text>
          <text
            x="115"
            y="52"
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="11"
          >
            personalized email draft
          </text>
        </g>

        {/* Flow arrows between agents */}
        <g className="text-foreground">
          <path
            d="M 260 375 q 12 0 30 0"
            stroke="currentColor"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            markerEnd="url(#b2b-arrow)"
          />
          <path
            d="M 460 375 q 12 0 30 0"
            stroke="currentColor"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            markerEnd="url(#b2b-arrow)"
          />
          <path
            d="M 690 375 q 12 0 30 0"
            stroke="currentColor"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            markerEnd="url(#b2b-arrow)"
          />
        </g>

        {/* DB feeds agents */}
        <g className="text-foreground" opacity="0.75">
          <path
            d="M 586 236 q 0 40 -416 100"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            markerEnd="url(#b2b-arrow)"
          />
          <path
            d="M 586 236 q 0 40 -206 100"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            markerEnd="url(#b2b-arrow)"
          />
        </g>
        <text
          x="300"
          y="284"
          className="fill-muted-foreground"
          fontSize="11"
          fontStyle="italic"
        >
          data flows in
        </text>

        {/* Human in the loop */}
        <g transform="translate(860, 450)">
          <circle
            cx="30"
            cy="30"
            r="30"
            className="fill-gallery-warm/40 dark:fill-gallery-warm/55"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <circle
            cx="30"
            cy="22"
            r="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M 14 44 q 16 -14 32 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <text
            x="30"
            y="82"
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="11"
          >
            Human review
          </text>
        </g>

        {/* Feedback loop */}
        <g className="text-foreground">
          <path
            d="M 890 450 q 0 -40 -30 -60"
            stroke="currentColor"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 860 450 q -300 30 -320 -200"
            stroke="currentColor"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="5 5"
            markerEnd="url(#b2b-arrow)"
          />
        </g>
        <text
          x="580"
          y="450"
          className="fill-muted-foreground"
          fontSize="11"
          fontStyle="italic"
        >
          feedback refines vectors
        </text>

        {/* Send output */}
        <g className="text-foreground">
          <path
            d="M 950 390 q 30 10 30 60"
            stroke="currentColor"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            markerEnd="url(#b2b-arrow)"
          />
        </g>
        <text
          x="955"
          y="460"
          className="fill-muted-foreground"
          fontSize="11"
          fontStyle="italic"
        >
          send
        </text>
      </svg>
    </motion.figure>
  );
}
