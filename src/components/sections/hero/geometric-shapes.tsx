export function GeometricShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div className="absolute -top-4 -left-4 h-48 w-48 rounded-full bg-gallery-warm/30 sm:h-60 sm:w-60 md:-top-8 md:-left-8 md:h-80 md:w-80 lg:h-96 lg:w-96" />
      <div className="absolute -bottom-2 -right-2 h-32 w-44 rounded-[2rem] bg-gallery-warm-muted/25 rotate-6 sm:h-40 sm:w-56 md:-bottom-4 md:-right-4 md:h-56 md:w-72" />
      <div className="absolute top-1/2 -left-3 h-20 w-20 rounded-[1.5rem] bg-gallery-warm-light/30 -rotate-12 sm:h-28 sm:w-28 md:-left-6 md:h-32 md:w-32" />
    </div>
  );
}
