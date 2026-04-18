"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";

interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  const id = useId().replace(/:/g, "-");
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        const mod = await import("mermaid");
        const mermaid = mod.default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: resolvedTheme === "dark" ? "dark" : "neutral",
          fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
          themeVariables:
            resolvedTheme === "dark"
              ? {
                  // Dark: gallery-black base + warm accent, high-contrast text
                  background: "#18181b",
                  primaryColor: "#27272a",
                  primaryTextColor: "#fafafa",
                  primaryBorderColor: "#e0b088",
                  lineColor: "#e0b088",
                  secondaryColor: "#2a2a30",
                  tertiaryColor: "#1f1f23",
                  textColor: "#fafafa",
                  nodeTextColor: "#fafafa",
                  labelTextColor: "#fafafa",
                  edgeLabelBackground: "#1f1f23",
                  mainBkg: "#27272a",
                  secondBkg: "#2a2a30",
                  clusterBkg: "#1f1f23",
                  clusterBorder: "#e0b088",
                  titleColor: "#fafafa",
                }
              : {
                  background: "#ffffff",
                  primaryColor: "#faf7f2",
                  primaryTextColor: "#18181b",
                  primaryBorderColor: "#cc9874",
                  lineColor: "#cc9874",
                  secondaryColor: "#fff",
                  tertiaryColor: "#f5f0e8",
                  textColor: "#18181b",
                  nodeTextColor: "#18181b",
                  labelTextColor: "#18181b",
                  edgeLabelBackground: "#faf7f2",
                  mainBkg: "#faf7f2",
                  secondBkg: "#ffffff",
                  clusterBkg: "#f5f0e8",
                  clusterBorder: "#cc9874",
                  titleColor: "#18181b",
                },
        });
        const safeId = `mermaid-${id}`;
        const { svg: rendered } = await mermaid.render(safeId, chart);
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [chart, id, resolvedTheme]);

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm">
        <p className="font-medium text-destructive mb-2">Mermaid render error</p>
        <pre className="text-xs text-muted-foreground overflow-x-auto">{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-6 rounded-lg border border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        Rendering diagram…
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-8 overflow-x-auto rounded-lg border border-border bg-background/50 p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
