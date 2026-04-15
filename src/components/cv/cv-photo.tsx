import Image from "next/image";
import { cn } from "@/lib/utils";

interface CvPhotoProps {
  src: string;
  name: string;
  shape?: "round" | "square" | "rounded" | "oval";
  className?: string;
}

export function CvPhoto({ src, name, shape = "round", className }: CvPhotoProps) {
  return (
    <div
      className={cn(
        "relative w-[120px] h-[150px] overflow-hidden shrink-0 print:w-[100px] print:h-[125px]",
        shape === "round" && "rounded-full w-[120px] h-[120px] print:w-[100px] print:h-[100px]",
        shape === "rounded" && "rounded-xl",
        shape === "square" && "rounded-none",
        shape === "oval" && "rounded-[50%]",
        className,
      )}
    >
      <Image
        src={src}
        alt={name}
        fill
        sizes="120px"
        className="object-cover grayscale"
        priority
      />
    </div>
  );
}
