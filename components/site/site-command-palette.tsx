"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Blocks,
  BookOpen,
  Feather,
  Globe,
  House,
  LayoutGrid,
  Monitor,
  Palette,
  SlidersHorizontal,
  Puzzle,
} from "lucide-react"
import {
  CommandPalette,
  type CommandItem,
} from "@/registry/aurora/blocks/workspace/command-palette/command-palette"
import catalog from "@/lib/client-catalog.json"
import { AURORA_THEMES } from "@/lib/themes"
import { fuzzy } from "@/lib/fuzzy"

/**
 * Site-wide ⌘K palette — ported from the CD `aurora-site` app shell. Search
 * spans the site pages, every gallery component, and the theme catalog, so it
 * can never drift: components come from the gallery NAV, themes from
 * `lib/themes.ts`.
 */

const SECTIONS = [
  { id: "pages", label: "Go To" },
  { id: "components", label: "Components" },
  { id: "themes", label: "Themes" },
]

const PAGE_ITEMS: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: "Overview", href: "/", icon: <House size={15} strokeWidth={1.6} /> },
  { label: "Gallery", href: "/gallery", icon: <Blocks size={15} strokeWidth={1.6} /> },
  { label: "Themes", href: "/themes", icon: <Palette size={15} strokeWidth={1.6} /> },
  { label: "Plugins", href: "/plugins", icon: <Puzzle size={15} strokeWidth={1.6} /> },
  { label: "Tokens", href: "/tokens", icon: <SlidersHorizontal size={15} strokeWidth={1.6} /> },
  { label: "Icons", href: "/icons", icon: <LayoutGrid size={15} strokeWidth={1.6} /> },
  { label: "Docs", href: "/docs", icon: <BookOpen size={15} strokeWidth={1.6} /> },
]

const THEME_ICONS = {
  editors: <Monitor size={15} strokeWidth={1.6} />,
  browser: <Globe size={15} strokeWidth={1.6} />,
  shell: <Feather size={15} strokeWidth={1.6} />,
} as const

function score(query: string, item: CommandItem): number {
  return Math.max(fuzzy(query, item.label), fuzzy(query, item.description ?? "") * 0.7)
}

export function SiteCommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()

  const items = React.useMemo<CommandItem[]>(() => {
    const go = (href: string) => () => router.push(href)
    return [
      ...PAGE_ITEMS.map((p) => ({
        id: `page-${p.href}`,
        label: p.label,
        description: p.href,
        section: "pages",
        icon: p.icon,
        onSelect: go(p.href),
      })),
      // Components open in the canonical /gallery drawer (deep-linked via ?c=…),
      // keeping search, filtering, and focused preview in one browsing surface.
      ...catalog.items.map((it) => ({
          id: `comp-${it.slug}`,
          label: it.label,
          description: it.group,
          section: "components",
          icon: <Blocks size={15} strokeWidth={1.6} />,
          onSelect: go(`/gallery?c=${it.slug}`),
        })),
      ...AURORA_THEMES.map((t) => ({
        id: `theme-${t.id}`,
        label: `${t.name} — ${t.tool}`,
        description: t.category,
        section: "themes",
        icon: THEME_ICONS[t.category],
        onSelect: go("/themes"),
      })),
    ]
  }, [router])

  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      items={items}
      sections={SECTIONS}
      placeholder="Search components, themes, pages…"
      filter={score}
    />
  )
}
