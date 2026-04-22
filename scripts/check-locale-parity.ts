import fs from "node:fs";
import path from "node:path";

interface JsonObject { [key: string]: JsonValue }
type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;

export function flattenKeys(obj: Record<string, JsonValue>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return v !== null && typeof v === "object" && !Array.isArray(v)
      ? flattenKeys(v as Record<string, JsonValue>, key)
      : [key];
  });
}

export function checkLocaleParity(
  source: Record<string, JsonValue>,
  target: Record<string, JsonValue>
): string[] {
  const sourceKeys = new Set(flattenKeys(source));
  const targetKeys = new Set(flattenKeys(target));
  const issues: string[] = [];
  for (const k of sourceKeys) if (!targetKeys.has(k)) issues.push(`missing: ${k}`);
  for (const k of targetKeys) if (!sourceKeys.has(k)) issues.push(`extra: ${k}`);
  return issues;
}

// CLI entry point
const isMain =
  process.argv[1]?.endsWith("check-locale-parity.ts") ||
  process.argv[1]?.endsWith("check-locale-parity.js");

if (isMain) {
  const messagesDir = path.resolve(process.cwd(), "src/messages");
  const en = JSON.parse(fs.readFileSync(path.join(messagesDir, "en.json"), "utf-8"));
  const locales = ["ar", "de", "es"];
  let hasError = false;
  for (const locale of locales) {
    const target = JSON.parse(
      fs.readFileSync(path.join(messagesDir, `${locale}.json`), "utf-8")
    );
    const issues = checkLocaleParity(en, target);
    if (issues.length > 0) {
      console.error(`\n[locale-parity] ${locale}.json has ${issues.length} issue(s):`);
      issues.forEach((i) => console.error(`  ${i}`));
      hasError = true;
    }
  }
  if (hasError) process.exit(1);
  console.log("[locale-parity] OK — all locales in key parity with en.json");
}
