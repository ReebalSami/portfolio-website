import type { CvBasics, CvLocaleString } from "@/lib/cv/schema";
import { resolveCvLocaleString } from "@/lib/cv/data";
import { CvPhoto } from "./cv-photo";
import { cn } from "@/lib/utils";

type Locale = "en" | "de" | "es" | "ar";

interface CvHeaderProps {
  basics: CvBasics;
  locale: Locale;
  showPhoto?: boolean;
  photoShape?: "round" | "square" | "rounded";
  className?: string;
}

export function CvHeader({
  basics,
  locale,
  showPhoto = true,
  photoShape = "round",
  className,
}: CvHeaderProps) {
  const title = resolveCvLocaleString(basics.title as CvLocaleString, locale);

  return (
    <header className={cn("cv-header", className)}>
      <div className="flex items-center gap-6">
        {showPhoto && basics.photo && (
          <CvPhoto src={basics.photo} name={basics.name} shape={photoShape} />
        )}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground print:text-[18pt]">
            {basics.name}
          </h1>
          <p className="text-lg font-medium text-muted-foreground print:text-[12pt]">
            {title}
          </p>
        </div>
      </div>
    </header>
  );
}
