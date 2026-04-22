import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getHeroConfig } from "@/lib/config";

const CONFIG_PATH = path.resolve(process.cwd(), "config", "site.yaml");

// This endpoint is used only during local tuning in `pnpm dev`.
export const dynamic = "force-dynamic";

export function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let version = Date.now();
  try {
    version = Math.trunc(fs.statSync(CONFIG_PATH).mtimeMs);
  } catch {
    // Fall back to a monotonic value if stat fails.
    version = Date.now();
  }

  return NextResponse.json(
    {
      hero: getHeroConfig(),
      version,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}
