import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeCategory =
  | "language"
  | "framework"
  | "ai"
  | "cloud"
  | "database"
  | "tool"
  | "default";

const categoryStyles: Record<BadgeCategory, string> = {
  language: "bg-primary/10 text-primary hover:bg-primary/20",
  framework: "bg-gallery-warm/20 text-foreground hover:bg-gallery-warm/30",
  ai: "bg-chart-2/20 text-foreground hover:bg-chart-2/30",
  cloud: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  database: "bg-muted text-muted-foreground hover:bg-muted/80",
  tool: "bg-accent text-accent-foreground hover:bg-accent/80",
  default: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
};

interface TechBadgeProps {
  name: string;
  category?: BadgeCategory;
  className?: string;
}

export function TechBadge({
  name,
  category = "default",
  className,
}: TechBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "cursor-default rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200",
        categoryStyles[category],
        className
      )}
    >
      {name}
    </Badge>
  );
}
