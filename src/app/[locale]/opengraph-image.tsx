import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getConfig } from "@/lib/config";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const background = "#09090f";
const accent = "#f6c89f";

function getHeroImageBase64(): string {
  const photoPath = path.join(process.cwd(), "public", "images", "og", "hero-og.jpg");
  const buffer = fs.readFileSync(photoPath);
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }

  setRequestLocale(locale);
  const t = await getTranslations("home.hero");
  const config = getConfig();
  const heroSrc = getHeroImageBase64();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          background,
          color: "#f9f7f3",
          fontFamily: "sans-serif",
        }}
      >
        {/* Text side */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px 48px 64px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <span
              style={{
                fontSize: 22,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: accent,
              }}
            >
              {config.site.title}
            </span>
            <h1 style={{ fontSize: 72, margin: 0, lineHeight: 1.05 }}>
              {config.site.name}
            </h1>
            <p style={{ fontSize: 24, color: "#d1d1d6", lineHeight: 1.4, marginTop: 8 }}>
              {t("intro")}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 20,
              borderTop: "1px solid rgba(249,247,243,0.15)",
              paddingTop: 20,
              color: "#a1a1a6",
            }}
          >
            <span>{config.contact.location}</span>
            <span>{config.contact.email}</span>
          </div>
        </div>

        {/* Photo side */}
        <div
          style={{
            width: 380,
            height: "100%",
            display: "flex",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <img
            src={heroSrc}
            alt=""
            width={380}
            height={630}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
          {/* Gradient overlay from background into photo (rendered after img so it paints on top) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 120,
              height: "100%",
              background: `linear-gradient(to left, transparent, ${background})`,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
