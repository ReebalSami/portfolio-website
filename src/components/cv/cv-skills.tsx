import { getTranslations } from "next-intl/server";
import type { CvSkillCategory, CvLocaleString } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { CvSection } from "./cv-section";

type Locale = "en" | "de" | "es" | "ar";

interface CvSkillsProps {
  skills: CvSkillCategory[];
  locale: Locale;
  className?: string;
}

export async function CvSkills({ skills, locale, className }: CvSkillsProps) {
  const t = await getTranslations("cv");

  return (
    <CvSection id="skills" heading={t("skills")} className={className}>
      <div className="flex flex-col gap-3 print:gap-2">
        {skills.map((category) => {
          const categoryName = resolveCvLocaleString(
            category.category as CvLocaleString,
            locale,
          );
          return (
            <div key={categoryName} className="break-inside-avoid">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 print:text-[9pt]">
                {categoryName}
              </h3>
              <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
                {category.skills.map((skill) => (
                  <li
                    key={skill.name}
                    className="inline-block px-2 py-0.5 text-xs rounded-md bg-muted text-foreground print:text-[8pt] print:bg-transparent print:border print:border-border print:px-1"
                  >
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </CvSection>
  );
}
