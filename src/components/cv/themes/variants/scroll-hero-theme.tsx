import type { CvData } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { getTranslations } from "next-intl/server";
import { ScrollHeroClient } from "./scroll-hero-client";
import { CvBody } from "../shared/cv-body";

type Locale = "en" | "de" | "es" | "ar";

interface Props {
  data: CvData;
  locale: Locale;
  photoSrc?: string;
  heroTransitionName?: string;
}

/**
 * Scroll Hero — server wrapper.
 *
 * Delegates the scroll-linked cinematic hero to ScrollHeroClient (client
 * component with useScroll + useTransform), then composes the shared
 * CvBody below it. Body renders in its default tone since the hero has
 * already "ended" visually by the time the user reaches it.
 *
 * max-w-5xl on the body matches the canonical — this variant isn't a
 * magazine-width spread.
 */
export async function ScrollHeroTheme({
  data,
  locale,
  photoSrc,
  heroTransitionName = "hero-photo-option-6",
}: Props) {
  const t = await getTranslations("cv");
  const r = (s: Parameters<typeof resolveCvLocaleString>[0]) =>
    resolveCvLocaleString(s, locale);
  const resolvedPhoto = photoSrc ?? data.basics.photo;

  return (
    <div className="relative overflow-x-clip">
      <ScrollHeroClient
        name={data.basics.name}
        title={r(data.basics.title)}
        summary={r(data.profile.summary)}
        email={data.basics.email}
        location={`${r(data.basics.location.city)}, ${r(
          data.basics.location.country,
        )}`}
        photoSrc={resolvedPhoto}
        heroTransitionName={heroTransitionName}
        profiles={data.basics.profiles.map((p) => ({
          network: p.network,
          url: p.url,
          username: p.username,
        }))}
        i18n={{
          title: t("title"),
          downloadPdf: t("downloadPdf"),
          scrollHint: "Scroll",
        }}
      />

      <CvBody data={data} locale={locale} showSeparator={false} />
    </div>
  );
}
