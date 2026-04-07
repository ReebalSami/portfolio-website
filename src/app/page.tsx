import { SectionHeading } from "@/components/shared/section-heading";
import { TechBadge } from "@/components/shared/tech-badge";
import { HeroSection } from "@/components/sections/hero-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          <SectionHeading title="About" subtitle="Who I Am" />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Data Scientist and AI Engineer merging 5 years of corporate finance
                experience with cutting-edge AI/ML skills. M.Sc. candidate in DS&AI
                at FH Wedel.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Proven end-to-end delivery — multi-agent B2B sales pipeline that
                reduced manual workload by 53%.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                <TechBadge name="Python" category="language" />
                <TechBadge name="TypeScript" category="language" />
                <TechBadge name="PyTorch" category="ai" />
                <TechBadge name="Next.js" category="framework" />
                <TechBadge name="AWS" category="cloud" />
                <TechBadge name="Docker" category="tool" />
                <TechBadge name="PostgreSQL" category="database" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <section id="projects" className="scroll-mt-20 px-6 py-20 md:py-28 bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <SectionHeading title="Projects" subtitle="Selected Work" />
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { title: "B2B Sales Lead Pipeline", tech: "Python, Streamlit, Multi-LLM", metric: "53% workload reduction" },
              { title: "Urban Farming Plant Health", tech: "PyTorch, ViT, CNN, GradCAM", metric: "Automated detection" },
              { title: "Bankruptcy Early Warning", tech: "XGBoost, RF, Econometrics", metric: "Seminar, FH Wedel" },
              { title: "Biotech Regulatory RAG", tech: "RAG, LLMs, Vector DB", metric: "Compliance tool" },
            ].map((project) => (
              <Card key={project.title} className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{project.tech}</p>
                  <p className="text-sm font-medium">{project.metric}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
