import { setRequestLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/shared/section-heading";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ContactSection } from "@/components/sections/contact-section";
import { BlogCard } from "@/components/cards/blog-card";
import { Separator } from "@/components/ui/separator";
import { getConfig } from "@/lib/config";
import { getAllPosts } from "@/lib/mdx";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const config = getConfig();
  const t = await getTranslations("blog");
  const photoPath = `${config.photos.heroDir}/${config.photos.hero}`;

  return (
    <>
      <section id="home" className="scroll-mt-20">
        <HeroSection
          name={config.site.name}
          title={config.site.title}
          tagline={config.site.tagline}
          photoSrc={photoPath}
        />
      </section>

      <Separator />

      <section id="about" className="scroll-mt-20 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <AboutSection downloadCvEnabled={config.features.downloadCV} />
        </div>
      </section>

      <Separator />

      <section id="projects" className="scroll-mt-20 px-6 py-20 md:py-28 bg-muted/30">
        <div className="mx-auto max-w-5xl">
          <ProjectsSection />
        </div>
      </section>

      <Separator />

      <section id="blog" className="scroll-mt-20 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
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
        </div>
      </section>

      <Separator />

      <section id="contact" className="scroll-mt-20 px-6 py-20 md:py-28 bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <ContactSection
            email={config.contact.email}
            location={config.contact.location}
            social={config.social}
          />
        </div>
      </section>
    </>
  );
}
