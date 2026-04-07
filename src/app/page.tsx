import { SectionHeading } from "@/components/shared/section-heading";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getConfig } from "@/lib/config";

export default function Home() {
  const config = getConfig();
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
          <SectionHeading title="Blog" subtitle="Thoughts & Tutorials" />
          <p className="text-muted-foreground">
            Technical articles coming soon — AI/ML, data engineering, and career transition insights.
          </p>
        </div>
      </section>

      <Separator />

      <section id="contact" className="scroll-mt-20 px-6 py-20 md:py-28 bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <SectionHeading title="Contact" subtitle="Get In Touch" />
          <p className="text-muted-foreground mb-6">
            Interested in working together? Reach out via email or connect on LinkedIn.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg">Send Email</Button>
            <Button variant="outline" size="lg">LinkedIn</Button>
          </div>
        </div>
      </section>
    </>
  );
}
