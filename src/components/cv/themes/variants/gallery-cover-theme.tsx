import Image from "next/image";
import type { CvData } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { getTranslations } from "next-intl/server";
import { Mail, MapPin, Phone, FileText, Printer } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/brand-icons";
import { Button } from "@/components/ui/button";
import { CvBody } from "../shared/cv-body";

type Locale = "en" | "de" | "es" | "ar";

interface Props {
  data: CvData;
  locale: Locale;
  photoSrc?: string;
  heroTransitionName?: string;
}

const networkIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  LinkedIn: LinkedInIcon,
  GitHub: GitHubIcon,
};

/**
 * Gallery Cover — refined, distinctly a CV cover page.
 * Retains the blurred warm orb and the site's visual vocabulary, but
 * announces itself with an eyebrow label, inline download CTAs, and a
 * metadata strip. Photo is kept smaller to give the text + CTAs weight.
 */
export async function GalleryCoverTheme({
  data,
  locale,
  photoSrc,
  heroTransitionName = "hero-photo-option-1",
}: Props) {
  const t = await getTranslations("cv");
  const r = (s: Parameters<typeof resolveCvLocaleString>[0]) =>
    resolveCvLocaleString(s, locale);
  const resolvedPhoto = photoSrc ?? data.basics.photo;
  const firstLanguageNames = data.languages
    .slice(0, 3)
    .map((l) => r(l.language))
    .join(" · ");

  return (
    <div className="relative overflow-x-clip">
      <section className="relative px-4 pt-14 pb-10 sm:px-6 md:pt-20 md:pb-14 overflow-hidden">
        {/* Blurred warm orb — signature */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -top-20 -start-20 h-80 w-80 rounded-full bg-gallery-warm/30 blur-3xl" />
          <div className="absolute top-1/4 end-0 h-64 w-64 rounded-[2rem] bg-gallery-warm-muted/25 rotate-12" />
          <div className="absolute bottom-10 start-1/4 h-48 w-48 rounded-full bg-gallery-warm-light/30" />
        </div>

        <div className="relative mx-auto max-w-5xl grid gap-10 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:gap-14 items-center">
          {/* Compact photo */}
          {resolvedPhoto && (
            <div className="relative mx-auto md:mx-0 w-40 sm:w-48 md:w-full md:max-w-[240px]">
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                aria-hidden="true"
              >
                <div className="absolute -top-3 -start-3 h-20 w-20 rounded-full bg-gallery-warm/30 sm:h-24 sm:w-24 md:h-32 md:w-32" />
                <div className="absolute -bottom-2 -end-2 h-16 w-20 rounded-[1.25rem] bg-gallery-warm-muted/30 rotate-6 sm:h-20 sm:w-24" />
              </div>
              <div
                className="relative overflow-hidden rounded-[2rem]"
                style={{ viewTransitionName: heroTransitionName }}
              >
                <Image
                  src={resolvedPhoto}
                  alt={data.basics.name}
                  width={400}
                  height={500}
                  priority
                  sizes="(max-width: 768px) 40vw, 240px"
                  className="h-auto w-full object-cover grayscale contrast-[1.1]"
                />
              </div>
            </div>
          )}

          {/* Text + CTAs */}
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="h-px w-10 bg-gallery-warm"
                aria-hidden="true"
              />
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.35em] text-gallery-warm">
                {t("title")}
              </p>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-2">
              {data.basics.name}
            </h1>
            <p className="text-base font-medium uppercase tracking-[0.2em] text-muted-foreground mb-5">
              {r(data.basics.title)}
            </p>
            <p className="cv-copy-balance text-sm text-muted-foreground leading-relaxed sm:text-base max-w-xl">
              {r(data.profile.summary)}
            </p>

            {/* Download CTAs */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                size="default"
                className="cursor-pointer"
                nativeButton={false}
                render={
                  <a
                    href="/cv/visual/resume_reebal_sami.pdf"
                    download
                    data-plausible-event="cv:download"
                    data-plausible-event-theme="visual"
                  />
                }
              >
                <FileText className="h-4 w-4 me-2" />
                {t("downloadPdf")}
              </Button>
              <Button
                size="default"
                variant="outline"
                className="cursor-pointer"
                nativeButton={false}
                render={
                  <a
                    href="/cv/ats/resume_reebal_sami.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-plausible-event="cv:print"
                  />
                }
              >
                <Printer className="h-4 w-4 me-2" />
                {t("printVersion")}
              </Button>
            </div>
          </div>
        </div>

        {/* Metadata strip — below hero, full-width */}
        <div className="relative mx-auto max-w-5xl mt-10 md:mt-14">
          <div className="flex flex-wrap items-center justify-start gap-x-6 gap-y-3 border-t border-gallery-warm/30 pt-5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gallery-warm" />
              {r(data.basics.location.city)}, {r(data.basics.location.country)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-gallery-warm" />
              <a
                href={`mailto:${data.basics.email}`}
                className="hover:text-foreground transition-colors"
              >
                {data.basics.email}
              </a>
            </span>
            {data.basics.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-gallery-warm" />
                <a
                  href={`tel:${data.basics.phone}`}
                  className="hover:text-foreground transition-colors"
                >
                  {data.basics.phone}
                </a>
              </span>
            )}
            {firstLanguageNames && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-gallery-warm"
                  aria-hidden="true"
                />
                {firstLanguageNames}
              </span>
            )}
            <span className="inline-flex items-center gap-2 ms-auto">
              {data.basics.profiles.map((p) => {
                const Icon = networkIcons[p.network];
                return (
                  <a
                    key={p.network}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                    aria-label={`${data.basics.name} on ${p.network}`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                  </a>
                );
              })}
            </span>
          </div>
        </div>
      </section>

      <CvBody data={data} locale={locale} />
    </div>
  );
}
