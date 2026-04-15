"use client";

import { useTranslations } from "next-intl";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CvTheme } from "@/lib/cv/themes";

interface CvToolbarProps {
  themes: CvTheme[];
  currentThemeId: string;
  onThemeChange: (themeId: string) => void;
  pdfUrl?: string;
}

export function CvToolbar({
  themes,
  currentThemeId,
  onThemeChange,
  pdfUrl,
}: CvToolbarProps) {
  const t = useTranslations("cv");

  const currentTheme = themes.find((th) => th.id === currentThemeId);

  return (
    <div className="flex items-center gap-2 print:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(props) => (
            <Button variant="outline" size="sm" {...props}>
              {t("switchTheme")}: {currentTheme?.name ?? currentThemeId}
            </Button>
          )}
        />
        <DropdownMenuContent align="end">
          {themes.map((theme) => (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={theme.id === currentThemeId ? "font-semibold" : ""}
            >
              {theme.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {pdfUrl && (
        <Button
          variant="outline"
          size="sm"
          render={(props) => (
            <a {...props} href={pdfUrl} download>
              <Download className="w-4 h-4 me-1.5" aria-hidden="true" />
              {t("downloadPdf")}
            </a>
          )}
        />
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => window.print()}
      >
        <Printer className="w-4 h-4 me-1.5" aria-hidden="true" />
        {t("printVersion")}
      </Button>
    </div>
  );
}
