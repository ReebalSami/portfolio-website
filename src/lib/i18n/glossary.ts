import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";
import { z } from "zod/v4";

const FormsSchema = z.union([
  z.object({ all: z.string() }),
  z.record(z.enum(["en", "de", "es", "ar"]), z.string()),
]);

const EntrySchema = z.object({
  id: z.string(),
  category: z.enum(["locked_source", "transliterated", "translated", "per_context"]),
  forms: FormsSchema,
  notes: z.record(z.string(), z.string()).optional(),
});

const GlossarySchema = z
  .object({
    meta: z.object({
      version: z.number(),
      locales: z.array(z.string()),
      last_review: z.string(),
    }),
  })
  .catchall(z.array(EntrySchema));

export type Glossary = z.infer<typeof GlossarySchema>;
export type Locale = "en" | "de" | "es" | "ar";

export function loadGlossary(filePath?: string): Glossary {
  const p =
    filePath ?? path.resolve(process.cwd(), "config/i18n/glossary.yaml");
  const raw = fs.readFileSync(p, "utf-8");
  return GlossarySchema.parse(yaml.parse(raw));
}

export function formFor(g: Glossary, id: string, locale: Locale): string {
  for (const key of Object.keys(g)) {
    if (key === "meta") continue;
    const entries = g[key as keyof Glossary] as unknown as Array<
      z.infer<typeof EntrySchema>
    >;
    const found = entries.find((e) => e.id === id);
    if (!found) continue;
    if ("all" in found.forms) return (found.forms as { all: string }).all;
    const form = (found.forms as Record<string, string>)[locale];
    if (!form) throw new Error(`Glossary: no form for id=${id} locale=${locale}`);
    return form;
  }
  throw new Error(`Glossary: unknown id "${id}"`);
}
