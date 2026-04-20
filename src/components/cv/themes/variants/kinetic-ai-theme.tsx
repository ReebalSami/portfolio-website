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

  const counters = [
    { label: "Years", value: years, suffix: "+" },
    { label: "Languages", value: data.languages.length },
    { label: "Skills", value: skillCount },
  ];

  return (
    <div className="relative overflow-x-clip">
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
      <CvBody data={data} locale={locale} showSeparator={false} />
    </div>
  );
}
