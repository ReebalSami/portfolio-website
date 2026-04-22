import Image from "next/image";
import { Fraunces } from "next/font/google";
import type { CvData } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { getTranslations } from "next-intl/server";
import { Mail, MapPin } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/brand-icons";
import { CvBody } from "../shared/cv-body";
import {
  MorphingDownloadCta,
  MorphingDownloadCtaTopSlot,
  MorphingDownloadCtaBottomSlot,
} from "@/components/cv/morphing-download-cta";
import { getPhotoPath } from "@/lib/config";

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
 * Editorial Magazine v2 — print-cover aesthetic, now with a matching body.
 *
 * - Bigger photo (max-w-[460px], aspect 3/4), top-left corner aligned with
 *   the top of the first-name line via items-start + mt-10 on the figure
 *   (which skips past the eyebrow block height so the photo lands flush
 *   with the <h1>'s cap-line).
 * - Warm backdrop orbs hoisted onto the outer wrapper so they bleed from
 *   the hero into the body without a visual seam.
 * - CvBody receives serifHeadings + maxWidthClass="max-w-6xl" so hero and
 *   body share the same container width and both use Fraunces for section
 *   titles, echoing the masthead.
 * - bottomDecoration renders a pull-quote + signature that anchors the
 *   sidebar's bottom line to the main column's bottom line.
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
  // site.yaml `photos.cvPage` is the canonical source for /cv page photos.
  // Preview variants pass their own `photoSrc` to A/B different images.
  const resolvedPhoto = photoSrc ?? getPhotoPath("cvPage");

  // Dynamic issue number = current month, zero-padded. Regenerates on every
  // build so the masthead always reads as "this month's issue". Pure
  // decorative typography — no behavioural impact, no SSR/hydration risk
  // (server and client render at the same build moment for static export).
  const now = new Date();
  const year = now.getFullYear();
  const issueNumber = String(now.getMonth() + 1).padStart(2, "0");
  const issueLabel = `Vol. ${year} · Issue ${issueNumber}`;
  const [firstName, ...restName] = data.basics.name.split(" ");
  const lastName = restName.join(" ") || data.basics.name;

  // Wrap the whole theme tree with the MorphingDownloadCta provider so the
  // `.TopSlot` (inside the hero) and `.BottomSlot` (inside the footer CTA
  // band) can subscribe to shared scroll-derived state. The provider also
  // hosts the FAB itself; no separate <CvDownloadFab /> needed.
  return (
    <MorphingDownloadCta label={t("downloadPdf")}>
    <div className={`relative overflow-x-clip ${editorial.variable}`}>
      {/* Persistent warm backdrop — spans hero + body so the body reads as
          the continuation of the print cover, not a separate surface. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[160vh] overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-16 -end-16 h-[32rem] w-[32rem] rounded-full bg-gallery-warm/15 blur-3xl" />
        <div className="absolute top-1/3 -start-24 h-[26rem] w-[26rem] rounded-full bg-gallery-warm-muted/20 blur-3xl" />
        <div className="absolute top-[75%] end-0 h-96 w-96 rounded-full bg-gallery-warm-light/15 blur-3xl" />
      </div>

      {/* ============== HERO ============== */}
      <section className="relative">
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
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,460px)] md:gap-14 items-start">
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
                <span className="block">{firstName}</span>
                <span className="block italic text-gallery-warm">
                  {lastName}
                </span>
              </h1>
              <p
                className="cv-copy-balance mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
                style={{ fontFamily: "var(--font-editorial)" }}
              >
                {r(data.profile.summary)}
              </p>

              {/* Primary CTA — top slot of the MorphingDownloadCta. The
                  button renders here while the user is at the top of the
                  page; as they scroll past the hero it morphs into the FAB
                  (bottom-right), then into the footer button. One element,
                  three anchor points. Styling (warm bg + magnetic hover)
                  lives inside MorphingDownloadCta for consistency. */}
              <div className="mt-8">
                <MorphingDownloadCtaTopSlot />
              </div>
            </div>

            {/* Right: larger photo, top aligned with first-name line via
                mt-10 to skip past the eyebrow + its margin. */}
            {resolvedPhoto && (
              <figure className="order-1 md:order-2 relative mx-auto md:mx-0 w-full max-w-[280px] md:max-w-none md:mt-10">
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
                    sizes="(max-width: 768px) 70vw, 460px"
                    className="object-cover sepia-[0.08] contrast-[1.08]"
                  />
                  <span
                    className="absolute bottom-3 start-3 rounded-full bg-background/90 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.3em] text-foreground backdrop-blur"
                    style={{ fontFamily: "var(--font-editorial)" }}
                  >
                    Résumé {year}
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

      {/* Running chapter-mark between hero and body — the "turn of the page"
          beat that magazines use before a feature opens. */}
      <div className="relative mx-auto max-w-6xl px-6">
        <div
          className="flex items-center gap-4 text-[0.6rem] font-medium uppercase tracking-[0.4em] text-muted-foreground"
          style={{ fontFamily: "var(--font-editorial)" }}
        >
          <span aria-hidden="true" className="h-px flex-1 bg-foreground/30" />
          <span>Chapter 01 · The Work</span>
          <span aria-hidden="true" className="h-px flex-1 bg-foreground/30" />
        </div>
      </div>

      <CvBody
        data={data}
        locale={locale}
        showSeparator={false}
        showBackgroundShapes={false}
        maxWidthClass="max-w-6xl"
        serifHeadings={true}
        bottomDecoration={
          <div
            className="border-t-2 border-foreground/80 pt-6"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            <p
              className="text-[0.6rem] font-medium uppercase tracking-[0.4em] text-muted-foreground mb-4"
            >
              My motto for this year
            </p>
            <blockquote className="text-lg italic leading-relaxed text-foreground">
              &ldquo;The best AI isn&apos;t the one that dazzles in a demo — it&apos;s the one
              that ships in the next sprint.&rdquo;
            </blockquote>
            <p className="mt-5 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              — {data.basics.name}, {year}
            </p>
          </div>
        }
      />

      {/* End-of-page closing CTA — bottom slot of the MorphingDownloadCta.
          The button lands here once the user has scrolled to the footer.
          The "Take it with you" eyebrow stays visible at all times as a
          reading anchor; the slot only shows the button when active. */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-4 text-center">
          <p
            className="mb-5 text-[0.6rem] font-medium uppercase tracking-[0.4em] text-muted-foreground"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            Take it with you
          </p>
          <MorphingDownloadCtaBottomSlot />
        </div>
      </section>
    </div>
    </MorphingDownloadCta>
  );
}
