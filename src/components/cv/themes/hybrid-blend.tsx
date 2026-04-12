import Image from "next/image";
import type { CvData } from "@/lib/cv/schema";
import { getTheme } from "@/lib/cv/themes";
import { ThemeWrapper } from "./theme-wrapper";
import {
  CvHeader,
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

interface HybridBlendProps {
  data: CvData;
  locale: Locale;
  printMode?: boolean;
}

const theme = getTheme("hybrid-blend");

export function HybridBlendTheme({ data, locale, printMode }: HybridBlendProps) {
  return (
    <ThemeWrapper theme={theme} printMode={printMode}>
      {/* Two-column: warm sidebar + modern main */}
      <div className="cv-grid grid grid-cols-1 md:grid-cols-[38%_62%] print:grid-cols-[38%_62%] min-h-screen print:min-h-0">
        {/* === LEFT SIDEBAR — warm tones, card grouping === */}
        <div className="bg-[var(--cv-sidebar-bg)] px-5 py-6 print:px-4 print:py-5">
          {/* Photo + Name */}
          {data.basics.photo && (
            <div className="mb-4 flex justify-center print:mb-3">
              <div className="relative w-28 h-28 overflow-hidden rounded-xl shadow-md print:w-24 print:h-24">
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

          <CvHeader
            basics={data.basics}
            locale={locale}
            showPhoto={false}
            className="mb-4 print:mb-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-center [&_p]:text-center [&_p]:text-xs"
          />

          {/* Sidebar sections */}
          <div className="flex flex-col gap-4 print:gap-3">
            <CvContact
              basics={data.basics}
              locale={locale}
              showIcons={true}
              className="cv-sidebar-section [&_h2]:text-xs [&_h2]:tracking-[0.15em] [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-1.5 [&_ul]:flex-col [&_ul]:gap-1 [&_li]:text-xs"
            />
            <CvSkills
              skills={data.skills}
              locale={locale}
              className="cv-sidebar-section [&_h2]:text-xs [&_h2]:tracking-[0.15em] [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-1.5 [&_h3]:text-xs [&_span]:text-xs [&_span]:bg-[var(--cv-bg)] [&_span]:shadow-sm"
            />
            <CvLanguages
              languages={data.languages}
              locale={locale}
              className="cv-sidebar-section [&_h2]:text-xs [&_h2]:tracking-[0.15em] [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-1.5 [&_ul]:flex-col [&_ul]:gap-0.5 [&_li]:text-xs"
            />
            {data.softSkills && (
              <CvSoftSkills
                softSkills={data.softSkills}
                locale={locale}
                className="cv-sidebar-section [&_h2]:text-xs [&_h2]:tracking-[0.15em] [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-1.5 [&_li]:text-xs"
              />
            )}
            {data.interests && data.interests.length > 0 && (
              <CvInterests
                interests={data.interests}
                locale={locale}
                className="cv-sidebar-section [&_h2]:text-xs [&_h2]:tracking-[0.15em] [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-1.5 [&_li]:text-xs"
              />
            )}
          </div>
        </div>

        {/* === RIGHT MAIN — modern typography === */}
        <div className="bg-[var(--cv-bg)] px-5 py-6 print:px-4 print:py-5">
          <div className="flex flex-col gap-4 print:gap-3">
            <CvProfile
              profile={data.profile}
              locale={locale}
              className="[&_h2]:text-xs [&_h2]:tracking-[0.15em] [&_p]:text-sm [&_p]:leading-relaxed"
            />
            <CvExperience
              experience={data.experience}
              locale={locale}
              className="[&_h2]:text-xs [&_h2]:tracking-[0.15em] [&_p]:text-xs [&_li]:text-xs"
            />
            <CvEducation
              education={data.education}
              locale={locale}
              className="[&_h2]:text-xs [&_h2]:tracking-[0.15em] [&_p]:text-xs"
            />
            {data.certifications && data.certifications.length > 0 && (
              <CvCertifications
                certifications={data.certifications}
                className="[&_h2]:text-xs [&_h2]:tracking-[0.15em] [&_li]:text-xs"
              />
            )}
            {data.references && data.references.length > 0 && (
              <CvReferences
                references={data.references}
                locale={locale}
                className="[&_h2]:text-xs [&_h2]:tracking-[0.15em] [&_p]:text-xs"
              />
            )}
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
