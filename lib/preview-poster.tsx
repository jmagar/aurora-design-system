"use client"

import * as React from "react"

/**
 * True while a demo renders as a catalog *poster* — the scaled, aria-hidden,
 * pointer-events:none thumbnail in a /gallery tile.
 *
 * Demos open their overlays by default so the gallery and the detail drawer
 * show the component in its interesting state. In a tile that backfires: Radix
 * treats an open overlay as modal and locks the whole document (overflow:hidden
 * + pointer-events:none on <body>), so scrolling one auto-open tile into view
 * freezes the entire catalog. Radix Select has no `modal` prop to opt out of,
 * so the only fix is not to open it here.
 *
 * A poster is never interacted with, so nothing is lost by rendering it closed.
 * Only the tile preview sets this — the drawer wants the open state.
 */
export const PreviewPosterContext = React.createContext(false)

export function usePreviewPoster(): boolean {
  return React.useContext(PreviewPosterContext)
}
