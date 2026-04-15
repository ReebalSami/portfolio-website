// =============================================================================
// ATS CV — Single-Column, Machine-Friendly, YAML-Driven Design
//
// All design tokens loaded from config/cv/cv-design.yaml — edit there, not here.
// ATS: ALL text in single visual column → zero pdftotext interleaving.
//
// Compile: typst compile --root . --font-path scripts/typst/fonts scripts/typst/ats/cv-ats.typ public/cv/ats/resume_reebal_sami.pdf
// =============================================================================

// --- Data + Config ---
#let data = yaml("../../../config/cv/cv.public.yaml")
#let design = yaml("../../../config/cv/cv-design.yaml").ats
#let locale = if sys.inputs.at("locale", default: none) != none { sys.inputs.locale } else { "en" }

// --- Shared imports ---
#import "../shared/locale.typ": resolve
#import "../shared/shapes.typ": scatter-shapes

#let r(val) = resolve(val, locale)

// =============================================================================
// DESIGN TOKENS — resolved from YAML
// =============================================================================
#let c = (
  bg: rgb(design.colors.bg),
  header-bg: rgb(design.colors.header-bg),
  text: rgb(design.colors.text),
  body: rgb(design.colors.at("body", default: design.colors.text)),
  heading: rgb(design.colors.heading),
  muted: rgb(design.colors.muted),
  accent: rgb(design.colors.accent),
  accent-light: rgb(design.colors.accent-light),
  white: rgb(design.colors.white),
  dark: rgb(design.colors.dark),
  separator: rgb(design.colors.separator),
  subsection-title: rgb(design.colors.at("subsection-title", default: design.colors.heading)),
  subsection-meta: rgb(design.colors.at("subsection-meta", default: design.colors.muted)),
  subsection-date: rgb(design.colors.at("subsection-date", default: design.colors.muted)),
  header-name: rgb(design.colors.at("header-name", default: design.colors.at("heading", default: design.colors.text))),
  header-title: rgb(design.colors.at("header-title", default: design.colors.at("muted", default: design.colors.text))),
  header-contact: rgb(design.colors.at("header-contact", default: design.colors.at("body", default: design.colors.text))),
)

#let f = design.fonts
#let heading-family = f.heading.family
#let body-family = f.body.family
#let photo = design.photo
#let typography = design.at("typography", default: (leading: 0.58))
#let subsection = design.at(
  "subsection",
  default: (
    job-above: 0.15,
    job-below: 0.1,
    education-above: 0.12,
    education-below: 0.08,
    description-gap: 0.04,
    highlights-gap: 0.04,
  ),
)
#let technical = design.at(
  "technical-skills",
  default: (
    category-above: 0.3,
    title-badges-gap: 0.12,
    badges-after-gap: 0,
    category-below: 0.15,
  ),
)
#let shape-seed-input = sys.inputs.at("shapeSeed", default: none)
#let shape-seed-mode = design.shapes.at("seed-mode", default: "fixed")
#let runtime-shape-seed = if shape-seed-mode == "random-per-build" and shape-seed-input != none {
  int(shape-seed-input)
} else {
  none
}
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

// Page geometry
#let spacing = design.at("spacing", default: (profile: "balanced", multiplier: 1.0))
#let spacing-profile = spacing.at("profile", default: "balanced")
#let spacing-multiplier = spacing.at(
  "multiplier",
  default: if spacing-profile == "compact" {
    0.86
  } else if spacing-profile == "airy" {
    1.16
  } else {
    1.0
  },
)
#let scaled-space(value) = value * spacing-multiplier

#let margin-x = design.page.margin-x * 1cm
#let margin-bottom = design.page.margin-bottom * 1cm
#let margin-top = design.page.margin-top-continuation * 1cm
#let photo-column-width = photo.at("column-width-percent", default: 18) * 1%
#let photo-gap-right = photo.at("gap-right-cm", default: 0.7) * 1cm
#let photo-offset-x = photo.at("offset-x-pt", default: 0) * 1pt
#let photo-offset-y = photo.at("offset-y-pt", default: 0) * 1pt
#let section-transition-gap = scaled-space(design.section.spacing-above) * 1em
#let section-content-gap = scaled-space(design.section.spacing-below) * 1em
#let section-title-separator-gap = scaled-space(design.section.at("title-separator-gap", default: 0.06)) * 1em
#let subsection-title-meta-gap = scaled-space(subsection.at("title-meta-gap", default: 0)) * 1em
#let job-above-gap = scaled-space(subsection.job-above) * 1em
#let job-below-gap = scaled-space(subsection.job-below) * 1em
#let job-description-gap = scaled-space(subsection.description-gap) * 1em
#let job-highlights-gap = scaled-space(subsection.highlights-gap) * 1em
#let education-above-gap = scaled-space(subsection.education-above) * 1em
#let education-below-gap = scaled-space(subsection.education-below) * 1em
#let technical-category-above-gap = scaled-space(technical.category-above) * 1em
#let technical-category-below-gap = scaled-space(technical.category-below) * 1em
#let technical-title-badges-gap = scaled-space(technical.title-badges-gap) * 1em
#let technical-badges-after-gap = scaled-space(technical.badges-after-gap) * 1em
#let interests-item-below = scaled-space(subsection.at("interests-item-below", default: 0.25)) * 1em
#let interests-keywords-gap = scaled-space(subsection.at("interests-keywords-gap", default: 0.04)) * 1em
#let interests-item-above = scaled-space(subsection.at("interests-item-above", default: 0)) * 1em
#let interests-description-after = scaled-space(subsection.at("interests-description-after", default: 0)) * 1em
#let bullet-between-gap = scaled-space(subsection.at("bullet-between-gap", default: 0.12)) * 1em
#let key-strengths-row-gutter = scaled-space(subsection.at("key-strengths-row-gutter", default: 0.35)) * 1em
#let languages-next-spacing = scaled-space(design.section.at("languages-next-spacing", default: 0.2)) * 1em
#let languages-bullet-gap = design.section.at("languages-bullet-gap", default: 0.3) * 1em
#let key-strengths-extra-above = scaled-space(design.section.at("key-strengths-extra-above", default: 0)) * 1em
#let references-extra-above = scaled-space(design.section.at("references-extra-above", default: 0)) * 1em
#let header-name-title-gap = scaled-space(design.header.at("name-title-gap", default: 0.08)) * 1em
#let header-title-contact-gap = scaled-space(design.header.at("title-contact-gap", default: 0.4)) * 1em
#let header-contact-row-gap = scaled-space(design.header.at("contact-row-gap", default: 0.2)) * 1em
#let header-after-gap = scaled-space(design.header.at("after-gap", default: 0.15)) * 1em

// =============================================================================
// PAGE SETUP — margin-top applies to page 2+; header outset covers page 1 top
// =============================================================================
#set page(
  paper: "a4",
  margin: (top: margin-top, bottom: margin-bottom, left: margin-x, right: margin-x),
  fill: c.bg,
  background: {
    context scatter-shapes(here().page(), design.shapes, base-seed: runtime-shape-seed)
  },
)
#set text(font: body-family, size: f.body.size * 1pt, fill: c.text, weight: f.body.weight)
#let par-spacing = typography.at("par-spacing", default: 0) * 1em
#set par(leading: typography.leading * 1em, spacing: par-spacing, justify: true)
#set block(above: 0pt, below: 0pt)

// =============================================================================
// REUSABLE COMPONENTS
// =============================================================================

// Section heading — unified transition spacing for predictable ATS rhythm.
#let section-start(title, extra-gap: 0pt, gap-mode: "max") = {
  let transition-gap = if gap-mode == "add" {
    section-transition-gap + extra-gap
  } else {
    calc.max(section-transition-gap, extra-gap)
  }

  v(transition-gap)
  block(width: 100%)[
    #text(
      font: heading-family,
      size: f.heading.section-size * 1pt,
      weight: "semibold",
      fill: c.heading,
      tracking: f.heading.tracking * 1em,
      upper(title),
    )
    #v(section-title-separator-gap)
    #box(width: 100%, height: design.section.separator-height * 1pt, fill: c.separator)
  ]
  v(section-content-gap)
}

// Job entry — breakable: false prevents splitting across pages
#let job(position, company, location, start, end, desc: none, highlights: (), above-gap: 0pt, below-gap: 0pt) = {
  block(breakable: false, above: above-gap, below: below-gap)[
    #grid(
      columns: (1fr, auto),
      text(font: heading-family, weight: "semibold", size: f.heading.subsection-size * 1pt, fill: c.subsection-title)[#position],
      text(size: f.meta.size * 1pt, fill: c.subsection-date, weight: f.meta.weight)[#start — #end],
    )
    #v(subsection-title-meta-gap)
    #text(size: f.meta.size * 1pt, fill: c.subsection-meta, weight: f.meta.weight)[#company #sym.dot.c #location]
    #if desc != none {
      v(job-description-gap)
      text(size: f.body.size * 0.94 * 1pt, fill: c.dark)[#desc]
    }
    #if highlights.len() > 0 {
      v(job-highlights-gap)
      set text(size: f.body.size * 0.92 * 1pt, fill: c.dark)
      set list(spacing: bullet-between-gap)
      for hl in highlights { [- #hl] }
    }
  ]
}

// Education entry — breakable: false
#let edu(degree, school, loc: none, start, end: none, highlights: (), above-gap: 0pt, below-gap: 0pt) = {
  block(
    breakable: false,
    above: above-gap,
    below: below-gap,
  )[
    #grid(
      columns: (1fr, auto),
      text(font: heading-family, weight: "semibold", size: f.heading.subsection-size * 1pt, fill: c.subsection-title)[#degree],
      text(size: f.meta.size * 1pt, fill: c.subsection-date, weight: f.meta.weight)[#start#if end != none [ — #end]#if end == none [ — Present]],
    )
    #v(subsection-title-meta-gap)
    #text(size: f.meta.size * 1pt, fill: c.subsection-meta, weight: f.meta.weight)[#school#if loc != none [, #loc]]
    #if highlights.len() > 0 {
      v(job-highlights-gap)
      set text(size: f.body.size * 0.92 * 1pt, fill: c.dark)
      set list(spacing: bullet-between-gap)
      for hl in highlights { [- #hl] }
    }
  ]
}

// Skill badge
#let badge(label) = {
  box(
    inset: (x: 5pt, y: 2.5pt),
    radius: 3pt,
    fill: rgb(f.badge.bg),
    stroke: 0.4pt + rgb(f.badge.border-color).lighten(40%),
    text(size: f.badge.size * 1pt, fill: c.dark, weight: f.badge.weight)[#label],
  )
  h(2.5pt)
}

// =============================================================================
// HEADER — Full-width warm bar with photo, name, title, contact
// =============================================================================
#block(
  width: 100% + margin-x * 2,
  inset: (
    x: margin-x,
    top: design.header.padding-top * 1cm,
    bottom: design.header.padding-bottom * 1cm,
  ),
  fill: c.header-bg,
  outset: (x: margin-x, top: margin-top),
)[
  #if header-orb.enabled == true [
    #top-left-glow(header-orb)
  ]
  #grid(
    columns: if photo.enabled { (photo-column-width, 1fr) } else { (1fr,) },
    column-gutter: if photo.enabled { photo-gap-right } else { 0cm },
    // Photo — full uncropped, configurable size
    if photo.enabled [
      #move(dx: photo-offset-x, dy: photo-offset-y)[
        #box(
          clip: photo.at("clip", default: true),
          radius: photo.radius * 1pt,
          width: photo.width-percent * 1%,
          stroke: if photo.border == true { 0.6pt + c.accent-light } else { none },
        )[#image("../../../public/images/cv/profile-photo.png", width: 100%, fit: photo.fit)]
      ]
    ],
    // Name + Contact
    [
      #text(
        font: heading-family,
        size: f.heading.name-size * 1pt,
        weight: f.heading.weight,
        fill: c.header-name,
        tracking: 0.02em,
      )[
        #data.basics.name
      ]
      #v(header-name-title-gap)
      #text(
        font: heading-family,
        size: f.heading.title-size * 1pt,
        weight: "regular",
        fill: c.header-title,
        tracking: 0.08em,
      )[
        #upper(r(data.basics.title))
      ]
      #v(header-title-contact-gap)
      #set text(size: f.meta.size * 1pt, fill: c.header-contact)
      #grid(
        columns: (1fr, 1fr),
        row-gutter: header-contact-row-gap,
        [#data.basics.email],
        [linkedin.com/in/reebal-sami],
        [#r(data.basics.location.city), #r(data.basics.location.country)],
        [github.com/ReebalSami],
        [reebal-sami.com], [],
      )
    ],
  )
]

#v(header-after-gap)

// =============================================================================
// PROFILE
// =============================================================================
#section-start("Profile")
#text(size: f.body.size * 0.96 * 1pt, fill: c.dark)[#r(data.profile.summary)]

// =============================================================================
// EXPERIENCE
// =============================================================================
#section-start("Experience")

#let job-between-gap = calc.max(job-above-gap, job-below-gap)

#for (idx, j) in data.experience.enumerate() [
  #job(
    r(j.position), j.company, j.location,
    j.startDate, j.at("endDate", default: "Present"),
    above-gap: if idx == 0 { job-above-gap } else { job-between-gap },
    below-gap: 0pt,
    desc: if "description" in j { r(j.description) },
    highlights: if "highlights" in j { j.highlights.map(h => r(h)) } else { () },
  )
]

// =============================================================================
// EDUCATION
// =============================================================================
#section-start("Education")

#let education-between-gap = calc.max(education-above-gap, education-below-gap)

#for (idx, e) in data.education.enumerate() [
  #edu(
    { if "studyType" in e { r(e.studyType) + " " } else { "" }; r(e.area) },
    e.institution,
    loc: e.at("location", default: none),
    e.startDate,
    end: e.at("endDate", default: none),
    above-gap: if idx == 0 { education-above-gap } else { education-between-gap },
    below-gap: 0pt,
    highlights: if "highlights" in e { e.highlights.map(h => r(h)) } else { () },
  )
]

// =============================================================================
// TECHNICAL SKILLS — badges by category, each in its own block
// =============================================================================
#section-start("Technical Skills")

#let technical-between-gap = calc.max(technical-category-above-gap, technical-category-below-gap)

#for (idx, cat) in data.skills.enumerate() [
  #v(if idx == 0 { technical-category-above-gap } else { technical-between-gap })
  #block(
    width: 100%,
    breakable: false,
  )[
    #text(font: heading-family, weight: "semibold", size: f.meta.size * 1pt, fill: c.heading)[#r(cat.category)]
    #v(technical-title-badges-gap)
    #cat.skills.map(s => badge(s.name)).join()
    #if idx < data.skills.len() - 1 {
      v(technical-badges-after-gap)
    }
  ]
]

// =============================================================================
// KEY STRENGTHS
// =============================================================================
#section-start("Key Strengths", extra-gap: key-strengths-extra-above, gap-mode: "max")

#set text(size: f.body.size * 0.92 * 1pt, fill: c.dark)
#set list(spacing: bullet-between-gap)
#grid(
  columns: (1fr, 1fr),
  column-gutter: 1em,
  row-gutter: key-strengths-row-gutter,
  ..data.softSkills.at(locale).map(ss => [- #ss])
)

// =============================================================================
// LANGUAGES
// =============================================================================
#section-start("Languages")

#block(width: 100%)[
  #set text(size: f.body.size * 0.92 * 1pt, fill: c.dark)
  #data.languages.map(lang => [
    #text(font: heading-family, weight: "semibold", fill: c.heading)[#r(lang.language)]
    #text(fill: c.muted)[ #r(lang.fluency)]
  ]).join[
    #h(languages-bullet-gap)
    #text(fill: c.accent)[·]
    #h(languages-bullet-gap)
  ]
]

// =============================================================================
// HOBBIES & INTERESTS — full section with structured entries
// =============================================================================
#section-start("Hobbies & Interests", extra-gap: languages-next-spacing, gap-mode: "max")

#let interests-between-gap = calc.max(interests-item-above, interests-item-below)

#for (idx, interest) in data.interests.enumerate() [
  #block(
    breakable: false,
    above: if idx == 0 { interests-item-above } else { interests-between-gap },
    below: 0pt,
  )[
    #text(font: heading-family, weight: "semibold", size: f.body.size * 1pt, fill: c.heading)[
      #r(interest.name)#if "keywords" in interest [:]
    ]
    #if "keywords" in interest [
      #v(interests-keywords-gap)
      #text(size: f.body.size * 0.92 * 1pt, fill: c.dark)[
        #interest.keywords.map(k => r(k)).join(" / ")
      ]
      #v(interests-description-after)
    ]
  ]
]

// =============================================================================
// REFERENCES
// =============================================================================
#section-start("References", extra-gap: references-extra-above, gap-mode: "max")
#text(size: f.meta.size * 1pt, fill: c.subsection-meta)[Available upon request]
