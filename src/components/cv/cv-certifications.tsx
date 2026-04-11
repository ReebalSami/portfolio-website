import { getTranslations } from "next-intl/server";
import type { CvCertification } from "@/lib/cv/schema";
import { CvSection } from "./cv-section";

interface CvCertificationsProps {
  certifications: CvCertification[];
  className?: string;
}

export async function CvCertifications({ certifications, className }: CvCertificationsProps) {
  const t = await getTranslations("cv");

  if (certifications.length === 0) return null;

  return (
    <CvSection id="certifications" heading={t("certifications")} className={className}>
      <ul className="flex flex-col gap-2 text-sm print:text-[9pt] print:gap-1">
        {certifications.map((cert) => (
          <li key={`${cert.name}-${cert.date}`} className="break-inside-avoid">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
              <div>
                <span className="font-medium text-foreground">
                  {cert.url ? (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {cert.name}
                    </a>
                  ) : (
                    cert.name
                  )}
                </span>
                <span className="text-muted-foreground ms-1">· {cert.issuer}</span>
              </div>
              <time
                dateTime={cert.date}
                className="text-xs text-muted-foreground whitespace-nowrap print:text-[9pt]"
              >
                {cert.date}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </CvSection>
  );
}
