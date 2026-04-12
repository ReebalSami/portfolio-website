"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Download, X, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CvDownloadFabProps {
  themes: { id: string; name: string; pdfUrl: string }[];
}

export function CvDownloadFab({ themes }: CvDownloadFabProps) {
  const [open, setOpen] = useState(false);
  const [fabBottom, setFabBottom] = useState("6rem");
  const t = useTranslations("cv");

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
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{theme.name}</span>
              </a>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            <a
              href="/cv/portfolio/resume_reebal_sami.pdf"
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
