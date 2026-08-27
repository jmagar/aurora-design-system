import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import test from "node:test"

import { GALLERY_GROUPS } from "../app/gallery/catalog-data.ts"
import { SLUG_TO_REGISTRY, slugToRegistry } from "../lib/slug-map.ts"

// ---------------------------------------------------------------------------
// Consistency gate for the gallery slug universe.
//
// The gallery slug space is spread across several hand-maintained maps that can
// silently drift apart:
//   - lib/slug-map.ts        SLUG_TO_REGISTRY + slugToRegistry (slug → registry name)
//   - app/gallery/catalog-data.ts  GALLERY_GROUPS (browser grouping + order)
//   - app/gallery/[section]/page.tsx  DEMOS (routable demo pages)
//   - registry.json / public/r/<name>.json  the actual registry items
//
// This test wires those maps together and fails if a NAV entry points at a
// non-existent demo, a demo can't be resolved to a registry item, or a resolved
// item has no built public/r artifact.
// ---------------------------------------------------------------------------

function loadDemoKeys(): Set<string> {
  const manifest = JSON.parse(readFileSync(new URL("../lib/gallery-manifest.json", import.meta.url), "utf8")) as Record<string, string>
  return new Set(Object.keys(manifest))
}

const DEMO_KEYS = loadDemoKeys()

// Parse-floor tripwire: the demo keys are extracted from demo-map.tsx by regex, so a
// refactor that breaks the regex could yield an empty set and make every
// consistency assertion below pass vacuously. The real count is ~140; a floor of
// 50 catches a broken parser without being brittle to normal churn.
assert.ok(
  DEMO_KEYS.size > 50,
  `demo-key parse likely broke — found ${DEMO_KEYS.size} keys, expected far more`,
)

const REGISTRY_NAMES: Set<string> = new Set(
  (JSON.parse(
    readFileSync(new URL("../registry.json", import.meta.url), "utf8"),
  ) as { items: Array<{ name: string }> }).items.map((item) => item.name),
)

function hasBuiltArtifact(name: string): boolean {
  return existsSync(
    fileURLToPath(new URL(`../public/r/${name}.json`, import.meta.url)),
  )
}

// Intentional non-registry demo pages. These are routable gallery pages that
// deliberately have no corresponding registry item (and therefore no install
// strip). Keep this list small — if a real component slug shows up here, that's
// drift to fix at the source, not to hide behind the allowlist.
const NON_REGISTRY_DEMOS = new Set<string>([
  "new-components", // changelog-style overview page, not an installable component
])

test("every Gallery catalog slug resolves to a routable demo", () => {
  const orphans: string[] = []
  for (const group of GALLERY_GROUPS) {
    for (const item of group.items) {
      if (!DEMO_KEYS.has(item.slug)) orphans.push(item.slug)
    }
  }
  assert.deepEqual(
    orphans,
    [],
    `Gallery catalog slugs with no matching DEMOS entry: ${orphans.join(", ")}`,
  )
})

test("every routable demo resolves to a real registry item name", () => {
  const unresolved: string[] = []
  for (const key of DEMO_KEYS) {
    if (NON_REGISTRY_DEMOS.has(key)) continue
    const name = slugToRegistry(key)
    if (name === null) {
      unresolved.push(key)
    } else if (!REGISTRY_NAMES.has(name)) {
      unresolved.push(`${key} → ${name} (not in registry.json)`)
    }
  }
  assert.deepEqual(
    unresolved,
    [],
    `DEMOS keys that do not resolve to a registry item: ${unresolved.join(", ")}`,
  )
})

test("every resolved registry name has a built public/r artifact", () => {
  const missing: string[] = []
  // Cover both the demo-resolved names and every SLUG_TO_REGISTRY target.
  const names = new Set<string>(Object.values(SLUG_TO_REGISTRY))
  for (const key of DEMO_KEYS) {
    if (NON_REGISTRY_DEMOS.has(key)) continue
    const name = slugToRegistry(key)
    if (name) names.add(name)
  }
  for (const name of names) {
    if (!hasBuiltArtifact(name)) {
      missing.push(name)
    }
  }
  assert.deepEqual(
    missing,
    [],
    `registry names with no public/r/<name>.json file: ${missing.join(", ")}`,
  )
})
