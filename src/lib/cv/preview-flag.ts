/**
 * Build-time check that decides whether the CV preview surfaces
 * (`/cv/preview`, `/cv/option-N`) are reachable.
 *
 * - Development (`NODE_ENV !== "production"`): always enabled. `make dev` /
 *   `pnpm dev` work as before, no env vars needed.
 * - Production: disabled by default. Pages call `notFound()` and the route
 *   returns 404. Set `ENABLE_CV_PREVIEW=true` at build time (e.g. on a
 *   staging deploy) to opt in without touching code.
 *
 * Why a runtime helper instead of a build-time conditional? Next.js App
 * Router resolves these checks per-request (or per-static-render), so a
 * single helper keeps the gate consistent across `dev`, `build && start`,
 * and the AWS Lambda runtime. No module-level branching needed.
 */
export function isCvPreviewEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ENABLE_CV_PREVIEW === "true";
}
