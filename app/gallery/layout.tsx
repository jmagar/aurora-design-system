import * as React from "react"

import { SiteShell } from "@/components/site/site-shell"

/** Gallery uses the same site chrome as the rest of Aurora. Component browsing
 * lives inside the catalog itself; a second permanent navigation rail only
 * duplicates search/category navigation and steals preview width. */
export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
