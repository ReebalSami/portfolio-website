import Image from "next/image";
import { Fraunces } from "next/font/google";
import type { CvData } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { getTranslations } from "next-intl/server";
import { Mail, MapPin } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/brand-icons";
import { CvBody } from "../shared/cv-body";

type Locale = "en" | "de" | "es" | "ar";

interface Props {
  data: CvData;
  locale: Locale;
  photoSrc?: string;
  heroTransitionName?: string;
}

const editorial = Fraunces({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
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
 * Editorial Magazine — print-cover aesthetic.
 * Big Fraunces display name, issue-style metadata band, option-1 photo
 * cropped as a focal block. Reads like a trade magazine feature cover.
 */
export async function EditorialMagazineTheme({
  data,
  locale,
  photoSrc,
  heroTransitionName = "hero-photo-option-2",
}: Props) {
  const t = await getTranslations("cv");
  const r = (s: Parameters<typeof resolveCvLocaleString>[0]) =>
    resolveCvLocaleString(s, locale);
  const resolvedPhoto = photoSrc ?? data.basics.photo;

  const year = new Date().getFullYear();
  const issueLabel = `Vol. ${year} · Issue 01`;

  return (
    <div className={`relative overflow-x-clip ${editorial.variable}`}>
      <section className="relative overflow-hidden">
        {/* Subtle warm backdrop */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="absolute -top-16 -end-16 h-96 w-96 rounded-full bg-gallery-warm/15 blur-3xl" />
          <div className="absolute bottom-0 start-0 h-80 w-80 rounded-full bg-gallery-warm-muted/20 blur-3xl" />
        </div>

        {/* Top masthead bar */}
        <div className="relative mx-auto max-w-6xl px-6 pt-10 pb-6 md:pt-14 md:pb-8">
          <div className="flex items-center justify-between gap-4 border-b-2 border-foreground/80 pb-3">
            <span
              className="text-[0.65rem] font-medium uppercase tracking-[0.4em] text-foreground"
              style={{ fontFamily: "var(--font-editorial)" }}
            >
              {t("title")}
            </span>
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-muted-foreground">
              {issueLabel}
            </span>
          </div>
        </div>

        {/* Hero content grid */}
        <div className="relative mx-auto max-w-6xl px-6 pb-16 md:pb-24">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,340px)] md:gap-14 items-end">
            {/* Left: masthead name + strap */}
            <div className="min-w-0 order-2 md:order-1">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-gallery-warm mb-5">
                {r(data.basics.title)}
              </p>
              <h1
                className="cv-editorial-masthead text-[3.25rem] leading-[0.9] tracking-tight text-foreground sm:text-[4.5rem] md:text-[6.25rem] lg:text-[7.5rem]"
                style={{
                  fontFamily: "var(--font-editorial)",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                <span className="block">{data.basics.name.split(" ")[0]}</span>
                <span className="block italic text-gallery-warm">
                  {data.basics.name.split(" ").slice(1).join(" ") ||
                    data.basics.name}
                </span>
              </h1>
              <p
                className="cv-copy-balance mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
                style={{ fontFamily: "var(--font-editorial)" }}
              >
                {r(data.profile.summary)}
              </p>
            </div>

            {/* Right: photo as a focal block with a caption ribbon */}
            {resolvedPhoto && (
              <figure className="order-1 md:order-2 relative mx-auto md:mx-0 w-full max-w-[280px] md:max-w-none">
                <div
                  className="relative overflow-hidden rounded-md bg-muted shadow-2xl shadow-black/10 ring-1 ring-foreground/5"
                  style={{
                    aspectRatio: "3 / 4",
                    viewTransitionName: heroTransitionName,
                  }}
                >
                  <Image
                    src={resolvedPhoto}
                    alt={data.basics.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 70vw, 340px"
                    className="object-cover sepia-[0.08] contrast-[1.08]"
                  />
                  {/* Corner mark */}
                  <span
                    className="absolute bottom-3 start-3 rounded-full bg-background/90 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.3em] text-foreground backdrop-blur"
                    style={{ fontFamily: "var(--font-editorial)" }}
                  >
                    Featured
                  </span>
                </div>
                <figcaption
                  className="mt-3 text-xs leading-relaxed text-muted-foreground"
                  style={{ fontFamily: "var(--font-editorial)" }}
                >
                  <span className="font-medium text-foreground">
                    {data.basics.name}
                  </span>{" "}
                  —{" "}
                  <span className="italic">
                    {r(data.basics.location.city)},{" "}
                    {r(data.basics.location.country)}
                  </span>
                </figcaption>
              </figure>
            )}
          </div>

          {/* Bottom horizontal rule + metadata strip */}
          <div className="mt-12 border-t-2 border-foreground/80 pt-4 md:mt-16">
            <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <dt className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-muted-foreground mb-1">
                  Location
                </dt>
                <dd className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <MapPin className="h-3.5 w-3.5 text-gallery-warm" />
                  {r(data.basics.location.city)}
                </dd>
              </div>
              <div>
                <dt className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-muted-foreground mb-1">
                  Correspondence
                </dt>
                <dd>
                  <a
                    href={`mailto:${data.basics.email}`}
                    className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-gallery-warm transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {data.basics.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-muted-foreground mb-1">
                  Languages
                </dt>
                <dd className="font-medium text-foreground">
                  {data.languages
                    .slice(0, 3)
                    .map((l) => r(l.language))
                    .join(" · ")}
                </dd>
              </div>
              <div>
                <dt className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-muted-foreground mb-1">
                  Elsewhere
                </dt>
                <dd className="flex items-center gap-3">
                  {data.basics.profiles.map((p) => {
                    const Icon = networkIcons[p.network];
                    return (
                      <a
                        key={p.network}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${data.basics.name} on ${p.network}`}
                        className="text-foreground hover:text-gallery-warm transition-colors"
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                      </a>
                    );
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <CvBody data={data} locale={locale} />
    </div>
  );
}
