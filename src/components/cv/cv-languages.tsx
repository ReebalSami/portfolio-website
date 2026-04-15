import { getTranslations } from "next-intl/server";
import type { CvLanguage, CvLocaleString } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { CvSection } from "./cv-section";

type Locale = "en" | "de" | "es" | "ar";

interface CvLanguagesProps {
  languages: CvLanguage[];
  locale: Locale;
  className?: string;
}

export async function CvLanguages({ languages, locale, className }: CvLanguagesProps) {
  const t = await getTranslations("cv");

  return (
    <CvSection id="languages" heading={t("languages")} className={className}>
      <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm print:text-[9pt]">
        {languages.map((lang) => {
          const name = resolveCvLocaleString(lang.language as CvLocaleString, locale);
          const fluency = resolveCvLocaleString(lang.fluency as CvLocaleString, locale);
          return (
            <li key={name} className="flex items-baseline gap-1.5">
              <span className="font-medium text-foreground">{name}</span>
              <span className="text-muted-foreground">({fluency})</span>
            </li>
          );
        })}
      </ul>
    </CvSection>
  );
}
