import { getTranslations } from "next-intl/server";
import type { CvReference, CvLocaleString } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { CvSection } from "./cv-section";

type Locale = "en" | "de" | "es" | "ar";

interface CvReferencesProps {
  references: CvReference[];
  locale: Locale;
  className?: string;
}

export async function CvReferences({ references, locale, className }: CvReferencesProps) {
  const t = await getTranslations("cv");

  if (references.length === 0) return null;

  return (
    <CvSection id="references" heading={t("references")} className={className}>
      <div className="flex flex-col gap-3 text-sm print:text-[9pt] print:gap-2">
        {references.map((ref) => {
          const relation = ref.relation
            ? resolveCvLocaleString(ref.relation as CvLocaleString, locale)
            : null;

          return (
            <div key={ref.name} className="break-inside-avoid">
              <p className="font-medium text-foreground">{ref.name}</p>
              <p className="text-muted-foreground">
                {ref.position}, {ref.company}
              </p>
              {relation && (
                <p className="text-xs text-muted-foreground italic">{relation}</p>
              )}
              {ref.email && (
                <a
                  href={`mailto:${ref.email}`}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  {ref.email}
                </a>
              )}
              {ref.phone && (
                <a
                  href={`tel:${ref.phone}`}
                  className="text-xs text-muted-foreground hover:underline ms-3"
                >
                  {ref.phone}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </CvSection>
  );
}
