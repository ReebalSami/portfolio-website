// =============================================================================
// Scattered Geometric Shapes — background decoration for CV pages
// =============================================================================
// Deterministic pseudo-random positioning using LCG (Linear Congruential
// Generator). Seeded from YAML config so builds are reproducible.
//
// Usage in template:
//   #import "../shared/shapes.typ": scatter-shapes
//   #set page(background: context scatter-shapes(here().page(), config.shapes))
// =============================================================================

// LCG pseudo-random: returns float in [0, 1)
#let _rand(seed, i) = {
  let n = calc.rem(calc.abs((seed + i) * 1103515245 + 12345), 2147483648)
  n / 2147483648
}

// Generate scattered shapes for a given page
#let scatter-shapes(page-num, config, page-width: 595.28pt, page-height: 841.89pt, base-seed: none) = {
  if config.enabled != true { return }

  let seed-root = if base-seed != none { base-seed } else { config.seed }
  let seed = seed-root + page-num * 97
  let per-page = calc.max(1, calc.ceil(config.count / 3))
  let type-count = config.types.len()
  if type-count == 0 { return }

  let type-distribution = config.at("type-distribution", default: "random")
  let type-offset = calc.floor(_rand(seed, 991) * type-count)

  let color = rgb(config.color)
  let alpha = config.opacity

  for i in range(per-page) {
    let r1 = _rand(seed, i * 17 + 1)
    let r2 = _rand(seed, i * 17 + 2)
    let r3 = _rand(seed, i * 17 + 3)
    let r4 = _rand(seed, i * 17 + 4)
    let r5 = _rand(seed, i * 17 + 5)
    let r6 = _rand(seed, i * 17 + 6)
    let r7 = _rand(seed, i * 17 + 7)
    let r8 = _rand(seed, i * 17 + 8)

    // Position: spread across page, avoid exact edges
    let x = r1 * page-width * 0.9
    let y = r2 * page-height * 0.9

    // Pick shape type by configured distribution mode.
    let global-i = (page-num - 1) * per-page + i
    let type-idx = if type-distribution == "equal" {
      calc.rem(global-i + type-offset, type-count)
    } else {
      calc.floor(r4 * type-count)
    }
    let shape-def = config.types.at(type-idx)
    let kind = shape-def.at("kind", default: "rounded-rect")
    let min-s = shape-def.at("min-size", default: 40) * 1pt
    let max-s = shape-def.at("max-size", default: shape-def.at("min-size", default: 40)) * 1pt
    let size = min-s + r3 * (max-s - min-s)

    let min-w = shape-def.at("min-width", default: size / 1pt) * 1pt
    let max-w = shape-def.at("max-width", default: shape-def.at("min-width", default: size / 1pt)) * 1pt
    let w = min-w + r7 * (max-w - min-w)

    let default-h = size * (0.7 + r5 * 0.6)
    let min-h = shape-def.at("min-height", default: default-h / 1pt) * 1pt
    let max-h = shape-def.at("max-height", default: shape-def.at("min-height", default: default-h / 1pt)) * 1pt
    let force-square = shape-def.at("force-square", default: false)
    let h = if force-square == true { w } else { min-h + r8 * (max-h - min-h) }

    let rot-min = if "rotation" in shape-def { shape-def.rotation.at(0) } else { 0 }
    let rot-max = if "rotation" in shape-def { shape-def.rotation.at(1) } else { 0 }
    let rotation = rot-min + r6 * (rot-max - rot-min)

    let fill-color = color.transparentize(100% - alpha * 100%)

    place(
      top + left,
      dx: x,
      dy: y,
      if kind == "circle" {
        circle(radius: size / 2, fill: fill-color)
      } else {
        let default-rad = if kind == "rect" { 0pt } else if kind == "capsule" { h / 2 } else { 4pt }
        let rad = if "radius" in shape-def { shape-def.radius * 1pt } else { default-rad }
        rotate(rotation * 1deg)[
          #rect(width: w, height: h, radius: rad, fill: fill-color)
        ]
      }
    )
  }
}
