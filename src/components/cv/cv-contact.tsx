import { getTranslations } from "next-intl/server";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import type { CvBasics, CvLocaleString } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/brand-icons";
import { CvSection } from "./cv-section";

type Locale = "en" | "de" | "es" | "ar";

interface CvContactProps {
  basics: CvBasics;
  locale: Locale;
  showIcons?: boolean;
  className?: string;
}

const networkIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LinkedIn: LinkedInIcon,
  GitHub: GitHubIcon,
};

export async function CvContact({
  basics,
  locale,
  showIcons = true,
  className,
}: CvContactProps) {
  const t = await getTranslations("cv");

  const city = resolveCvLocaleString(basics.location.city as CvLocaleString, locale);
  const country = resolveCvLocaleString(basics.location.country as CvLocaleString, locale);
  const location = `${city}, ${country}`;

  const iconClass = "w-4 h-4 shrink-0 text-muted-foreground";

  return (
    <CvSection id="contact" heading={t("contact")} className={className}>
      <address className="not-italic text-sm text-foreground">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li className="flex items-center gap-2">
            {showIcons && <Mail className={iconClass} aria-hidden="true" />}
            <a href={`mailto:${basics.email}`} className="hover:underline">
              {basics.email}
            </a>
          </li>

          {basics.phone && (
            <li className="flex items-center gap-2">
              {showIcons && <Phone className={iconClass} aria-hidden="true" />}
              <a href={`tel:${basics.phone}`} className="hover:underline">
                {basics.phone}
              </a>
            </li>
          )}

          <li className="flex items-center gap-2">
            {showIcons && <MapPin className={iconClass} aria-hidden="true" />}
            <span>{location}</span>
          </li>

          {basics.url && (
            <li className="flex items-center gap-2">
              {showIcons && <Globe className={iconClass} aria-hidden="true" />}
              <a
                href={basics.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {new URL(basics.url).hostname}
              </a>
            </li>
          )}

          {basics.profiles.map((profile) => {
            const Icon = networkIconMap[profile.network];
            return (
              <li key={profile.network} className="flex items-center gap-2">
                {showIcons && Icon && <Icon className={iconClass} aria-hidden="true" />}
                <a
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {profile.username || profile.network}
                </a>
              </li>
            );
          })}
        </ul>
      </address>
    </CvSection>
  );
}
