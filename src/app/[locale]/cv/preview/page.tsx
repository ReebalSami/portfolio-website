import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { routing } from "@/i18n/routing";
import {
  cvPreviewVariants,
  type CvPreviewVariant,
} from "@/components/cv/preview/variants";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "CV Hero — Preview",
  description: "Internal preview of CV hero variants. Not linked publicly.",
  robots: { index: false, follow: false },
};

interface VariantCard extends Pick<CvPreviewVariant, "name" | "tagline" | "photoSrc" | "accent"> {
  href: string;
  badge?: string;
  id: string;
}

export default async function CvPreviewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const canonical: VariantCard = {
    id: "canonical",
    name: "Canonical (current)",
    tagline:
      "The live /cv page as it ships today. Baseline to compare against — shared-element morph is wired up from the homepage already.",
    photoSrc: "/images/hero/start-photo.JPG",
    accent: "from-gallery-warm/40 via-gallery-warm-muted/30 to-transparent",
    href: `/${locale}/cv`,
    badge: "Canonical",
  };

  const cards: VariantCard[] = [
    canonical,
    ...cvPreviewVariants.map((v) => ({
      id: v.id,
      name: v.name,
      tagline: v.tagline,
      photoSrc: v.photoSrc,
      accent: v.accent,
      href: `/${locale}/cv/${v.id}`,
    })),
  ];

  return (
    <div className="relative overflow-x-clip">
      <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        {/* Decorative shapes — keep the site's visual voice */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -top-24 -start-24 h-80 w-80 rounded-full bg-gallery-warm/20 blur-3xl" />
          <div className="absolute top-1/3 end-0 h-64 w-64 rounded-[2rem] bg-gallery-warm-muted/20 rotate-12" />
        </div>

        {/* Heading */}
        <div className="mb-12 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-gallery-warm" />
            Internal preview · noindex
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Pick your CV hero
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Six variants side by side, plus the current canonical page. Click any
            card to see it live, scroll it, navigate between home and the variant
            to feel the shared-element photo morph. When you&apos;ve picked one,
            tell me and I&apos;ll wire it as the canonical <code>/cv</code> and
            remove the rest.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gallery-warm"
            >
              {/* Photo preview with accent gradient */}
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.accent}`}
                  aria-hidden="true"
                />
                <Image
                  src={card.photoSrc}
                  alt={`${card.name} photo preview`}
                  width={400}
                  height={500}
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                  className="h-full w-full object-cover object-center grayscale contrast-[1.05] transition-transform duration-500 group-hover:scale-[1.03]"
                />
                {card.badge && (
                  <span className="absolute end-3 top-3 rounded-full bg-foreground/90 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-widest text-background backdrop-blur">
                    {card.badge}
                  </span>
                )}
              </div>

              {/* Text */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-medium leading-snug tracking-tight">
                    {card.name}
                  </h2>
                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 text-muted-foreground transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {card.tagline}
                </p>
                <span className="mt-auto text-xs font-medium text-muted-foreground">
                  {card.href.replace(`/${locale}`, "") || "/"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
