import { cn } from "@/lib/utils";

interface CvLayoutProps {
  children: React.ReactNode;
  printMode?: boolean;
  className?: string;
}

export function CvLayout({ children, printMode = false, className }: CvLayoutProps) {
  return (
    <article
      className={cn(
        "cv-layout mx-auto max-w-4xl px-6 py-8 bg-background text-foreground",
        "print:max-w-none print:px-0 print:py-0 print:m-0",
        printMode && "max-w-none px-0 py-0",
        className,
      )}
    >
      {children}
    </article>
  );
}
