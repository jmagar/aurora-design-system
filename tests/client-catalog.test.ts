import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import { GALLERY_GROUPS } from "../app/gallery/catalog-data.ts"

test("compact client catalog is complete, neutral, and materially smaller than registry", () => {
  const catalogRaw = readFileSync(new URL("../lib/client-catalog.json", import.meta.url), "utf8")
  const registryRaw = readFileSync(new URL("../registry.json", import.meta.url), "utf8")
  const catalog = JSON.parse(catalogRaw) as { counts: { registryItems: number; catalogItems: number }; items: Array<{ slug: string }> }
  const expectedSlugs = GALLERY_GROUPS.flatMap((group) => group.items.map((item) => item.slug))
  assert.equal(catalog.counts.catalogItems, expectedSlugs.length)
  assert.equal(catalog.items.length, expectedSlugs.length)
  assert.deepEqual(catalog.items.map((item) => item.slug), expectedSlugs)
  assert.ok(catalogRaw.length < registryRaw.length * 0.35, `${catalogRaw.length} should be less than 35% of ${registryRaw.length}`)
  const catalogKeys = new Set<string>()
  JSON.stringify(catalog, (key, value) => {
    if (key) catalogKeys.add(key)
    return value
  })
  assert.equal(catalogKeys.has("registryDependencies"), false)
  assert.equal(catalogKeys.has("files"), false)
})
