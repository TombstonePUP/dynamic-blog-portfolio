export type TopicOption = {
  id: string;
  name: string;
  slug: string;
  isFeatured?: boolean;
  homepageOrder?: number | null;
};

export function normalizeTaxonomyName(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function taxonomyKey(value: unknown): string {
  return normalizeTaxonomyName(value).toLowerCase();
}

export function normalizeTaxonomySlug(value: unknown): string {
  return taxonomyKey(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function dedupeTaxonomyValues(values: unknown[]): string[] {
  const seen = new Set<string>();
  const next: string[] = [];

  for (const value of values) {
    const name = normalizeTaxonomyName(value);
    const key = taxonomyKey(name);

    if (!name || seen.has(key)) {
      continue;
    }

    seen.add(key);
    next.push(name);
  }

  return next;
}
