import Image from "next/image";
import type { CvData } from "@/lib/cv/schema";
import { getTheme } from "@/lib/cv/themes";
import { fraunces, dmSans } from "@/lib/cv/fonts";
import { ThemeWrapper } from "./theme-wrapper";
import {
  CvContact,
  CvProfile,
  CvExperience,
  CvEducation,
  CvSkills,
  CvLanguages,
  CvCertifications,
  CvSoftSkills,
  CvInterests,
  CvReferences,
} from "@/components/cv";

type Locale = "en" | "de" | "es" | "ar";

interface SoulfulProps {
  data: CvData;
  locale: Locale;
  printMode?: boolean;
}

const theme = getTheme("soulful");

export function SoulfulTheme({ data, locale, printMode }: SoulfulProps) {
  const title = typeof data.basics.title === "string"
    ? data.basics.title
    : (data.basics.title[locale] || data.basics.title.en);

  return (
    <ThemeWrapper
      theme={theme}
      fontClassName={`${fraunces.variable} ${dmSans.variable}`}
      printMode={printMode}
    >
      {/* Two-column layout — golden ratio sidebar */}
      <div className="cv-grid grid grid-cols-1 md:grid-cols-[38%_62%] print:grid-cols-[38%_62%] min-h-screen print:min-h-0">
        {/* === LEFT SIDEBAR — cream with subtle texture === */}
        <div className="relative bg-[var(--cv-sidebar-bg)] px-5 py-6 print:px-4 print:py-5">
          {/* Paper texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none print:hidden"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
            aria-hidden="true"
          />

          <div className="relative">
            {/* Photo — oval */}
            {data.basics.photo && (
              <div className="mb-4 flex justify-center print:mb-3">
                <div className="relative w-28 h-36 overflow-hidden rounded-[50%] print:w-24 print:h-30">
                  <Image
                    src={data.basics.photo}
                    alt={data.basics.name}
                    fill
                    sizes="120px"
                    className="object-cover grayscale"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Name + Title */}
            <div className="text-center mb-4 print:mb-3">
              <h1
                className="text-xl font-medium text-[var(--cv-heading)] print:text-[16pt]"
                style={{ fontFamily: "var(--cv-font-heading)" }}
              >
                {data.basics.name}
              </h1>
              <p className="mt-0.5 text-xs text-[var(--cv-muted)] print:text-[9pt]">
                {title}
              </p>
              <div
                className="mx-auto mt-2 h-0.5 w-10 print:hidden"
                style={{ backgroundColor: "var(--cv-accent)" }}
                aria-hidden="true"
              />
            </div>

            {/* Sidebar sections — compact */}
            <div className="flex flex-col gap-4 print:gap-3">
              <CvContact
                basics={data.basics}
                locale={locale}
                showIcons={true}
                className="cv-sidebar-section [&_h2]:text-xs [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-1.5 [&_ul]:flex-col [&_ul]:gap-1 [&_li]:text-xs"
              />
              <CvSkills
                skills={data.skills}
                locale={locale}
                className="cv-sidebar-section [&_h2]:text-xs [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-1.5 [&_h3]:text-xs [&_span]:text-xs"
              />
              <CvLanguages
                languages={data.languages}
                locale={locale}
                className="cv-sidebar-section [&_h2]:text-xs [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-1.5 [&_ul]:flex-col [&_ul]:gap-0.5 [&_li]:text-xs"
              />
              {data.softSkills && (
                <CvSoftSkills
                  softSkills={data.softSkills}
                  locale={locale}
                  className="cv-sidebar-section [&_h2]:text-xs [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-1.5 [&_li]:text-xs"
                />
              )}
              {data.interests && data.interests.length > 0 && (
                <CvInterests
                  interests={data.interests}
                  locale={locale}
                  className="cv-sidebar-section [&_h2]:text-xs [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-1.5 [&_li]:text-xs"
                />
              )}
            </div>
          </div>
        </div>

        {/* === RIGHT MAIN === */}
        <div className="bg-[var(--cv-bg)] px-5 py-6 print:px-4 print:py-5">
          <div className="flex flex-col gap-4 print:gap-3">
            <CvProfile
              profile={data.profile}
              locale={locale}
              className="[&_h2]:text-sm [&_h2]:border-b [&_h2]:border-[var(--cv-accent)]/30 [&_p]:text-sm [&_p]:leading-relaxed"
            />
            <CvExperience
              experience={data.experience}
              locale={locale}
              className="[&_h2]:text-sm [&_h2]:border-b [&_h2]:border-[var(--cv-accent)]/30 [&_p]:text-xs [&_li]:text-xs"
            />
            <CvEducation
              education={data.education}
              locale={locale}
              className="[&_h2]:text-sm [&_h2]:border-b [&_h2]:border-[var(--cv-accent)]/30 [&_p]:text-xs"
            />
            {data.certifications && data.certifications.length > 0 && (
              <CvCertifications
                certifications={data.certifications}
                className="[&_h2]:text-sm [&_h2]:border-b [&_h2]:border-[var(--cv-accent)]/30 [&_li]:text-xs"
              />
            )}
            {data.references && data.references.length > 0 && (
              <CvReferences
                references={data.references}
                locale={locale}
                className="[&_h2]:text-sm [&_h2]:border-b [&_h2]:border-[var(--cv-accent)]/30 [&_p]:text-xs"
              />
            )}
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
