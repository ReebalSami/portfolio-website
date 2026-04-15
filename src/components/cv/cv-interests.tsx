import { getTranslations } from "next-intl/server";
import type { CvInterest, CvLocaleString } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { CvSection } from "./cv-section";

type Locale = "en" | "de" | "es" | "ar";

interface CvInterestsProps {
  interests: CvInterest[];
  locale: Locale;
  className?: string;
}

export async function CvInterests({ interests, locale, className }: CvInterestsProps) {
  const t = await getTranslations("cv");

  if (interests.length === 0) return null;

  return (
    <CvSection id="interests" heading={t("interests")} className={className}>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm print:text-[9pt]">
        {interests.map((interest) => {
          const name = resolveCvLocaleString(interest.name as CvLocaleString, locale);
          const keywords = interest.keywords?.map((kw) =>
            resolveCvLocaleString(kw as CvLocaleString, locale),
          );
          return (
            <div key={name} className="break-inside-avoid">
              <span className="font-medium text-foreground">{name}</span>
              {keywords && keywords.length > 0 && (
                <span className="text-muted-foreground ms-1">
                  ({keywords.join(", ")})
                </span>
              )}
            </div>
          );
        })}
      </div>
    </CvSection>
  );
}
