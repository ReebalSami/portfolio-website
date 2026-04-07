import { cn } from "@/lib/utils";

interface GeometricShapesProps {
  className?: string;
  variant?: "hero" | "section";
}

export function GeometricShapes({
  className,
  variant = "hero",
}: GeometricShapesProps) {
  if (variant === "hero") {
    return (
      <div
        className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
        aria-hidden="true"
      >
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-gallery-warm/30 blur-3xl" />
        <div className="absolute top-1/4 right-0 h-64 w-64 rounded-[2rem] bg-gallery-warm-muted/25 rotate-12" />
        <div className="absolute bottom-10 left-1/4 h-48 w-48 rounded-full bg-gallery-warm-light/30" />
        <div className="absolute -bottom-10 right-1/3 h-32 w-56 rounded-[2.5rem] bg-gallery-warm/20 -rotate-6" />
      </div>
    );
  }

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gallery-warm/15 blur-2xl" />
      <div className="absolute bottom-0 -left-10 h-32 w-32 rounded-[1.5rem] bg-gallery-warm-light/20 rotate-12" />
    </div>
  );
}
