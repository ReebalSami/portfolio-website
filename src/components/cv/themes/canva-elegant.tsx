import Image from "next/image";
import type { CvData } from "@/lib/cv/schema";
import { getTheme } from "@/lib/cv/themes";
import { playfairDisplay } from "@/lib/cv/fonts";
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

interface CanvaElegantProps {
  data: CvData;
  locale: Locale;
  printMode?: boolean;
}

const theme = getTheme("canva-elegant");

export function CanvaElegantTheme({ data, locale, printMode }: CanvaElegantProps) {
  const title = typeof data.basics.title === "string"
    ? data.basics.title
    : (data.basics.title[locale] || data.basics.title.en);

  const nameParts = data.basics.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ");

  return (
    <ThemeWrapper
      theme={theme}
      fontClassName={playfairDisplay.variable}
      printMode={printMode}
    >
      {/* Two-column layout replicating Bewerbung/template exactly */}
      <div className="cv-grid grid grid-cols-1 md:grid-cols-[38%_62%] print:grid-cols-[38%_62%] min-h-screen print:min-h-0">
        {/* === LEFT SIDEBAR — beige background === */}
        <div className="bg-[var(--cv-sidebar-bg)] px-6 py-8 print:px-5 print:py-6 print:bg-[#ede6db]">
          {/* Name — large serif, each word on its own line */}
          <header className="mb-5">
            <h1 style={{ fontFamily: "var(--cv-font-heading)" }}>
              <span className="block text-[2.5rem] font-light leading-tight tracking-tight text-[var(--cv-text)] print:text-[28pt]">
                {firstName}
              </span>
              {lastName && (
                <span className="block text-xl font-normal tracking-[0.3em] uppercase text-[var(--cv-text)] mt-1 print:text-[14pt]">
                  {lastName}
                </span>
              )}
            </h1>
            <p className="mt-2 text-[0.65rem] tracking-[0.35em] uppercase text-[var(--cv-muted)] print:text-[8pt]">
              {title}
            </p>
          </header>

          {/* Photo — rectangular B&W like the Canva template */}
          {data.basics.photo && (
            <div className="mb-6 print:mb-4">
              <div className="relative w-full aspect-[4/5] overflow-hidden">
                <Image
                  src={data.basics.photo}
                  alt={data.basics.name}
                  fill
                  sizes="300px"
                  className="object-cover grayscale"
                  priority
                />
              </div>
            </div>
          )}

          {/* Sidebar sections — compact */}
          <div className="flex flex-col gap-5 print:gap-3">
            <CvContact
              basics={data.basics}
              locale={locale}
              showIcons={true}
              className="cv-sidebar-section [&_h2]:text-[0.6rem] [&_h2]:tracking-[0.35em] [&_h2]:font-normal [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-2 [&_ul]:flex-col [&_ul]:gap-1.5 [&_li]:text-xs"
            />
            <CvSkills
              skills={data.skills}
              locale={locale}
              className="cv-sidebar-section [&_h2]:text-[0.6rem] [&_h2]:tracking-[0.35em] [&_h2]:font-normal [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-2 [&_h3]:text-xs [&_span]:text-xs [&_span]:bg-transparent [&_span]:p-0 [&_span]:font-normal"
            />
            <CvLanguages
              languages={data.languages}
              locale={locale}
              className="cv-sidebar-section [&_h2]:text-[0.6rem] [&_h2]:tracking-[0.35em] [&_h2]:font-normal [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-2 [&_ul]:flex-col [&_ul]:gap-1 [&_li]:text-xs"
            />
            {data.softSkills && (
              <CvSoftSkills
                softSkills={data.softSkills}
                locale={locale}
                className="cv-sidebar-section [&_h2]:text-[0.6rem] [&_h2]:tracking-[0.35em] [&_h2]:font-normal [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-2 [&_li]:text-xs"
              />
            )}
            {data.interests && data.interests.length > 0 && (
              <CvInterests
                interests={data.interests}
                locale={locale}
                className="cv-sidebar-section [&_h2]:text-[0.6rem] [&_h2]:tracking-[0.35em] [&_h2]:font-normal [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-2 [&_li]:text-xs"
              />
            )}
          </div>
        </div>

        {/* === RIGHT MAIN — white background === */}
        <div className="bg-[var(--cv-bg)] px-6 py-8 print:px-5 print:py-6">
          <div className="flex flex-col gap-5 print:gap-3">
            <CvProfile
              profile={data.profile}
              locale={locale}
              className="[&_h2]:text-[0.6rem] [&_h2]:tracking-[0.35em] [&_h2]:font-normal [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-2 [&_p]:text-sm [&_p]:leading-relaxed"
            />
            <CvExperience
              experience={data.experience}
              locale={locale}
              className="[&_h2]:text-[0.6rem] [&_h2]:tracking-[0.35em] [&_h2]:font-normal [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:italic [&_p]:text-xs [&_li]:text-xs"
            />
            <CvEducation
              education={data.education}
              locale={locale}
              className="[&_h2]:text-[0.6rem] [&_h2]:tracking-[0.35em] [&_h2]:font-normal [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:italic [&_p]:text-xs"
            />
            {data.certifications && data.certifications.length > 0 && (
              <CvCertifications
                certifications={data.certifications}
                className="[&_h2]:text-[0.6rem] [&_h2]:tracking-[0.35em] [&_h2]:font-normal [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-2 [&_li]:text-xs"
              />
            )}
            {data.references && data.references.length > 0 && (
              <CvReferences
                references={data.references}
                locale={locale}
                className="[&_h2]:text-[0.6rem] [&_h2]:tracking-[0.35em] [&_h2]:font-normal [&_h2]:border-0 [&_h2]:pb-0 [&_h2]:mb-2 [&_p]:text-xs"
              />
            )}
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
