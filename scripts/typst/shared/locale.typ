// =============================================================================
// Locale Resolver — shared by all CV templates
// =============================================================================
// Resolves inline i18n maps { en: "...", de: "..." } to the active locale.
// Falls back to "en" if the requested locale is missing.
// =============================================================================

#let resolve(val, locale) = {
  if type(val) == str { val }
  else if type(val) == dictionary {
    if locale in val { val.at(locale) }
    else if "en" in val { val.at("en") }
    else { str(val) }
  }
  else { str(val) }
}

// Keep website data rich while allowing PDF variants to hide extended/private entries.
#let is-pdf-visible(entry) = {
  let visibility = entry.at("visibility", default: "public")
  visibility != "extended" and visibility != "private"
}

#let project-date-rank(date-val) = {
  if type(date-val) == str and date-val.len() >= 4 {
    let base = int(date-val.slice(0, 4))
    if date-val.contains("/") {
      base + 0.5
    } else {
      base + 0.0
    }
  } else {
    0.0
  }
}

#let sort-projects-newest(projects) = {
  projects.sorted(key: p => -project-date-rank(p.at("date", default: "")))
}
