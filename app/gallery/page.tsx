import * as React from "react"

import { ComponentCatalog } from "@/components/site/component-catalog"
import { getKotlinMap } from "@/lib/kotlin-map"

export const metadata = {
  title: "Gallery — Aurora Design System",
  description:
    "Browse every Aurora component in one scrollable live gallery, with fuzzy search, category filters, platform flavors, and interactive previews.",
}

export default function GalleryIndex() {
  return (
    <div className="pb-8 pt-1">
      <ComponentCatalog heading="Gallery" headingLevel={1} kotlinMap={getKotlinMap()} syncUrl />
    </div>
  )
}
