import { getConfig } from "@/lib/config";

export function PlausibleAnalytics() {
  const config = getConfig();

  if (!config.features.analytics) {
    return null;
  }

  return (
    <>
      <script async src={config.analytics.scriptUrl} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`,
        }}
      />
    </>
  );
}
