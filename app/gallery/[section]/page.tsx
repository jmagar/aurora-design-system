import * as React from "react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import galleryManifest from "@/lib/gallery-manifest.json"
import { formatSectionTitle, getRegistryMeta, SECTION_REDIRECTS } from "@/lib/registry-meta"
import { ComponentInstall } from "@/components/component-install"


export function generateStaticParams() {
  // Build-time assertion: every DEMOS key that is not a redirect alias must
  // resolve to registry meta, otherwise the rendered page silently renders
  // without an install strip and there is no warning anywhere near the cause.
  //
  // Redirect keys (SECTION_REDIRECTS) are intentional aliases that never render
  // a full page — they are exempt. All other keys must be in the registry.
  const unmapped: string[] = []
  for (const slug of Object.keys(galleryManifest)) {
    if (slug in SECTION_REDIRECTS) continue
    if (slug === "new-components") continue
    if (getRegistryMeta(slug) === null) unmapped.push(slug)
  }
  if (unmapped.length > 0) {
    const msg =
      `[aurora/gallery] ${unmapped.length} DEMOS slug(s) have no registry meta — ` +
      `these pages will render without an install strip:\n` +
      unmapped.map((s) => `  • ${s}`).join("\n") +
      `\nAdd each to lib/slug-map.ts or registry.json to fix.`
    if (process.env.NODE_ENV === "production") {
      // Fail the build so the issue is caught before deployment.
      throw new Error(msg)
    } else {
      console.warn(msg)
    }
  }

  return Object.keys(galleryManifest).map((section) => ({ section }))
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  const redirectTarget = SECTION_REDIRECTS[section]
  if (redirectTarget) redirect(`/gallery/${redirectTarget}`)

  if (!(section in galleryManifest)) notFound()
  const { default: Demo } = await import(`../entries/${section}`)

  const meta = getRegistryMeta(section)
  const title = formatSectionTitle(section)

  return (
    <div className="aurora-gallery-page grid gap-8">
      <header className="grid gap-4" style={{ width: "min(760px, 100%)", minWidth: 0 }}>
        <div>
          <p
            className="aurora-text-eyebrow flex items-center gap-1.5"
            style={{ margin: "0 0 6px", color: "var(--aurora-text-muted)" }}
          >
            <Link href="/gallery" style={{ color: "var(--aurora-accent-strong)" }}>
              Gallery
            </Link>
            <span aria-hidden="true">/</span>
            <span>Component</span>
          </p>
          <h1
            className="aurora-text-display-1"
            style={{ margin: 0, color: "var(--aurora-text-primary)", textWrap: "balance" }}
          >
            {title}
          </h1>
        </div>
      </header>
      <section className="aurora-gallery-demo-region" data-section={section}>
        <Demo />
      </section>
      {meta && (
        // ComponentInstall is a client component (clipboard support requires browser APIs).
        // The install strip adds minimal JS — clipboard handling only activates on user interaction.
        <section className="aurora-gallery-install-region" aria-label={`${title} install`}>
          <ComponentInstall meta={meta} />
        </section>
      )}
    </div>
  )
}
