"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Download, X, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CvDownloadFabProps {
  themes?: { id: string; name: string; description: string; pdfUrl: string }[];
}

/**
 * Default download themes. Centralised so any variant can render
 * `<CvDownloadFab />` zero-prop and still get the correct PDFs without each
 * page repeating the constant. Pass `themes` explicitly if a variant ever
 * needs a different set.
 */
const DEFAULT_DOWNLOAD_THEMES = [
  {
    id: "ats",
    name: "ATS-Friendly",
    description: "Single-column · Best for parsing & ATS systems",
    pdfUrl: "/cv/ats/resume_reebal_sami.pdf",
  },
  {
    id: "visual",
    name: "Visual",
    description: "Two-column · Best for reading & sharing",
    pdfUrl: "/cv/visual/resume_reebal_sami.pdf",
  },
];

export function CvDownloadFab({ themes = DEFAULT_DOWNLOAD_THEMES }: CvDownloadFabProps) {
  const [open, setOpen] = useState(false);
  const [fabBottom, setFabBottom] = useState("6rem");
  const t = useTranslations("cv");

  // Allow any in-page CTA to request the panel open via a window event.
  // Used by <CvDownloadCta /> in the Editorial / Kinetic hero + footer.
  // Decoupled from React context so server-component pages can drop the
  // CTA anywhere without prop drilling.
  useEffect(() => {
    const onOpenRequest = () => setOpen(true);
    window.addEventListener("cv-fab:open", onOpenRequest);
    return () => window.removeEventListener("cv-fab:open", onOpenRequest);
  }, []);

  useEffect(() => {
    function updatePosition() {
      const chatDialog = document.querySelector<HTMLElement>(
        "[class*='fixed bottom-24 end-6'][class*='rounded-2xl']"
      );
      if (chatDialog) {
        const rect = chatDialog.getBoundingClientRect();
        const distFromBottom = window.innerHeight - rect.top;
        setFabBottom(`${distFromBottom + 20}px`);
      } else {
        setFabBottom("6rem");
      }
    }

    updatePosition();

    const observer = new MutationObserver(() => {
      requestAnimationFrame(updatePosition);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", updatePosition);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  return (
    <div
      className="fixed end-6 z-50 flex flex-col items-end gap-2 print:hidden transition-all duration-200"
      style={{ bottom: fabBottom }}
    >
      {/* Expanded panel */}
      {open && (
        <div className="mb-2 w-64 rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-xl p-4 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">{t("downloadPdf")}</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            {themes.map((theme) => (
              <a
                key={theme.id}
                href={theme.pdfUrl}
                download
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-start cursor-pointer"
                data-plausible-event="cv:download"
                data-plausible-event-theme={theme.id}
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">{theme.name}</span>
                  <p className="text-xs text-muted-foreground">{theme.description}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            <a
              href="/cv/ats/resume_reebal_sami.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors cursor-pointer"
              data-plausible-event="cv:print"
            >
              <Printer className="h-4 w-4 text-muted-foreground" />
              <span>{t("printVersion")}</span>
            </a>
          </div>
        </div>
      )}

      {/* FAB button */}
      <Button
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg cursor-pointer",
          "bg-gallery-warm text-foreground hover:bg-gallery-warm/80",
          "transition-transform duration-200",
        )}
        onClick={() => setOpen(!open)}
        aria-label={t("downloadPdf")}
      >
        {open ? <X className="h-5 w-5" /> : <Download className="h-5 w-5" />}
      </Button>
    </div>
  );
}
