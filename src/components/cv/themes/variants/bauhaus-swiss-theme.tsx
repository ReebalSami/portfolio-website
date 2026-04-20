import Image from "next/image";
import type { CvData } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { getTranslations } from "next-intl/server";
import { CvBody } from "../shared/cv-body";

type Locale = "en" | "de" | "es" | "ar";

interface Props {
  data: CvData;
  locale: Locale;
  photoSrc?: string;
  heroTransitionName?: string;
}

/**
 * Bauhaus Swiss — strict 12-column grid with numbered metadata index,
 * uppercase micro-type, and intentional geometric warm blocks.
 * Restrained, precise, typographically confident.
 */
export async function BauhausSwissTheme({
  data,
  locale,
  photoSrc,
  heroTransitionName = "hero-photo-option-3",
}: Props) {
  const t = await getTranslations("cv");
  const r = (s: Parameters<typeof resolveCvLocaleString>[0]) =>
    resolveCvLocaleString(s, locale);
  const resolvedPhoto = photoSrc ?? data.basics.photo;

  const languageSummary = data.languages
    .slice(0, 4)
    .map((l) => r(l.language))
    .join(" · ");

  const primaryStack =
    data.skills?.[0]?.skills
      ?.slice(0, 4)
      ?.map((s) => s.name)
      ?.join(" · ") ?? "";

  const indexItems = [
    { n: "01", label: "Location", value: `${r(data.basics.location.city)}, ${r(data.basics.location.country)}` },
    { n: "02", label: "Languages", value: languageSummary },
    { n: "03", label: "Availability", value: "Immediate · Hybrid / Remote" },
    { n: "04", label: "Contact", value: data.basics.email },
    { n: "05", label: "Stack", value: primaryStack },
    {
      n: "06",
      label: "Profiles",
      value: data.basics.profiles.map((p) => p.username || p.network).join(" · "),
    },
  ];

  return (
    <div className="relative overflow-x-clip bg-background">
      <section className="relative">
        {/* Top rule + column numbers */}
        <div className="mx-auto max-w-6xl px-6 pt-10 md:pt-14">
          <div className="flex items-center justify-between gap-4 border-b border-foreground/80 pb-3 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
            <span>{t("title")}</span>
            <span>Reebal-Sami.com</span>
          </div>

          {/* Column numbers ruler — subtle */}
          <div className="hidden md:grid grid-cols-12 mt-3 border-b border-dashed border-border pb-2 font-mono text-[0.6rem] text-muted-foreground/60">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>

        {/* Main hero grid */}
        <div className="mx-auto max-w-6xl px-6 pt-10 pb-14 md:pt-16 md:pb-20">
          <div className="grid gap-10 md:grid-cols-12 md:gap-8">
            {/* Warm block (decorative) — col 1-2 */}
            <div
              aria-hidden="true"
              className="hidden md:block md:col-span-2 h-32 bg-gallery-warm/85 rounded-sm"
            />

            {/* Name + title — col 3-8 */}
            <div className="md:col-span-6 min-w-0">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground mb-3">
                Designed for clarity
              </p>
              <h1 className="text-5xl font-bold leading-[0.95] tracking-[-0.02em] sm:text-6xl md:text-[5.5rem] lg:text-[6.5rem]">
                {data.basics.name}
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 rounded-full bg-gallery-warm"
                />
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground">
                  {r(data.basics.title)}
                </p>
              </div>
            </div>

            {/* Photo — col 9-12, portrait */}
            {resolvedPhoto && (
              <div className="md:col-span-4 relative">
                <div
                  className="relative overflow-hidden rounded-sm bg-muted ring-1 ring-foreground/10"
                  style={{
                    aspectRatio: "4 / 5",
                    viewTransitionName: heroTransitionName,
                  }}
                >
                  <Image
                    src={resolvedPhoto}
                    alt={data.basics.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-cover contrast-[1.15] grayscale-[0.4]"
                  />
                  {/* Warm block overlay at corner */}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-2 -end-2 h-10 w-10 bg-gallery-warm"
                  />
                </div>
              </div>
            )}

            {/* Summary — col 3-10 */}
            <div className="md:col-span-10 md:col-start-3 md:mt-2">
              <p className="cv-copy-balance max-w-2xl text-base leading-relaxed text-foreground/85 sm:text-lg">
                {r(data.profile.summary)}
              </p>
            </div>
          </div>
        </div>

        {/* Numbered metadata index */}
        <div className="mx-auto max-w-6xl px-6 pb-16 md:pb-24">
          <div className="border-t border-foreground/80 pt-6">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground mb-6">
              Index ·{" "}
              <span className="text-foreground">01 → {String(indexItems.length).padStart(2, "0")}</span>
            </p>
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 md:grid-cols-3">
              {indexItems.map((item) => (
                <div
                  key={item.n}
                  className="flex items-start gap-3 border-s-2 border-gallery-warm ps-4"
                >
                  <span className="font-mono text-xs font-medium text-gallery-warm">
                    {item.n}
                  </span>
                  <div className="min-w-0 flex-1">
                    <dt className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground mb-0.5">
                      {item.label}
                    </dt>
                    <dd className="text-sm font-medium text-foreground truncate">
                      {item.value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <CvBody data={data} locale={locale} showSeparator={false} showBackgroundShapes={false} />
    </div>
  );
}
