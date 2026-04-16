import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { CvData } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
  Award,
  Puzzle,
  MessageCircle,
  Languages,
  Settings,
} from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/brand-icons";

type Locale = "en" | "de" | "es" | "ar";

interface PortfolioGalleryProps {
  data: CvData;
  locale: Locale;
  printMode?: boolean;
}

function formatDate(dateStr: string, locale: Locale): string {
  const d = new Date(dateStr + "-01");
  return d.toLocaleDateString(locale === "ar" ? "ar-SA" : locale, {
    year: "numeric",
    month: "short",
  });
}

const networkIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  LinkedIn: LinkedInIcon,
  GitHub: GitHubIcon,
};

export async function PortfolioGalleryTheme({ data, locale }: PortfolioGalleryProps) {
  const t = await getTranslations("cv");
  const r = (s: Parameters<typeof resolveCvLocaleString>[0]) =>
    resolveCvLocaleString(s, locale);

  return (
    <div className="relative overflow-x-hidden">
      {/* ========== HERO — photo left, name/title/summary right ========== */}
      <section className="relative px-4 py-12 sm:px-6 md:py-20 overflow-hidden">
        {/* Geometric shapes — identical to hero section */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-20 -start-20 h-80 w-80 rounded-full bg-gallery-warm/30 blur-3xl" />
          <div className="absolute top-1/4 end-0 h-64 w-64 rounded-[2rem] bg-gallery-warm-muted/25 rotate-12" />
          <div className="absolute bottom-10 start-1/4 h-48 w-48 rounded-full bg-gallery-warm-light/30" />
        </div>

        <div className="relative mx-auto max-w-5xl grid gap-8 md:grid-cols-2 md:gap-12 items-center">
          {/* Photo with shape accents */}
          {data.basics.photo && (
            <div className="relative order-1 md:order-1 mx-auto md:mx-0 max-w-[70%] sm:max-w-[60%] md:max-w-none">
              <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
                <div className="absolute -top-4 -start-4 h-48 w-48 rounded-full bg-gallery-warm/30 sm:h-60 sm:w-60 md:h-72 md:w-72" />
                <div className="absolute -bottom-2 -end-2 h-32 w-44 rounded-[2rem] bg-gallery-warm-muted/25 rotate-6 sm:h-40 sm:w-56" />
                <div className="absolute top-1/2 -start-3 h-20 w-20 rounded-[1.5rem] bg-gallery-warm-light/30 -rotate-12 sm:h-28 sm:w-28" />
              </div>
              <div className="relative overflow-hidden rounded-[2rem]">
                <Image
                  src={data.basics.photo}
                  alt={data.basics.name}
                  width={500}
                  height={600}
                  priority
                  sizes="(max-width: 768px) 70vw, 40vw"
                  className="h-auto w-full object-cover grayscale contrast-[1.1]"
                />
              </div>
            </div>
          )}

          {/* Name + title + summary */}
          <div className="order-2 md:order-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground mb-3">
              {r(data.basics.title)}
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">
              {data.basics.name}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed sm:text-lg max-w-lg">
              {r(data.profile.summary)}
            </p>

            {/* Contact links — inline like hero CTA area */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`mailto:${data.basics.email}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" /> {data.basics.email}
              </a>
              {data.basics.phone && (
                <a href={`tel:${data.basics.phone}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="h-4 w-4" /> {data.basics.phone}
                </a>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {r(data.basics.location.city)}, {r(data.basics.location.country)}
              </span>
              {data.basics.profiles.map((p) => {
                const Icon = networkIcons[p.network];
                return (
                  <a key={p.network} href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {Icon && <Icon className="h-4 w-4" />} {p.username || p.network}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ========== MAIN CONTENT — two-column layout ========== */}
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {/* Geometric shapes — lower section (matching hero shapes) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-gallery-warm/20" />
          <div className="absolute top-[30%] -start-16 h-48 w-48 rounded-[2rem] bg-gallery-warm-muted/20 -rotate-12" />
          <div className="absolute top-[55%] -end-10 h-32 w-56 rounded-[2.5rem] bg-gallery-warm/15 rotate-6" />
          <div className="absolute bottom-40 start-1/4 h-40 w-40 rounded-full bg-gallery-warm-light/20" />
          <div className="absolute bottom-[15%] end-1/3 h-20 w-20 rounded-[1.5rem] bg-gallery-warm-light/25 -rotate-12" />
        </div>

        <div className="relative grid gap-12 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_340px] py-16 md:py-24">

          {/* === LEFT: main content sections === */}
          <div className="space-y-16">
            {/* Experience */}
            <section>
              <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground mb-8">
                <Briefcase className="h-4 w-4" /> {t("experience")}
              </h2>
              <div className="relative ms-4 border-s-2 border-border ps-8 space-y-8">
                {data.experience.map((entry, i) => (
                  <article key={`${entry.company}-${i}`} className="relative">
                    <div className="absolute -start-[2.6rem] top-1 h-3 w-3 rounded-full bg-gallery-warm" />
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
                      {formatDate(entry.startDate, locale)} — {entry.endDate ? formatDate(entry.endDate, locale) : t("present")}
                    </p>
                    <h3 className="font-medium">{r(entry.position)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {entry.company}{entry.location ? ` · ${entry.location}` : ""}
                    </p>
                    {entry.description && (
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {r(entry.description)}
                      </p>
                    )}
                    {entry.highlights && entry.highlights.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {entry.highlights.map((h, j) => (
                          <li key={j} className="text-sm text-muted-foreground leading-relaxed">
                            <span className="text-gallery-warm me-2">▸</span>{r(h)}
                          </li>
                        ))}
                      </ul>
                    )}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {entry.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[0.65rem] px-2 py-0 bg-gallery-warm/10 text-foreground hover:bg-gallery-warm/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>

            {/* Education */}
            <section>
              <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground mb-8">
                <GraduationCap className="h-4 w-4" /> {t("education")}
              </h2>
              <div className="relative ms-4 border-s-2 border-border ps-8 space-y-8">
                {data.education.map((entry, i) => (
                  <article key={`${entry.institution}-${i}`} className="relative">
                    <div className="absolute -start-[2.6rem] top-1 h-3 w-3 rounded-full bg-primary" />
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
                      {formatDate(entry.startDate, locale)} — {entry.endDate ? formatDate(entry.endDate, locale) : t("present")}
                    </p>
                    <h3 className="font-medium">{r(entry.studyType)} — {r(entry.area)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {entry.institution}{entry.location ? ` · ${entry.location}` : ""}
                    </p>
                    {entry.grade && (
                      <p className="mt-1 text-sm text-muted-foreground">{entry.grade}</p>
                    )}
                    {entry.highlights && entry.highlights.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {entry.highlights.map((h, j) => (
                          <li key={j} className="text-sm text-muted-foreground leading-relaxed">
                            <span className="text-gallery-warm me-2">▸</span>{r(h)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </section>

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground mb-8">
                  <Award className="h-4 w-4" /> {t("certifications")}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.certifications.map((cert) => (
                    <Card key={cert.name} className="h-full">
                      <CardContent className="pt-4 pb-4">
                        <h3 className="font-medium text-sm">{cert.name}</h3>
                        <p className="text-xs text-muted-foreground">{cert.issuer} · {cert.date}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* === RIGHT: sidebar content === */}
          <aside className="space-y-10 md:sticky md:top-24 md:self-start">
            {/* Skills */}
            <section>
              <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
                <Settings className="h-4 w-4" /> {t("skills")}
              </h2>
              <div className="space-y-4">
                {data.skills.map((group) => (
                  <div key={r(group.category)}>
                    <p className="text-xs font-medium text-muted-foreground mb-2">{r(group.category)}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.skills.map((skill) => (
                        <Badge key={skill.name} variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-gallery-warm/15 text-foreground hover:bg-gallery-warm/25 dark:bg-gallery-warm/10 dark:text-foreground dark:hover:bg-gallery-warm/20 transition-colors">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Languages */}
            <section>
              <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
                <Languages className="h-4 w-4" /> {t("languages")}
              </h2>
              <div className="space-y-2">
                {data.languages.map((lang) => (
                  <div key={r(lang.language)} className="flex justify-between text-sm">
                    <span className="font-medium">{r(lang.language)}</span>
                    <span className="text-muted-foreground">{r(lang.fluency)}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Soft Skills */}
            {data.softSkills && (
              <section>
                <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
                  <Puzzle className="h-4 w-4" /> {t("softSkills")}
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {(data.softSkills[locale as keyof typeof data.softSkills] as string[] || data.softSkills.en).map((skill: string) => (
                    <Badge key={skill} variant="outline" className="rounded-full text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Interests */}
            {data.interests && data.interests.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
                  <MessageCircle className="h-4 w-4" /> {t("interests")}
                </h2>
                <div className="space-y-2">
                  {data.interests.map((interest) => (
                    <div key={r(interest.name)}>
                      <p className="text-sm font-medium">{r(interest.name)}</p>
                      {interest.keywords && interest.keywords.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {interest.keywords.map((kw) => r(kw)).join(" · ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* References */}
            {data.references && data.references.length > 0 && (
              <section>
                <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
                  {t("references")}
                </h2>
                <div className="space-y-3">
                  {data.references.map((ref) => (
                    <Card key={ref.name} className="p-3">
                      <p className="font-medium text-sm">{ref.name}</p>
                      <p className="text-xs text-muted-foreground">{ref.position}, {ref.company}</p>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
