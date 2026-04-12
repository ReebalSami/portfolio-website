import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { CvData } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
  Award,
  Puzzle,
  Languages,
  Settings,
} from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/brand-icons";

type Locale = "en" | "de" | "es" | "ar";

interface PortfolioPdfProps {
  data: CvData;
  locale: Locale;
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

export async function PortfolioPdfTheme({ data, locale }: PortfolioPdfProps) {
  const t = await getTranslations("cv");
  const r = (s: Parameters<typeof resolveCvLocaleString>[0]) =>
    resolveCvLocaleString(s, locale);

  return (
    <div
      className="cv-theme-wrapper cv-print-mode"
      style={{ background: "oklch(0.985 0.001 90)", color: "oklch(0.145 0.005 285)" }}
    >
      <article className="mx-auto max-w-4xl" style={{ fontFamily: "var(--font-sans), 'Space Grotesk', sans-serif" }}>
        {/* Two-column layout: sidebar left, main right */}
        <div className="grid grid-cols-[36%_64%] min-h-screen">
          {/* === LEFT SIDEBAR === */}
          <div className="px-5 py-6" style={{ background: "oklch(0.96 0.006 55)" }}>
            {/* Photo */}
            {data.basics.photo && (
              <div className="mb-4">
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl">
                  <Image
                    src={data.basics.photo}
                    alt={data.basics.name}
                    fill
                    sizes="250px"
                    className="object-cover grayscale contrast-[1.1]"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Name + Title */}
            <div className="mb-5">
              <h1
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-heading), 'Archivo', sans-serif" }}
              >
                {data.basics.name}
              </h1>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.15em]" style={{ color: "oklch(0.5 0.01 260)" }}>
                {r(data.basics.title)}
              </p>
            </div>

            {/* Contact */}
            <div className="mb-5">
              <h2
                className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "var(--font-heading), 'Archivo', sans-serif" }}
              >
                {t("contact")}
              </h2>
              <div className="space-y-1.5 text-xs" style={{ color: "oklch(0.35 0.01 260)" }}>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span>{data.basics.email}</span>
                </div>
                {data.basics.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{data.basics.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span>{r(data.basics.location.city)}, {r(data.basics.location.country)}</span>
                </div>
                {data.basics.profiles.map((p) => {
                  const Icon = networkIcons[p.network];
                  return (
                    <div key={p.network} className="flex items-center gap-1.5">
                      {Icon && <Icon className="h-3 w-3 shrink-0" />}
                      <span>{p.username || p.network}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skills */}
            <div className="mb-5">
              <h2
                className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "var(--font-heading), 'Archivo', sans-serif" }}
              >
                <Settings className="h-3 w-3" /> {t("skills")}
              </h2>
              <div className="space-y-2">
                {data.skills.map((group) => (
                  <div key={r(group.category)}>
                    <p className="text-[0.6rem] font-medium mb-1" style={{ color: "oklch(0.5 0.01 260)" }}>{r(group.category)}</p>
                    <div className="flex flex-wrap gap-1">
                      {group.skills.map((skill) => (
                        <Badge key={skill.name} variant="secondary" className="rounded-full px-1.5 py-0 text-[0.55rem] font-medium" style={{ background: "oklch(0.92 0.02 55)", color: "oklch(0.25 0.01 260)" }}>
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="mb-5">
              <h2
                className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "var(--font-heading), 'Archivo', sans-serif" }}
              >
                <Languages className="h-3 w-3" /> {t("languages")}
              </h2>
              <div className="space-y-1">
                {data.languages.map((lang) => (
                  <div key={r(lang.language)} className="flex justify-between text-xs">
                    <span className="font-medium">{r(lang.language)}</span>
                    <span style={{ color: "oklch(0.5 0.01 260)" }}>{r(lang.fluency)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Soft Skills */}
            {data.softSkills && (
              <div className="mb-5">
                <h2
                  className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] mb-2"
                  style={{ fontFamily: "var(--font-heading), 'Archivo', sans-serif" }}
                >
                  <Puzzle className="h-3 w-3" /> {t("softSkills")}
                </h2>
                <div className="flex flex-wrap gap-1">
                  {(data.softSkills[locale as keyof typeof data.softSkills] as string[] || data.softSkills.en).map((skill: string) => (
                    <Badge key={skill} variant="outline" className="rounded-full px-1.5 py-0 text-[0.55rem]">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {data.interests && data.interests.length > 0 && (
              <div>
                <h2
                  className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] mb-2"
                  style={{ fontFamily: "var(--font-heading), 'Archivo', sans-serif" }}
                >
                  {t("interests")}
                </h2>
                <div className="space-y-1">
                  {data.interests.map((interest) => (
                    <div key={r(interest.name)}>
                      <p className="text-xs font-medium">{r(interest.name)}</p>
                      {interest.keywords && interest.keywords.length > 0 && (
                        <p className="text-[0.6rem]" style={{ color: "oklch(0.5 0.01 260)" }}>
                          {interest.keywords.map((kw) => r(kw)).join(" · ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* === RIGHT MAIN === */}
          <div className="px-5 py-6">
            {/* Profile */}
            <div className="mb-5">
              <h2
                className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "var(--font-heading), 'Archivo', sans-serif" }}
              >
                {t("profile")}
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: "oklch(0.35 0.01 260)" }}>
                {r(data.profile.summary)}
              </p>
            </div>

            {/* Experience */}
            <div className="mb-5">
              <h2
                className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] mb-3"
                style={{ fontFamily: "var(--font-heading), 'Archivo', sans-serif" }}
              >
                <Briefcase className="h-3 w-3" /> {t("experience")}
              </h2>
              <div className="space-y-3">
                {data.experience.map((entry, i) => (
                  <article key={`${entry.company}-${i}`} className="cv-entry">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold">{r(entry.position)}</h3>
                      <span className="text-[0.6rem] shrink-0" style={{ color: "oklch(0.5 0.01 260)" }}>
                        {formatDate(entry.startDate, locale)} — {entry.endDate ? formatDate(entry.endDate, locale) : t("present")}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "oklch(0.5 0.01 260)" }}>
                      {entry.company}{entry.location ? ` · ${entry.location}` : ""}
                    </p>
                    {entry.description && (
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: "oklch(0.35 0.01 260)" }}>
                        {r(entry.description)}
                      </p>
                    )}
                    {entry.highlights && entry.highlights.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {entry.highlights.map((h, j) => (
                          <li key={j} className="text-xs leading-relaxed" style={{ color: "oklch(0.35 0.01 260)" }}>
                            <span style={{ color: "oklch(0.82 0.08 55)" }} className="me-1">▸</span>{r(h)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="mb-5">
              <h2
                className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] mb-3"
                style={{ fontFamily: "var(--font-heading), 'Archivo', sans-serif" }}
              >
                <GraduationCap className="h-3 w-3" /> {t("education")}
              </h2>
              <div className="space-y-3">
                {data.education.map((entry, i) => (
                  <article key={`${entry.institution}-${i}`} className="cv-entry">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold">{r(entry.studyType)} — {r(entry.area)}</h3>
                      <span className="text-[0.6rem] shrink-0" style={{ color: "oklch(0.5 0.01 260)" }}>
                        {formatDate(entry.startDate, locale)} — {entry.endDate ? formatDate(entry.endDate, locale) : t("present")}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "oklch(0.5 0.01 260)" }}>
                      {entry.institution}{entry.location ? ` · ${entry.location}` : ""}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <div className="mb-5">
                <h2
                  className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] mb-2"
                  style={{ fontFamily: "var(--font-heading), 'Archivo', sans-serif" }}
                >
                  <Award className="h-3 w-3" /> {t("certifications")}
                </h2>
                <div className="space-y-1">
                  {data.certifications.map((cert) => (
                    <div key={cert.name} className="text-xs">
                      <span className="font-medium">{cert.name}</span>
                      <span style={{ color: "oklch(0.5 0.01 260)" }}> · {cert.issuer} · {cert.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* References */}
            {data.references && data.references.length > 0 && (
              <div>
                <h2
                  className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] mb-2"
                  style={{ fontFamily: "var(--font-heading), 'Archivo', sans-serif" }}
                >
                  {t("references")}
                </h2>
                <div className="space-y-1">
                  {data.references.map((ref) => (
                    <div key={ref.name} className="text-xs">
                      <span className="font-medium">{ref.name}</span>
                      <span style={{ color: "oklch(0.5 0.01 260)" }}> — {ref.position}, {ref.company}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
