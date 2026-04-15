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
