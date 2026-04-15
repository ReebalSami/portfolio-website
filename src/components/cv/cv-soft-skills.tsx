import { getTranslations } from "next-intl/server";
import type { CvSoftSkills as CvSoftSkillsData } from "@/lib/cv/schema";
import { CvSection } from "./cv-section";

type Locale = "en" | "de" | "es" | "ar";

interface CvSoftSkillsProps {
  softSkills: CvSoftSkillsData;
  locale: Locale;
  className?: string;
}

export async function CvSoftSkills({ softSkills, locale, className }: CvSoftSkillsProps) {
  const t = await getTranslations("cv");

  const items = (softSkills[locale as keyof CvSoftSkillsData] as string[] | undefined)
    ?? softSkills.en;

  if (!items || items.length === 0) return null;

  return (
    <CvSection id="soft-skills" heading={t("softSkills")} className={className}>
      <ul className="list-disc ps-5 space-y-0.5 text-sm text-foreground/80 print:text-[9pt]">
        {items.map((skill, idx) => (
          <li key={idx}>{skill}</li>
        ))}
      </ul>
    </CvSection>
  );
}
