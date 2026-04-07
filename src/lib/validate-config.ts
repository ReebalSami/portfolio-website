import { getConfig } from "./config";

try {
  const config = getConfig();
  console.log("✓ Config validation passed");
  console.log(`  Site: ${config.site.name} — ${config.site.title}`);
  console.log(`  URL: ${config.site.url}`);
  console.log(`  Locales: ${config.i18n.locales.join(", ")}`);
  console.log(
    `  Features: ${Object.entries(config.features)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(", ")}`
  );
  process.exit(0);
} catch (error) {
  console.error("✗ Config validation failed");
  if (error instanceof Error) {
    console.error(`  ${error.message}`);
  }
  process.exit(1);
}
