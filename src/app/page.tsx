import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SectionHeading } from "@/components/shared/section-heading";
import { TechBadge } from "@/components/shared/tech-badge";
import { GeometricShapes } from "@/components/shared/geometric-shapes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteConfig } from "@/lib/config";

export default function Home() {
  const site = getSiteConfig();

  return (
    <div className="flex flex-col flex-1">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <section className="relative flex flex-1 items-center justify-center px-6 py-24 md:py-32">
        <GeometricShapes variant="hero" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
            {site.title}
          </p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
            {site.name}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
            Design System Preview — NFT Art Gallery Style
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg">Primary Action</Button>
            <Button variant="outline" size="lg">Secondary</Button>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            title="Design System"
            subtitle="Typography & Colors"
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cards use CSS variables for theming. No hardcoded colors.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Warm Accent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-gallery-warm" />
                  <div className="h-8 w-8 rounded-full bg-gallery-warm-light" />
                  <div className="h-8 w-8 rounded-full bg-gallery-warm-muted" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-sans text-sm text-muted-foreground">Body: Space Grotesk</p>
                <p className="font-mono text-sm text-muted-foreground">Mono: JetBrains Mono</p>
              </CardContent>
            </Card>
          </div>

          <SectionHeading
            title="Tech Badges"
            subtitle="Components"
          />
          <div className="flex flex-wrap gap-2 mb-16">
            <TechBadge name="Python" category="language" />
            <TechBadge name="TypeScript" category="language" />
            <TechBadge name="Next.js" category="framework" />
            <TechBadge name="PyTorch" category="ai" />
            <TechBadge name="AWS" category="cloud" />
            <TechBadge name="PostgreSQL" category="database" />
            <TechBadge name="Docker" category="tool" />
          </div>

          <SectionHeading
            title="Button Variants"
            subtitle="Interactive"
          />
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
