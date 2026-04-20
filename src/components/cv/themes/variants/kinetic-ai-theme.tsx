import type { CvData } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { getTranslations } from "next-intl/server";
import { KineticAiHero } from "./kinetic-ai-hero";
import { CvBody } from "../shared/cv-body";

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
  const resolvedPhoto = photoSrc ?? data.basics.photo;

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
          <div className="border-t border-gallery-warm/30 pt-6 font-mono">
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.35em] text-neutral-400">
              Curriculum vitae
            </p>
            <p className="mt-2 text-sm text-neutral-100">
              v.{new Date().getFullYear()}.
              {String(new Date().getMonth() + 1).padStart(2, "0")} ·{" "}
              {r(data.basics.location.city)}, {r(data.basics.location.country)}
            </p>
            <p className="mt-4 text-[0.6rem] text-neutral-500">
              Rendered on {new Date().toISOString().slice(0, 10)}
            </p>
          </div>
        }
      />
    </div>
  );
}
