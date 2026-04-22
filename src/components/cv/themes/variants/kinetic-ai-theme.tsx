import type { CvData } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { getTranslations } from "next-intl/server";
import { Download } from "lucide-react";
import { KineticAiHero } from "./kinetic-ai-hero";
import { CvBody } from "../shared/cv-body";
import { CvDownloadFab } from "@/components/cv/cv-download-fab";
import { CvDownloadCta } from "@/components/cv/cv-download-cta";
import { getPhotoPath } from "@/lib/config";

type Locale = "en" | "de" | "es" | "ar";

interface Props {
  data: CvData;
  locale: Locale;
  photoSrc?: string;
  heroTransitionName?: string;
}

function yearsOfExperience(data: CvData): number {
  if (!data.experience.length) return 0;
  const oldest = data.experience
    .map((e) => e.startDate)
    .filter(Boolean)
    .sort()[0];
  if (!oldest) return 0;
  const start = new Date(oldest + "-01");
  const diffYears = (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(1, Math.floor(diffYears));
}

/**
 * Kinetic AI — dark warm shader-noise backdrop, kinetic letter-stagger
 * name, animated counters, magnetic download button. The signature
 * "AI engineer" variant. Client-side motion is scoped to the hero; the
 * CV body is the shared server component.
 */
export async function KineticAiTheme({
  data,
  locale,
  photoSrc,
  heroTransitionName = "hero-photo-option-4",
}: Props) {
  const t = await getTranslations("cv");
  const r = (s: Parameters<typeof resolveCvLocaleString>[0]) =>
    resolveCvLocaleString(s, locale);
  // site.yaml `photos.cvPage` is the canonical source for /cv page photos.
  // Preview variants pass their own `photoSrc` to A/B different images.
  const resolvedPhoto = photoSrc ?? getPhotoPath("cvPage");

  const years = yearsOfExperience(data);
  const skillCount = data.skills.reduce((n, g) => n + g.skills.length, 0);

  // Counter labels clarified — previous "Years / Languages / Skills" was
  // ambiguous (years of what? which languages?). Naming them in full here
  // keeps the hero self-explanatory without a caption.
  const counters = [
    { label: "Yrs. experience", value: years, suffix: "+" },
    { label: "Languages", value: data.languages.length },
    { label: "Technical skills", value: skillCount },
  ];

  return (
    // Outer wrapper supplies the dark base colour so hero shader and body
    // both sit on the same neutral-950 surface — no visual seam between
    // them. A soft warm radial fades into the body so the shader "bleeds"
    // past the hero rather than stopping abruptly.
    <div className="relative overflow-x-clip bg-neutral-950 text-neutral-100">
      <div
        className="pointer-events-none absolute inset-x-0 top-[85vh] h-[140vh] -z-0"
        aria-hidden="true"
        style={{
          background: [
            "radial-gradient(ellipse 70% 40% at 20% 0%, oklch(0.45 0.12 50 / 0.25), transparent 65%)",
            "radial-gradient(ellipse 60% 35% at 85% 15%, oklch(0.42 0.1 40 / 0.2), transparent 65%)",
            "radial-gradient(ellipse 80% 50% at 50% 70%, oklch(0.4 0.08 40 / 0.15), transparent 70%)",
          ].join(", "),
        }}
      />

      <KineticAiHero
        name={data.basics.name}
        title={r(data.basics.title)}
        summary={r(data.profile.summary)}
        email={data.basics.email}
        phone={data.basics.phone}
        location={`${r(data.basics.location.city)}, ${r(data.basics.location.country)}`}
        photoSrc={resolvedPhoto}
        heroTransitionName={heroTransitionName}
        profiles={data.basics.profiles.map((p) => ({
          network: p.network,
          url: p.url,
          username: p.username,
        }))}
        counters={counters}
        i18n={{ downloadPdf: t("downloadPdf") }}
      />

      <CvBody
        data={data}
        locale={locale}
        showSeparator={false}
        showBackgroundShapes={false}
        maxWidthClass="max-w-6xl"
        tone="dark"
        bottomDecoration={
          // Sidebar pull-quote in Kinetic's voice — same line as Editorial's
          // for consistency across variants. Mono-warm label, neutral-100
          // body, terminal-style attribution. Replaces the iter-2 "version
          // block" which read more like a footer than an identity element.
          <div className="border-t border-gallery-warm/30 pt-6">
            <p className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.35em] text-neutral-400">
              In his own words
            </p>
            <blockquote className="mt-3 text-base italic leading-relaxed text-neutral-100">
              &ldquo;The best AI isn&apos;t the one that dazzles in a demo — it&apos;s the
              one that ships in the next sprint.&rdquo;
            </blockquote>
            <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-neutral-500">
              — {data.basics.name} · v.{new Date().getFullYear()}.
              {String(new Date().getMonth() + 1).padStart(2, "0")}
            </p>
          </div>
        }
      />

      {/* End-of-page closing CTA — dark-tone variant. Warm button on the
          neutral-950 surface mirrors the hero CTA so visitors recognise
          the same affordance after scrolling through Experience. */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-4 text-center">
          <p className="mb-5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.35em] text-neutral-400">
            Take it with you
          </p>
          <CvDownloadCta
            source="footer"
            ariaLabel={t("downloadPdf")}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-gallery-warm px-7 py-3 text-sm font-medium text-neutral-950 transition-colors hover:bg-gallery-warm/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gallery-warm focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {t("downloadPdf")}
          </CvDownloadCta>
        </div>
      </section>

      {/* Page-level FAB — listens for `cv-fab:open` events from the hero
          and footer CTAs. Gallery-warm bg works on light AND dark surfaces
          so no tone-specific styling is needed; the panel itself uses
          bg-background which respects the user's mode preference. */}
      <CvDownloadFab />
    </div>
  );
}
