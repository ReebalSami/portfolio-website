import Script from "next/script";
import { getConfig } from "@/lib/config";

export function PlausibleAnalytics() {
  const config = getConfig();

  if (!config.features.analytics) {
    return null;
  }

  return (
    <Script
      defer
      data-domain={config.analytics.siteId}
      src={config.analytics.scriptUrl}
      strategy="afterInteractive"
    />
  );
}
