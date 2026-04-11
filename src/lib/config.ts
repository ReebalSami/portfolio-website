import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { PortfolioConfigSchema, type PortfolioConfig } from "@/types/config";

const CONFIG_PATH = path.resolve(process.cwd(), "config", "site.yaml");

let cachedConfig: PortfolioConfig | null = null;

export function getConfig(): PortfolioConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  const parsed = parseYaml(raw);
  const result = PortfolioConfigSchema.safeParse(parsed);

  if (!result.success) {
    console.error("Config validation failed:");
    console.error(JSON.stringify(result.error.issues, null, 2));
    throw new Error(
      `Invalid config/site.yaml: ${result.error.issues.length} validation error(s)`
    );
  }

  cachedConfig = result.data;
  return cachedConfig;
}

export function getSiteConfig() {
  return getConfig().site;
}

export function getContactConfig() {
  return getConfig().contact;
}

export function getSocialConfig() {
  return getConfig().social;
}

export function getI18nConfig() {
  return getConfig().i18n;
}

export function getFeaturesConfig() {
  return getConfig().features;
}

export function getPhotosConfig() {
  return getConfig().photos;
}

export function getDesignConfig() {
  return getConfig().design;
}

export function getAnalyticsConfig() {
  return getConfig().analytics;
}

export function getChatbotConfig() {
  return getConfig().chatbot;
}

export function getContactFormConfig() {
  return getConfig().contactForm;
}

export function getSeoConfig() {
  return getConfig().seo;
}

export function getAwsConfig() {
  return getConfig().aws;
}

export function getCvConfig() {
  return getConfig().cv;
}

export function getBuildConfig() {
  return getConfig().build;
}
