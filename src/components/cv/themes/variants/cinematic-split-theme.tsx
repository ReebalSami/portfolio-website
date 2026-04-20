import Image from "next/image";
import type { CvData } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { getTranslations } from "next-intl/server";
import { Mail, MapPin, Download } from "lucide-react";
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
 * Cinematic Split — 50/50 layout (desktop).
 * Photo stays stickied to the viewport on the left while the content
 * (hero text, CTAs, and the shared CV body) scrolls on the right.
 * On mobile, the photo is a full-bleed cover above the content.
 */
export async function CinematicSplitTheme({
  data,
  locale,
  photoSrc,
  heroTransitionName = "hero-photo-option-6",
}: Props) {
  const t = await getTranslations("cv");
  const r = (s: Parameters<typeof resolveCvLocaleString>[0]) =>
    resolveCvLocaleString(s, locale);
  const resolvedPhoto = photoSrc ?? data.basics.photo;

  return (
    <div className="relative overflow-x-clip">
      <div className="md:grid md:grid-cols-2">
        {/* LEFT: photo */}
        {resolvedPhoto && (
          <div className="relative h-[55vh] md:h-auto md:sticky md:top-0 md:self-start md:h-screen">
            <div
              className="relative h-full w-full overflow-hidden"
              style={{ viewTransitionName: heroTransitionName }}
            >
              <Image
                src={resolvedPhoto}
                alt={data.basics.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover contrast-[1.1] sepia-[0.15] saturate-[0.85]"
              />
              {/* Cinematic top vignette */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, transparent 60%, oklch(0 0 0 / 0.4) 100%), linear-gradient(to bottom, transparent 70%, oklch(0 0 0 / 0.35) 100%)",
                }}
              />
              {/* Film-title tag at top */}
              <span className="absolute top-6 start-6 rounded-full bg-background/80 px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.35em] text-foreground backdrop-blur md:top-8 md:start-8">
                {t("title")}
              </span>
              {/* Name at bottom on mobile only */}
              <div className="absolute inset-x-0 bottom-6 flex justify-center px-6 md:hidden">
                <p className="rounded-full bg-background/85 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-foreground backdrop-blur">
                  {data.basics.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT: scrolling content */}
        <div className="relative min-w-0">
          {/* Hero text */}
          <section className="relative px-6 pt-12 pb-14 md:px-10 md:pt-24 md:pb-20 lg:px-14">
            <div className="max-w-xl">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-gallery-warm mb-5">
                {r(data.basics.title)}
              </p>
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl mb-6">
                {data.basics.name}
              </h1>
              <p className="cv-copy-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
                {r(data.profile.summary)}
              </p>

              {/* CTA */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
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
                  <Download className="h-4 w-4 me-2" />
                  {t("downloadPdf")}
                </Button>
                <a
                  href={`mailto:${data.basics.email}`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {data.basics.email}
                </a>
              </div>

              {/* Location + profiles */}
              <div className="mt-6 flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gallery-warm" />
                  {r(data.basics.location.city)}
                </span>
                {data.basics.profiles.map((p) => {
                  const Icon = networkIcons[p.network];
                  return (
                    <a
                      key={p.network}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${data.basics.name} on ${p.network}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                    </a>
                  );
                })}
              </div>

              {/* Chapter marker */}
              <div className="mt-14 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-gallery-warm/40"
                />
                <span className="text-[0.6rem] font-medium uppercase tracking-[0.35em] text-muted-foreground">
                  Chapter 01 · Story
                </span>
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-gallery-warm/40"
                />
              </div>
            </div>
          </section>

          {/* Body — rendered inside the right column so the sticky photo
               stays visible as the user scrolls through Experience, etc.
               Sidebar stacks below because the column is narrow. */}
          <div className="px-6 md:px-10 lg:px-14">
            <CvBody
              data={data}
              locale={locale}
              showSeparator={false}
              showBackgroundShapes={false}
              sidebarBelow={true}
              maxWidthClass="max-w-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
