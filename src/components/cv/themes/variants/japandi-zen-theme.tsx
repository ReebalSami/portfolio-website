import Image from "next/image";
import { Fraunces } from "next/font/google";
import type { CvData } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { getTranslations } from "next-intl/server";
import { ArrowDown, Download } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/brand-icons";
import { CvBody } from "../shared/cv-body";

type Locale = "en" | "de" | "es" | "ar";

interface Props {
  data: CvData;
  locale: Locale;
  photoSrc?: string;
  heroTransitionName?: string;
}

const zen = Fraunces({
  variable: "--font-zen",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const networkIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  LinkedIn: LinkedInIcon,
  GitHub: GitHubIcon,
};

/**
 * Japandi Zen — ultra-minimal. Circular portrait, a breath of whitespace,
 * a serif name, and a single download CTA. Less is more.
 */
export async function JapandiZenTheme({
  data,
  locale,
  photoSrc,
  heroTransitionName = "hero-photo-option-5",
}: Props) {
  const t = await getTranslations("cv");
  const r = (s: Parameters<typeof resolveCvLocaleString>[0]) =>
    resolveCvLocaleString(s, locale);
  const resolvedPhoto = photoSrc ?? data.basics.photo;

  return (
    <div className={`relative overflow-x-clip ${zen.variable}`}>
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 py-20 md:py-28">
        {/* Circular photo */}
        {resolvedPhoto && (
          <div
            className="relative mb-10 h-32 w-32 overflow-hidden rounded-full ring-1 ring-gallery-warm/40 ring-offset-[6px] ring-offset-background md:h-40 md:w-40"
            style={{ viewTransitionName: heroTransitionName }}
          >
            <Image
              src={resolvedPhoto}
              alt={data.basics.name}
              fill
              priority
              sizes="160px"
              className="object-cover grayscale-[0.6] contrast-[1.05]"
            />
          </div>
        )}

        {/* Name + tagline */}
        <h1
          className="text-center text-4xl font-light leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--font-zen)", fontWeight: 300 }}
        >
          {data.basics.name}
        </h1>
        <p
          className="mt-5 max-w-xl text-center text-base italic leading-relaxed text-muted-foreground sm:text-lg md:text-xl"
          style={{ fontFamily: "var(--font-zen)", fontWeight: 400 }}
        >
          {r(data.basics.title)}
        </p>

        {/* Hairline separator */}
        <div
          className="my-10 h-px w-12 bg-gallery-warm"
          aria-hidden="true"
        />

        {/* One-line summary (trimmed) */}
        <p
          className="max-w-xl text-center text-sm leading-[1.85] text-foreground/80 sm:text-base"
          style={{ fontFamily: "var(--font-zen)" }}
        >
          {r(data.profile.summary)}
        </p>

        {/* Single CTA + profiles */}
        <div className="mt-12 flex items-center gap-6">
          <a
            href="/cv/visual/resume_reebal_sami.pdf"
            download
            data-plausible-event="cv:download"
            data-plausible-event-theme="visual"
            className="group inline-flex items-center gap-2 border-b border-gallery-warm pb-0.5 text-sm font-medium text-foreground transition-all hover:gap-3 hover:border-foreground"
            style={{ fontFamily: "var(--font-zen)" }}
          >
            <Download className="h-3.5 w-3.5 text-gallery-warm transition-colors group-hover:text-foreground" />
            {t("downloadPdf")}
          </a>
          {data.basics.profiles.slice(0, 2).map((p) => {
            const Icon = networkIcons[p.network];
            return (
              <a
                key={p.network}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${data.basics.name} on ${p.network}`}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {Icon && <Icon className="h-4 w-4" />}
              </a>
            );
          })}
        </div>

        {/* Gentle "scroll" cue */}
        <div className="mt-24 flex flex-col items-center gap-2 text-muted-foreground/60">
          <span
            className="text-[0.65rem] uppercase tracking-[0.35em]"
            style={{ fontFamily: "var(--font-zen)" }}
          >
            Story below
          </span>
          <ArrowDown className="h-3.5 w-3.5" />
        </div>
      </section>

      <CvBody data={data} locale={locale} showBackgroundShapes={false} />
    </div>
  );
}
