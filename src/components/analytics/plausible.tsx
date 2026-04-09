import { getConfig } from "@/lib/config";

export function PlausibleAnalytics() {
  const config = getConfig();

  if (!config.features.analytics) {
    return null;
  }

  return (
    <script
      defer
      data-domain={config.analytics.siteId}
      src={config.analytics.scriptUrl}
    />
  );
}
