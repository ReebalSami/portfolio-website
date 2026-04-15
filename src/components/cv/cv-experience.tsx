import { getTranslations } from "next-intl/server";
import type { CvExperience as CvExperienceData, CvLocaleString } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { CvSection } from "./cv-section";

type Locale = "en" | "de" | "es" | "ar";

interface CvExperienceProps {
  experience: CvExperienceData[];
  locale: Locale;
  className?: string;
}

function formatDateRange(
  startDate: string,
  endDate: string | undefined,
  presentLabel: string,
): { display: string; startIso: string; endIso: string | undefined } {
  const formatDate = (d: string) => {
    if (d.length === 4) return d;
    const [year, month] = d.split("-");
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  };

  return {
    display: `${formatDate(startDate)} – ${endDate ? formatDate(endDate) : presentLabel}`,
    startIso: startDate,
    endIso: endDate,
  };
}

export async function CvExperience({ experience, locale, className }: CvExperienceProps) {
  const t = await getTranslations("cv");
  const presentLabel = t("present");

  return (
    <CvSection id="experience" heading={t("experience")} className={className}>
      <div className="flex flex-col gap-4 print:gap-3">
        {experience.map((entry) => {
          const position = resolveCvLocaleString(entry.position as CvLocaleString, locale);
          const description = entry.description
            ? resolveCvLocaleString(entry.description as CvLocaleString, locale)
            : null;
          const dateRange = formatDateRange(entry.startDate, entry.endDate, presentLabel);

          return (
            <article
              key={`${entry.company}-${entry.startDate}`}
              className="cv-entry break-inside-avoid"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                <div>
                  <h3 className="text-sm font-semibold text-foreground print:text-[10pt]">
                    {position}
                  </h3>
                  <p className="text-sm text-muted-foreground print:text-[9pt]">
                    {entry.company}
                    {entry.location && <span className="ms-1">· {entry.location}</span>}
                  </p>
                </div>
                <time
                  dateTime={dateRange.startIso}
                  className="text-xs text-muted-foreground whitespace-nowrap print:text-[9pt]"
                >
                  {dateRange.display}
                </time>
              </div>

              {description && (
                <p className="mt-1 text-sm text-foreground/80 print:text-[9pt]">
                  {description}
                </p>
              )}

              {entry.highlights && entry.highlights.length > 0 && (
                <ul className="mt-1.5 list-disc ps-5 space-y-0.5 text-sm text-foreground/80 print:text-[9pt] print:mt-1">
                  {entry.highlights.map((highlight, hIdx) => {
                    const text = resolveCvLocaleString(highlight as CvLocaleString, locale);
                    return <li key={hIdx}>{text}</li>;
                  })}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </CvSection>
  );
}
