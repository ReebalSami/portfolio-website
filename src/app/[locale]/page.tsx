import { setRequestLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/shared/section-heading";
import { AnimatedSection } from "@/components/shared/animated-section";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ContactSection } from "@/components/sections/contact-section";
import { BlogCard } from "@/components/cards/blog-card";
import { Separator } from "@/components/ui/separator";
import { JsonLd } from "@/components/seo/json-ld";
import { getConfig } from "@/lib/config";
import { getAllPosts } from "@/lib/mdx";
import { buildAbsoluteUrl } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const config = getConfig();
  const t = await getTranslations("blog");
  const photoPath = `${config.photos.heroDir}/${config.photos.hero}`;
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: config.site.name,
    alternateName: config.site.title,
    jobTitle: config.site.title,
    description: config.site.description,
    url: config.site.url,
    image: buildAbsoluteUrl(photoPath),
    email: `mailto:${config.contact.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: config.contact.location,
    },
    sameAs: Object.values(config.social).filter(Boolean),
  };

  return (
    <>
      <JsonLd id="person-structured-data" data={personJsonLd} />
      <section id="home" className="scroll-mt-20">
        <AnimatedSection direction="none">
          <HeroSection
            name={config.site.name}
            title={config.site.title}
            tagline={config.site.tagline}
            photoSrc={photoPath}
          />
        </AnimatedSection>
      </section>

      <Separator />

      <section id="about" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-28">
        <AnimatedSection className="mx-auto max-w-4xl">
          <AboutSection downloadCvEnabled={config.features.downloadCV} />
        </AnimatedSection>
      </section>

      <Separator />

      <section id="projects" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-28 bg-muted/30">
        <AnimatedSection className="mx-auto max-w-5xl" direction="up">
          <ProjectsSection />
        </AnimatedSection>
      </section>

      <Separator />

      <section id="blog" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-28">
        <AnimatedSection className="mx-auto max-w-4xl" direction="up">
          <SectionHeading title={t("title")} subtitle={t("subtitle")} />
          {(() => {
            const posts = getAllPosts(locale);
            if (posts.length === 0) {
              return (
                <p className="text-muted-foreground">
                  {t("empty")}
                </p>
              );
            }
            return (
              <div className="grid gap-6 sm:grid-cols-2">
                {posts.slice(0, 4).map((post) => (
                  <BlogCard key={post.slug} post={post} locale={locale} />
                ))}
              </div>
            );
          })()}
        </AnimatedSection>
      </section>

      <Separator />

      <section id="contact" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-28 bg-muted/30">
        <AnimatedSection className="mx-auto max-w-4xl" direction="up">
          <ContactSection
            email={config.contact.email}
            location={config.contact.location}
            social={config.social}
          />
        </AnimatedSection>
      </section>
    </>
  );
}
