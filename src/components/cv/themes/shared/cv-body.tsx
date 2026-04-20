import { getTranslations } from "next-intl/server";
import type { CvData } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  GraduationCap,
  Award,
  Puzzle,
  MessageCircle,
  Languages,
  Settings,
} from "lucide-react";

type Locale = "en" | "de" | "es" | "ar";

interface CvBodyProps {
  data: CvData;
  locale: Locale;
  /** When true, the separator between hero and body is rendered. Defaults to true. */
  showSeparator?: boolean;
  /** When true, the decorative geometric shapes behind the body are rendered. Defaults to true. */
  showBackgroundShapes?: boolean;
  /** When true, sidebar stacks below the main content instead of sitting
   *  beside it. Useful for narrow split-screen layouts. Defaults to false. */
  sidebarBelow?: boolean;
  /** Max-width for the inner container. Defaults to 5xl (64rem). */
  maxWidthClass?: string;
}

function formatDate(dateStr: string, locale: Locale): string {
  const d = new Date(dateStr + "-01");
  return d.toLocaleDateString(locale === "ar" ? "ar-SA" : locale, {
    year: "numeric",
    month: "short",
  });
}

/**
 * Shared two-column CV body — Experience, Education, Certifications in the
 * main column; Skills, Languages, Soft Skills, Interests, References in the
 * sidebar.
 *
 * Every preview variant and the canonical PortfolioGalleryTheme render this
 * below their bespoke hero. Keeping the body constant lets the hero be the
 * only thing that differs between variants, which is how we compare them.
 */
export async function CvBody({
  data,
  locale,
  showSeparator = true,
  showBackgroundShapes = true,
  sidebarBelow = false,
  maxWidthClass = "max-w-5xl",
}: CvBodyProps) {
  const t = await getTranslations("cv");
  const r = (s: Parameters<typeof resolveCvLocaleString>[0]) =>
    resolveCvLocaleString(s, locale);

  const gridClass = sidebarBelow
    ? "relative grid gap-12 grid-cols-1 py-16 md:py-24"
    : "relative grid gap-12 md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_340px] py-16 md:py-24";
  const asideClass = sidebarBelow
    ? "min-w-0 space-y-10"
    : "min-w-0 space-y-10 md:sticky md:top-24 md:self-start";

  return (
    <>
      {showSeparator && <Separator />}

      <div className={`relative mx-auto ${maxWidthClass} px-4 sm:px-6`}>
        {showBackgroundShapes && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-gallery-warm/30 blur-3xl" />
            <div className="absolute top-[30%] -start-16 h-48 w-48 rounded-[2rem] bg-gallery-warm-muted/20 -rotate-12" />
            <div className="absolute top-[55%] -end-10 h-32 w-56 rounded-[2.5rem] bg-gallery-warm/15 rotate-6" />
            <div className="absolute bottom-40 start-1/4 h-40 w-40 rounded-full bg-gallery-warm-light/20" />
            <div className="absolute bottom-[15%] end-1/3 h-20 w-20 rounded-[1.5rem] bg-gallery-warm-light/25 -rotate-12" />
          </div>
        )}

        <div className={gridClass}>
          {/* === LEFT: main content === */}
          <div className="min-w-0 space-y-16">
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
                      {formatDate(entry.startDate, locale)} —{" "}
                      {entry.endDate ? formatDate(entry.endDate, locale) : t("present")}
                    </p>
                    <h3 className="font-medium">{r(entry.position)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {entry.company}
                      {entry.location ? ` · ${entry.location}` : ""}
                    </p>
                    {entry.description && (
                      <p className="cv-copy-balance mt-2 text-sm text-muted-foreground leading-relaxed">
                        {r(entry.description)}
                      </p>
                    )}
                    {entry.highlights && entry.highlights.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {entry.highlights.map((h, j) => (
                          <li
                            key={j}
                            className="cv-copy-balance text-sm text-muted-foreground leading-relaxed"
                          >
                            <span className="text-gallery-warm me-2">▸</span>
                            {r(h)}
                          </li>
                        ))}
                      </ul>
                    )}
                    {entry.tags && entry.tags.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-1.5 list-none p-0">
                        {entry.tags.map((tag) => (
                          <li key={tag}>
                            <Badge
                              variant="secondary"
                              className="text-[0.65rem] px-2 py-0 bg-gallery-warm/10 text-foreground hover:bg-gallery-warm/20"
                            >
                              {tag}
                            </Badge>
                          </li>
                        ))}
                      </ul>
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
                      {formatDate(entry.startDate, locale)} —{" "}
                      {entry.endDate ? formatDate(entry.endDate, locale) : t("present")}
                    </p>
                    <h3 className="font-medium">
                      {r(entry.studyType)} — {r(entry.area)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {entry.institution}
                      {entry.location ? ` · ${entry.location}` : ""}
                    </p>
                    {entry.grade && (
                      <p className="mt-1 text-sm text-muted-foreground">{entry.grade}</p>
                    )}
                    {entry.highlights && entry.highlights.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {entry.highlights.map((h, j) => (
                          <li
                            key={j}
                            className="cv-copy-balance text-sm text-muted-foreground leading-relaxed"
                          >
                            <span className="text-gallery-warm me-2">▸</span>
                            {r(h)}
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
                        <p className="text-xs text-muted-foreground">
                          {cert.issuer} · {cert.date}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* === RIGHT: sidebar === */}
          <aside className={asideClass}>
            {/* Skills */}
            <section>
              <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
                <Settings className="h-4 w-4" /> {t("skills")}
              </h2>
              <div className="space-y-4">
                {data.skills.map((group) => (
                  <div key={r(group.category)}>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {r(group.category)}
                    </p>
                    <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
                      {group.skills.map((skill) => (
                        <li key={skill.name}>
                          <Badge
                            variant="secondary"
                            className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-gallery-warm/15 text-foreground hover:bg-gallery-warm/25 dark:bg-gallery-warm/10 dark:text-foreground dark:hover:bg-gallery-warm/20 transition-colors"
                          >
                            {skill.name}
                          </Badge>
                        </li>
                      ))}
                    </ul>
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
                <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
                  {(
                    (data.softSkills[locale as keyof typeof data.softSkills] as string[]) ||
                    data.softSkills.en
                  ).map((skill: string) => (
                    <li key={skill}>
                      <Badge
                        variant="outline"
                        className="rounded-2xl text-xs h-auto max-w-full whitespace-normal break-words py-1 leading-snug"
                      >
                        {skill}
                      </Badge>
                    </li>
                  ))}
                </ul>
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
                      <p className="text-xs text-muted-foreground">
                        {ref.position}, {ref.company}
                      </p>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
