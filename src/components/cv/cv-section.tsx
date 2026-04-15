import { cn } from "@/lib/utils";

interface CvSectionProps {
  id: string;
  heading: string;
  children: React.ReactNode;
  className?: string;
}

export function CvSection({ id, heading, children, className }: CvSectionProps) {
  return (
    <section id={`cv-${id}`} aria-labelledby={`cv-heading-${id}`} className={cn("cv-section", className)}>
      <h2
        id={`cv-heading-${id}`}
        className="text-lg font-semibold uppercase tracking-widest text-foreground mb-3 border-b border-border pb-1 print:text-[12pt] print:mb-2"
      >
        {heading}
      </h2>
      {children}
    </section>
  );
}
