#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs"

import { GALLERY_GROUPS } from "../app/gallery/catalog-data.ts"
import { slugToRegistry } from "../lib/slug-map.ts"

const registry = JSON.parse(readFileSync(new URL("../registry.json", import.meta.url), "utf8"))
const byName = new Map(registry.items.map((item) => [item.name, item]))
const groups = GALLERY_GROUPS.map((group) => group.group)
const items = GALLERY_GROUPS.flatMap((group) => group.items.map((catalogItem) => {
  const name = slugToRegistry(catalogItem.slug)
  const item = name ? byName.get(name) : undefined
  return {
    slug: catalogItem.slug,
    label: catalogItem.label,
    group: group.group,
    description: item?.description ?? "",
    registry: item?.name ?? null,
    installUrl: item ? `https://aurora.tootie.tv/r/${item.name}.json` : null,
  }
}))

const output = {
  schemaVersion: 1,
  counts: { registryItems: registry.items.length, catalogItems: items.length, groups: groups.length },
  groups,
  items,
}
const outputUrl = new URL("../lib/client-catalog.json", import.meta.url)
const outputText = `${JSON.stringify(output, null, 2)}\n`
if (process.argv.includes("--check")) {
  if (readFileSync(outputUrl, "utf8") !== outputText) throw new Error("Client catalog is stale; run pnpm catalog:generate")
} else {
  writeFileSync(outputUrl, outputText)
}
console.log(`Generated compact client catalog: ${items.length} entries (${Buffer.byteLength(JSON.stringify(output))} bytes).`)
