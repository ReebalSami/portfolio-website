import Image from "next/image";
import type { CvData } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { Mail, MapPin, Phone } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/brand-icons";
import { CvBody } from "../shared/cv-body";

type Locale = "en" | "de" | "es" | "ar";

interface Props {
  data: CvData;
  locale: Locale;
  photoSrc?: string;
  heroTransitionName?: string;
}

const networkIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  LinkedIn: LinkedInIcon,
  GitHub: GitHubIcon,
};

/**
 * Mirrored Canonical — the canonical /cv hero with left/right swapped and the
 * decorative shapes intentionally rescattered (not a literal flip). The photo
 * is rendered in full color with a subtle warm blend so it ties into the site
 * palette without the grayscale contrast used elsewhere.
 *
 * Purpose: compare whether flipping the composition and leaning into color
 * changes the feel enough to be preferred over the canonical grayscale.
 */
export async function MirroredCanonicalTheme({
  data,
  locale,
  photoSrc,
  heroTransitionName = "hero-photo-option-1",
}: Props) {
  const r = (s: Parameters<typeof resolveCvLocaleString>[0]) =>
    resolveCvLocaleString(s, locale);
  const resolvedPhoto = photoSrc ?? data.basics.photo;

  return (
    <div className="relative overflow-x-clip">
      <section className="relative px-4 py-12 sm:px-6 md:py-20 overflow-hidden">
        {/* Hero backdrop — rescattered, not just flipped */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          {/* Big blurred warm orb: was top-left on canonical, now top-right */}
          <div className="absolute -top-20 -end-20 h-80 w-80 rounded-full bg-gallery-warm/30 blur-3xl" />
          {/* Rotated muted block: was right-middle, now left-middle (flipped rotation) */}
          <div className="absolute top-1/4 start-0 h-64 w-64 rounded-[2rem] bg-gallery-warm-muted/25 -rotate-12" />
          {/* Small light circle: was bottom-left-ish, now bottom-right-ish */}
          <div className="absolute bottom-10 end-1/4 h-48 w-48 rounded-full bg-gallery-warm-light/30" />
        </div>

        <div className="relative mx-auto max-w-5xl grid gap-8 md:grid-cols-2 md:gap-12 items-center">
          {/* LEFT: text (was right on canonical) */}
          <div className="order-2 md:order-1">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground mb-3">
              {r(data.basics.title)}
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">
              {data.basics.name}
            </h1>
            <p className="cv-copy-balance text-base text-muted-foreground leading-relaxed sm:text-lg max-w-lg">
              {r(data.profile.summary)}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`mailto:${data.basics.email}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" /> {data.basics.email}
              </a>
              {data.basics.phone && (
                <a
                  href={`tel:${data.basics.phone}`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-4 w-4" /> {data.basics.phone}
                </a>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {r(data.basics.location.city)},{" "}
                {r(data.basics.location.country)}
              </span>
              {data.basics.profiles.map((p) => {
                const Icon = networkIcons[p.network];
                return (
                  <a
                    key={p.network}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {Icon && <Icon className="h-4 w-4" />}{" "}
                    {p.username || p.network}
                  </a>
                );
              })}
            </div>
          </div>

          {/* RIGHT: color photo with rescattered backing shapes */}
          {resolvedPhoto && (
            <div className="relative order-1 md:order-2 mx-auto md:mx-0 max-w-[70%] sm:max-w-[60%] md:max-w-none">
              {/* Behind-photo shapes — mirrored corners vs. canonical */}
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                aria-hidden="true"
              >
                {/* Canonical had top-left circle; mirror → top-right */}
                <div className="absolute -top-4 -end-4 h-48 w-48 rounded-full bg-gallery-warm/30 sm:h-60 sm:w-60 md:h-72 md:w-72" />
                {/* Canonical had bottom-right rounded block; mirror → bottom-left */}
                <div className="absolute -bottom-2 -start-2 h-32 w-44 rounded-[2rem] bg-gallery-warm-muted/25 -rotate-6 sm:h-40 sm:w-56" />
                {/* Canonical had mid-left small square; mirror → mid-right */}
                <div className="absolute top-1/2 -end-3 h-20 w-20 rounded-[1.5rem] bg-gallery-warm-light/30 rotate-12 sm:h-28 sm:w-28" />
              </div>
              <div
                className="relative overflow-hidden rounded-[2rem]"
                style={{ viewTransitionName: heroTransitionName }}
              >
                <Image
                  src={resolvedPhoto}
                  alt={data.basics.name}
                  width={500}
                  height={600}
                  priority
                  sizes="(max-width: 768px) 70vw, 40vw"
                  className="h-auto w-full object-cover contrast-[1.05] saturate-[0.95]"
                />
                {/* Subtle warm overlay — blends color photo into site palette
                    without going sepia. Multiply at low opacity keeps skin
                    tones natural and ties the photo to gallery-warm. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gallery-warm/[0.07] mix-blend-multiply"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <CvBody data={data} locale={locale} />
    </div>
  );
}
