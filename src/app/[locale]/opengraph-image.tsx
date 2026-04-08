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

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background,
          color: "#f9f7f3",
          fontFamily: "Space Grotesk, Archivo, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "70%",
            }}
          >
            <span style={{ fontSize: 28, letterSpacing: 8, textTransform: "uppercase", color: accent }}>
              {config.site.title}
            </span>
            <h1 style={{ fontSize: 80, margin: 0 }}>{config.site.name}</h1>
            <p style={{ fontSize: 28, color: "#d1d1d6", lineHeight: 1.4 }}>{t("intro")}</p>
          </div>
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: "32px",
              background: "linear-gradient(135deg, rgba(246,200,159,0.25), rgba(246,200,159,0))",
              border: `2px solid ${accent}`,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            borderTop: "1px solid rgba(249,247,243,0.2)",
            paddingTop: 24,
          }}
        >
          <span>{config.contact.location}</span>
          <span>{config.contact.email}</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
