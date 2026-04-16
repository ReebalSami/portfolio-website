// =============================================================================
// Visual CV — Two-Column, Human-Friendly, YAML-Driven Design
//
// Sidebar (33%) + Main (67%) — warm, elegant, inspired by soulful + POC.
// All design tokens from config/cv/cv-design.yaml (visual section).
//
// Compile: typst compile --root . --font-path scripts/typst/fonts scripts/typst/visual/cv-visual.typ public/cv/visual/resume_reebal_sami.pdf
// =============================================================================

// --- Data + Config ---
#let data = yaml("../../../config/cv/cv.public.yaml")
#let design = yaml("../../../config/cv/cv-design.yaml").visual
#let locale = if sys.inputs.at("locale", default: none) != none { sys.inputs.locale } else { "en" }

// --- Shared imports ---
#import "../shared/locale.typ": resolve
#import "../shared/shapes.typ": scatter-shapes

#let r(val) = resolve(val, locale)

// =============================================================================
// DESIGN TOKENS
// =============================================================================
#let c = (
  bg: rgb(design.colors.bg),
  sidebar: rgb(design.colors.sidebar-bg),
  text: rgb(design.colors.text),
  heading: rgb(design.colors.heading),
  muted: rgb(design.colors.muted),
  body: rgb(design.colors.body),
  accent: rgb(design.colors.accent),
  accent-light: rgb(design.colors.accent-light),
  white: rgb(design.colors.white),
  separator: rgb(design.colors.separator),
  subsection-title: rgb(design.colors.at("subsection-title", default: design.colors.heading)),
  subsection-meta: rgb(design.colors.at("subsection-meta", default: design.colors.muted)),
  subsection-date: rgb(design.colors.at("subsection-date", default: design.colors.muted)),
)

#let f = design.fonts
#let heading-family = f.heading.family
#let body-family = f.body.family
#let photo = design.photo
#let sidebar-width = design.layout.sidebar-width-percent * 1%
#let main-width = 100% - sidebar-width
#let typography = design.at("typography", default: (leading: 0.55))
#let subsection = design.at(
  "subsection",
  default: (
    job-above: 0.15,
    job-below: 0.1,
    education-above: 0.1,
    education-below: 0.08,
    description-gap: 0.03,
    highlights-gap: 0.03,
  ),
)
#let technical = design.at(
  "technical-skills",
  default: (
    category-above: 0.15,
    title-badges-gap: 0.08,
    badges-after-gap: 0,
    category-below: 0.1,
  ),
)
#let shape-seed-input = sys.inputs.at("shapeSeed", default: none)
#let shape-seed-mode = design.shapes.at("seed-mode", default: "fixed")
#let runtime-shape-seed = if shape-seed-mode == "random-per-build" and shape-seed-input != none {
  int(shape-seed-input)
} else {
  none
}
#let sidebar-sections = design.layout.at(
  "left-sections",
  default: ("contact", "technical-skills", "languages", "interests", "references", "ats-link"),
)
#let main-sections = design.layout.at(
  "right-sections",
  default: ("profile", "experience", "education", "selected-projects", "key-strengths"),
)
#let photo-gap-right = photo.at("gap-right-cm", default: 0) * 1cm
#let photo-offset-x = photo.at("offset-x-pt", default: 0) * 1pt
#let photo-offset-y = photo.at("offset-y-pt", default: 0) * 1pt
#let section-title-separator-gap = design.section.at("title-separator-gap", default: 0.06) * 1em
#let sidebar-title-separator-gap = design.section.at("sidebar-title-separator-gap", default: 0.06) * 1em
#let subsection-title-meta-gap = subsection.at("title-meta-gap", default: 0) * 1em
#let interests-item-below = subsection.at("interests-item-below", default: 0.12) * 1em
#let interests-keywords-gap = subsection.at("interests-keywords-gap", default: 0.02) * 1em
#let sidebar-languages-item-below = design.section.at("sidebar-languages-item-below", default: 0.08) * 1em
#let sidebar-languages-next-spacing = design.section.at("sidebar-languages-next-spacing", default: 0) * 1em
#let interests-item-above = subsection.at("interests-item-above", default: 0) * 1em
#let interests-description-after = subsection.at("interests-description-after", default: 0) * 1em
#let sidebar-key-strengths-extra-above = design.section.at("sidebar-key-strengths-extra-above", default: 0) * 1em
#let sidebar-references-extra-above = design.section.at("sidebar-references-extra-above", default: 0) * 1em
#let main-key-strengths-extra-above = design.section.at("main-key-strengths-extra-above", default: 0) * 1em
#let header-photo-name-gap = design.header.at("photo-name-gap", default: 0.4) * 1em
#let header-name-title-gap = design.header.at("name-title-gap", default: 0.4) * 1em
#let header-title-divider-gap = design.header.at("title-divider-gap", default: 0.2) * 1em
#let header-divider-sections-gap = design.header.at("divider-sections-gap", default: 0.4) * 1em
#let header-contact-line-gap = design.header.at("contact-line-gap", default: 0.1) * 1em
#let header-orb = design.header.at(
  "top-left-orb",
  default: (
    enabled: false,
    color: "#cc9874",
    opacity: 0.3,
    size-pt: 240,
    offset-x-pt: -60,
    offset-y-pt: -60,
  ),
)

#let top-left-glow(config) = {
  let glow-color = rgb(config.at("color", default: "#cc9874"))
  let base-opacity = config.at("opacity", default: 0.3)
  let size = config.at("size-pt", default: 240) * 1pt
  let dx = config.at("offset-x-pt", default: -60) * 1pt
  let dy = config.at("offset-y-pt", default: -60) * 1pt

  place(
    top + left,
    dx: dx,
    dy: dy,
    circle(
      radius: size / 2,
      fill: gradient.radial(
        glow-color.transparentize(100% - base-opacity * 100%),
        glow-color.transparentize(100% - base-opacity * 30%),
        glow-color.transparentize(100%),
        relative: "self",
      ),
    ),
  )
}

// =============================================================================
// PAGE SETUP
// =============================================================================
#set page(
  paper: "a4",
  margin: 0cm,
  fill: c.bg,
  background: {
    // Sidebar background — extends edge-to-edge on every page
    place(top + left, rect(width: sidebar-width, height: 100%, fill: c.sidebar))
    // Scattered shapes
    context scatter-shapes(here().page(), design.shapes, base-seed: runtime-shape-seed)
  },
)
#set text(font: body-family, size: f.body.size * 1pt, fill: c.body, weight: "regular")
#let par-spacing = typography.at("par-spacing", default: 0) * 1em
#set par(leading: typography.leading * 1em, spacing: par-spacing, justify: true)
#set block(above: 0pt, below: 0pt)
#let bullet-between-gap = subsection.at("bullet-between-gap", default: 0.4) * 1em

// =============================================================================
// COMPONENTS
// =============================================================================

// Section heading — sidebar style (smaller, no underline)
#let sidebar-section(title) = {
  v(design.section.at("sidebar-spacing-above", default: 0.5) * 1em)
  text(
    font: heading-family,
    size: f.heading.sidebar-section-size * 1pt,
    weight: "semibold",
    fill: c.heading,
    tracking: f.heading.tracking * 1em,
    upper(title),
  )
  v(sidebar-title-separator-gap)
  box(
    width: 100%,
    height: design.section.at("sidebar-separator-height", default: 0.4) * 1pt,
    fill: c.accent.lighten(30%),
  )
  v(design.section.at("sidebar-spacing-below", default: 0.25) * 1em)
}

// Section heading — main area style (larger, accent underline)
#let main-section(title) = {
  v(design.section.spacing-above * 1em)
  text(
    font: heading-family,
    size: f.heading.section-size * 1pt,
    weight: "semibold",
    fill: c.heading,
    tracking: f.heading.tracking * 1em,
    upper(title),
  )
  v(section-title-separator-gap)
  box(width: 100%, height: design.section.separator-height * 1pt, fill: c.separator.lighten(20%))
  v(design.section.spacing-below * 1em)
}

// Job entry
#let job(position, company, location, start, end, desc: none, highlights: ()) = {
  block(breakable: false, above: subsection.job-above * 1em, below: subsection.job-below * 1em)[
    #grid(
      columns: (1fr, auto),
      text(font: heading-family, weight: "semibold", size: 10.5pt, fill: c.subsection-title)[#position],
      text(size: 9pt, fill: c.subsection-date, weight: "medium")[#start — #end],
    )
    #v(subsection-title-meta-gap)
    #text(size: 9pt, fill: c.subsection-meta, weight: f.meta.weight)[#company #sym.dot.c #location]
    #if desc != none {
      v(subsection.description-gap * 1em)
      text(size: 9.5pt, fill: c.body)[#desc]
    }
    #if highlights.len() > 0 {
      v(subsection.highlights-gap * 1em)
      set text(size: 9pt, fill: c.body)
      set list(spacing: bullet-between-gap)
      for hl in highlights { [- #hl] }
    }
  ]
}

// Education entry
#let edu(degree, school, loc: none, start, end: none, highlights: ()) = {
  block(
    breakable: false,
    above: subsection.education-above * 1em,
    below: subsection.education-below * 1em,
  )[
    #grid(
      columns: (1fr, auto),
      text(font: heading-family, weight: "semibold", size: 10pt, fill: c.subsection-title)[#degree],
      text(size: 9pt, fill: c.subsection-date, weight: "medium")[#start#if end != none [ — #end]#if end == none [ — Present]],
    )
    #v(subsection-title-meta-gap)
    #text(size: 9pt, fill: c.subsection-meta, weight: f.meta.weight)[#school#if loc != none [, #loc]]
    #if highlights.len() > 0 {
      v(subsection.highlights-gap * 1em)
      set text(size: 9pt, fill: c.body)
      set list(spacing: bullet-between-gap)
      for hl in highlights { [- #hl] }
    }
  ]
}

// Skill badge
#let badge(label) = {
  box(
    inset: (x: 4pt, y: 2pt),
    radius: 3pt,
    fill: rgb(f.badge.bg),
    stroke: 0.3pt + rgb(f.badge.border-color).lighten(30%),
    text(size: f.badge.size * 1pt, fill: c.heading, weight: f.badge.weight)[#label],
  )
  h(2pt)
}

// Contact line
#let contact-line(label) = {
  text(size: f.sidebar.size * 1pt, fill: c.body)[#label]
  v(header-contact-line-gap)
}

#let render-sidebar-section(id) = {
  if id == "contact" [
    #sidebar-section("Contact")
    #set text(size: f.sidebar.size * 1pt, fill: c.body)
    #contact-line(data.basics.email)
    #contact-line[#r(data.basics.location.city), #r(data.basics.location.country)]
    #contact-line[reebal-sami.com]
    #contact-line[linkedin.com/in/reebal-sami]
    #contact-line[github.com/ReebalSami]
  ] else if id == "technical-skills" [
    #sidebar-section("Technical Skills")
    #for cat in data.skills [
      #block(
        above: technical.category-above * 1em,
        below: technical.category-below * 1em,
        width: 100%,
        breakable: false,
      )[
        #text(font: heading-family, weight: "semibold", size: 8.5pt, fill: c.heading)[#r(cat.category)]
        #v(technical.title-badges-gap * 1em)
        #set text(size: f.badge.size * 1pt)
        #box(width: 100%)[#cat.skills.map(s => badge(s.name)).join()]
        #v(technical.badges-after-gap * 1em)
      ]
    ]
  ] else if id == "key-strengths" [
    #v(sidebar-key-strengths-extra-above)
    #sidebar-section("Key Strengths")
    #set text(size: f.sidebar.size * 0.95 * 1pt, fill: c.body)
    #set list(spacing: bullet-between-gap)
    #for ss in data.softSkills.at(locale) [
      - #ss
    ]
  ] else if id == "languages" [
    #sidebar-section("Languages")
    #for lang in data.languages [
      #block(below: sidebar-languages-item-below)[
        #text(font: heading-family, weight: "semibold", size: f.sidebar.size * 1pt, fill: c.heading)[#r(lang.language)]
        #h(0.3em)
        #text(size: 8.5pt, fill: c.muted)[#r(lang.fluency)]
      ]
    ]
    #v(sidebar-languages-next-spacing)
  ] else if id == "interests" [
    #sidebar-section("Hobbies & Interests")
    #for interest in data.interests [
      #block(above: interests-item-above, below: interests-item-below)[
        #text(font: heading-family, weight: "semibold", size: f.sidebar.size * 1pt, fill: c.heading)[#r(interest.name)]
        #if "keywords" in interest [
          #v(interests-keywords-gap)
          #text(size: 8.5pt, fill: c.muted)[#interest.keywords.map(k => r(k)).join(" · ")]
          #v(interests-description-after)
        ]
      ]
    ]
  ] else if id == "references" [
    #v(sidebar-references-extra-above)
    #sidebar-section("References")
    #text(size: f.sidebar.size * 1pt, fill: c.muted)[Available upon request]
  ] else if id == "ats-link" [
    #if design.ats-link.enabled [
      #v(0.5em)
      #box(
        width: 100%,
        inset: (x: 4pt, y: 3pt),
        radius: 3pt,
        fill: c.accent-light,
      )[
        #text(size: 5.5pt, fill: c.muted)[
          #design.ats-link.label
        ]
      ]
    ]
  ]
}

#let render-main-section(id) = {
  if id == "profile" [
    #main-section("Profile")
    #text(size: 9.5pt, fill: c.body)[#r(data.profile.summary)]
  ] else if id == "experience" [
    #main-section("Experience")
    #for j in data.experience [
      #job(
        r(j.position), j.company, j.location,
        j.startDate, j.at("endDate", default: "Present"),
        desc: if "description" in j { r(j.description) },
        highlights: if "highlights" in j { j.highlights.map(h => r(h)) } else { () },
      )
    ]
  ] else if id == "education" [
    #main-section("Education")
    #for e in data.education [
      #edu(
        { if "studyType" in e { r(e.studyType) + " " } else { "" }; r(e.area) },
        e.institution,
        loc: e.at("location", default: none),
        e.startDate,
        end: e.at("endDate", default: none),
        highlights: if "highlights" in e { e.highlights.map(h => r(h)) } else { () },
      )
    ]
  ] else if id == "selected-projects" [
    #main-section("Selected Projects")
    #for proj in data.projects [
      #block(breakable: false, above: 0.1em, below: 0.08em)[
        #text(font: heading-family, weight: "semibold", size: 7.5pt, fill: c.heading)[#proj.name]
        #v(0.02em)
        #text(size: 7pt, fill: c.body)[#r(proj.description)]
      ]
    ]
  ] else if id == "key-strengths" [
    #v(main-key-strengths-extra-above)
    #main-section("Key Strengths")
    #set text(size: 9pt, fill: c.body)
    #set list(spacing: bullet-between-gap)
    #for ss in data.softSkills.at(locale) [
      - #ss
    ]
  ]
}

// =============================================================================
// LAYOUT — Two columns via grid
// =============================================================================
#if header-orb.enabled == true [
  #top-left-glow(header-orb)
]
#grid(
  columns: (sidebar-width, main-width),
  column-gutter: photo-gap-right,

  // =========================================================================
  // LEFT SIDEBAR
  // =========================================================================
  block(
    width: 100%,
    inset: (x: 0.6cm, top: 0.8cm, bottom: 0.6cm),
    breakable: true,
  )[
    // --- Photo ---
    #if photo.enabled [
      #align(center)[
        #move(dx: photo-offset-x, dy: photo-offset-y)[
          #box(
            clip: photo.at("clip", default: false),
            radius: if photo.radius >= 50 { 50% } else { photo.radius * 1pt },
            width: photo.width-percent * 1%,
            stroke: if photo.border == true { 0.6pt + c.accent } else { none },
          )[#image("../assets/profile-photo.png", width: 100%, fit: photo.fit)]
        ]
      ]
      #v(header-photo-name-gap)
    ]

    // --- Name + Title ---
    #align(center)[
      #text(
        font: heading-family,
        size: f.heading.name-size * 1pt,
        weight: f.heading.weight,
        fill: c.heading,
      )[#data.basics.name]
      #v(header-name-title-gap)
      #set par(justify: false)
      #text(
        font: heading-family,
        size: f.heading.title-size * 1pt,
        weight: "regular",
        fill: c.muted,
        tracking: 0.06em,
      )[#upper(r(data.basics.title))]
      #v(header-title-divider-gap)
      #box(width: 2.5cm, height: 0.6pt, fill: c.accent)
    ]
    #v(header-divider-sections-gap)

    #for id in sidebar-sections {
      render-sidebar-section(id)
    }
  ],

  // =========================================================================
  // RIGHT MAIN CONTENT
  // =========================================================================
  block(
    width: 100%,
    inset: (left: 0.6cm, right: 0.8cm, top: 0.8cm, bottom: 0.6cm),
    breakable: true,
  )[
    #for id in main-sections {
      render-main-section(id)
    }
  ],
)
