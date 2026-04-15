import { getTranslations } from "next-intl/server";
import type { CvProfile as CvProfileData, CvLocaleString } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { CvSection } from "./cv-section";

type Locale = "en" | "de" | "es" | "ar";

interface CvProfileProps {
  profile: CvProfileData;
  locale: Locale;
  className?: string;
}

export async function CvProfile({ profile, locale, className }: CvProfileProps) {
  const t = await getTranslations("cv");

  const summary = resolveCvLocaleString(profile.summary as CvLocaleString, locale);

  return (
    <CvSection id="profile" heading={t("profile")} className={className}>
      <p className="text-sm leading-relaxed text-foreground print:text-[10pt] print:leading-snug">
        {summary}
      </p>
    </CvSection>
  );
}
