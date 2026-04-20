import { TransitionLink } from "@/components/shared/transition-link";
import { useTranslations } from "next-intl";
import { Mail, MapPin } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/brand-icons";
import { Separator } from "@/components/ui/separator";

interface FooterProps {
  siteName: string;
  email: string;
  location: string;
  social: {
    linkedin: string;
    github: string;
  };
}

export function Footer({ siteName, email, location, social }: FooterProps) {
  const t = useTranslations("common.footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <TransitionLink href="/" className="text-lg font-bold tracking-tight">
              {siteName}
            </TransitionLink>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{location}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors duration-200 hover:text-foreground cursor-pointer"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="h-5 w-5" />
            </a>
            <a
              href={social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors duration-200 hover:text-foreground cursor-pointer"
              aria-label="GitHub"
            >
              <GitHubIcon className="h-5 w-5" />
            </a>
            <a
              href={`mailto:${email}`}
              className="text-muted-foreground transition-colors duration-200 hover:text-foreground cursor-pointer"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {year} {siteName}. {t("rights")}</p>
          <p>{t("builtWith")}</p>
        </div>
      </div>
    </footer>
  );
}
