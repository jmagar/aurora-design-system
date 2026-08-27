"use client"

import * as React from "react"
import {
  Activity,
  Bell,
  BookOpen,
  Boxes,
  ExternalLink,
  Grid2X2,
  HardDrive,
  Layers3,
  Network,
  Package,
  Palette,
  Puzzle,
  Search,
  ShieldCheck,
  Terminal as TerminalIcon,
  Wifi,
  Workflow,
} from "lucide-react"

import { Badge, type BadgeTone } from "@/registry/aurora/ui/badge"
import { Button } from "@/registry/aurora/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/aurora/ui/card"
import { CopyButton } from "@/registry/aurora/ui/copy-button"
import { Kbd } from "@/registry/aurora/ui/kbd"
import { Segmented } from "@/registry/aurora/ui/segmented"
import { StatCard, StatGrid } from "@/registry/aurora/ui/stat-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/aurora/ui/table"
import {
  CommandPalette,
  useCommandPalette,
  type CommandItem,
} from "@/registry/aurora/blocks/workspace/command-palette/command-palette"
import { CodeBlock, CodeChip } from "@/registry/aurora/blocks/workspace/code-block/code-block"
import { Terminal } from "@/registry/aurora/blocks/navigation/terminal/terminal"

import {
  categories,
  githubUrl,
  npmUrl,
  servers,
  type ServerCategory,
  type ServerEntry,
} from "./servers"

type ViewMode = "cards" | "table"

const categoryIcons = {
  Platform: Layers3,
  Observability: Activity,
  Notifications: Bell,
  Network: Wifi,
  Infrastructure: HardDrive,
  Media: Boxes,
} satisfies Record<ServerCategory, typeof Layers3>

const categoryTones = {
  Platform: "cyan",
  Observability: "info",
  Notifications: "rose",
  Network: "success",
  Infrastructure: "warn",
  Media: "neutral",
} satisfies Record<ServerCategory, BadgeTone>

const heroNodes = [
  { id: "labby", x: "58%", y: "18%", core: true },
  { id: "soma", x: "80%", y: "30%" },
  { id: "cortex", x: "38%", y: "34%" },
  { id: "apprise", x: "86%", y: "56%" },
  { id: "gotify", x: "64%", y: "76%" },
  { id: "unifi", x: "24%", y: "56%" },
  { id: "tailscale", x: "44%", y: "66%" },
  { id: "unraid", x: "90%", y: "12%" },
  { id: "arcane", x: "16%", y: "80%" },
  { id: "synapse", x: "50%", y: "44%" },
  { id: "yarr", x: "30%", y: "12%" },
  { id: "ytdl", x: "12%", y: "30%" },
] as const

const installCommand = (server: ServerEntry) => `npx -y ${server.packageName} mcp`

const terminalLines = [
  { text: "npx -y yarr-mcp mcp", type: "command" as const },
  { text: "yarr stdio MCP server listening", type: "muted" as const },
  { text: "npx -y unifi-rmcp health --json", type: "command" as const },
  { text: "controller reachable, env ok", type: "success" as const },
  { text: "npx -y apprise-rmcp mcp", type: "command" as const },
  { text: "notification actions exposed over MCP", type: "muted" as const },
]

const clientConfigCode = `{
  "mcpServers": {
    "yarr": {
      "command": "npx",
      "args": ["-y", "yarr-mcp", "mcp"]
    }
  }
}`

const registryInstallCode = `# tokens first, then any component
npx shadcn@latest add https://dinglebear.ai/r/aurora-tokens.json
npx shadcn@latest add https://dinglebear.ai/r/aurora-button.json`

const paletteSections = [
  { id: "servers", label: "Servers" },
  { id: "sections", label: "Sections" },
  { id: "design", label: "Design System" },
  { id: "external", label: "External" },
]

function scrollToHash(hash: string) {
  document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function DinglebearFleetPage({ registryCount }: { registryCount: number }) {
  const [category, setCategory] = React.useState<"All" | ServerCategory>("All")
  const [viewMode, setViewMode] = React.useState<ViewMode>("cards")
  const palette = useCommandPalette()
  const { setOpen: setPaletteOpen } = palette

  const visibleServers = React.useMemo(
    () =>
      category === "All"
        ? servers
        : servers.filter((server) => server.category === category),
    [category],
  )

  const categoryCounts = React.useMemo(
    () =>
      Object.fromEntries(
        categories.map((item) => [
          item,
          item === "All"
            ? servers.length
            : servers.filter((server) => server.category === item).length,
        ]),
      ) as Record<(typeof categories)[number], number>,
    [],
  )

  const paletteItems = React.useMemo<CommandItem[]>(() => {
    const serverItems = servers.map((server) => {
      const Icon = categoryIcons[server.category]
      return {
        id: `server-${server.id}`,
        label: server.name,
        description: `${server.mcpName} — ${server.packageName}`,
        section: "servers",
        icon: <Icon size={14} aria-hidden="true" />,
        onSelect: () => {
          window.open(githubUrl(server.repo), "_blank", "noopener,noreferrer")
          setPaletteOpen(false)
        },
      }
    })

    const sectionItems = [
      { id: "section-fleet", label: "Fleet", description: "Published MCP servers", hash: "#fleet", icon: <Grid2X2 size={14} aria-hidden="true" /> },
      { id: "section-install", label: "Install", description: "npm and MCP client config", hash: "#install", icon: <Package size={14} aria-hidden="true" /> },
      { id: "section-stack", label: "Stack", description: "Runtime and safety model", hash: "#stack", icon: <Workflow size={14} aria-hidden="true" /> },
    ].map(({ hash, ...item }) => ({
      ...item,
      section: "sections",
      onSelect: () => {
        setPaletteOpen(false)
        scrollToHash(hash)
      },
    }))

    const designItems = [
      { id: "design-gallery", label: "Gallery", description: "Browse Aurora primitives and blocks as live component demos", path: "/gallery", icon: <Grid2X2 size={14} aria-hidden="true" /> },
      { id: "design-themes", label: "Themes", description: "Aurora palettes for editors, terminals, browsers, shells", path: "/themes", icon: <Palette size={14} aria-hidden="true" /> },
      { id: "design-docs", label: "Docs", description: "Install, foundations, theming", path: "/docs", icon: <BookOpen size={14} aria-hidden="true" /> },
      { id: "design-plugins", label: "Plugins", description: "dendrite marketplace for Claude, Codex, and Gemini", path: "/plugins", icon: <Puzzle size={14} aria-hidden="true" /> },
    ].map(({ path, ...item }) => ({
      ...item,
      section: "design",
      onSelect: () => {
        setPaletteOpen(false)
        window.location.assign(path)
      },
    }))

    const externalItems = [
      {
        id: "external-npm",
        label: "npm Packages",
        description: "Search npm for the fleet",
        href: "https://www.npmjs.com/search?q=keywords%3Amodel-context-protocol%20dinglebear",
      },
      {
        id: "external-github",
        label: "github.com/jmagar",
        description: "Source repositories",
        href: "https://github.com/jmagar",
      },
    ].map(({ href, ...item }) => ({
      ...item,
      section: "external",
      icon: <ExternalLink size={14} aria-hidden="true" />,
      onSelect: () => {
        window.open(href, "_blank", "noopener,noreferrer")
        setPaletteOpen(false)
      },
    }))

    return [...serverItems, ...sectionItems, ...designItems, ...externalItems]
  }, [setPaletteOpen])

  return (
    <div className="min-h-screen">
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "color-mix(in srgb, var(--aurora-nav-bg) 84%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderColor: "var(--aurora-border-default)",
        }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <a href="#top" className="flex items-center gap-2.5" aria-label="dinglebear.ai home">
            <DinglebearMark />
            <Wordmark />
          </a>
          <nav className="hidden items-center gap-5 sm:flex" aria-label="Sections">
            {[
              ["#fleet", "Fleet"],
              ["#install", "Install"],
              ["#design", "Design System"],
              ["/gallery", "Gallery"],
              ["/plugins", "Plugins"],
              ["/themes", "Themes"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="aurora-text-ui transition-colors"
                style={{ color: "var(--aurora-text-muted)" }}
              >
                {label}
              </a>
            ))}
          </nav>
          <Button variant="neutral" size="sm" onClick={() => setPaletteOpen(true)}>
            <Search size={14} aria-hidden="true" />
            Search
            <Kbd variant="ghost">⌘K</Kbd>
          </Button>
        </div>
      </header>

      <main id="top" className="mx-auto w-full max-w-6xl px-6">
        <section
          className="grid items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20"
          aria-labelledby="hero-title"
        >
          <div className="flex flex-col gap-5">
            <p className="aurora-text-eyebrow" style={{ color: "var(--aurora-accent-strong)" }}>
              Operator-grade Rust MCP stack
            </p>
            <h1 id="hero-title" className="aurora-text-display-1">
              dinglebear.ai
            </h1>
            <p className="aurora-text-lead max-w-xl" style={{ color: "var(--aurora-text-muted)" }}>
              Published Rust MCP servers for the workflows agents actually touch: homelab,
              media, network, infrastructure, notifications, observability, and
              provider-runtime automation.
            </p>
            <div className="flex flex-wrap items-center gap-3" aria-label="Primary actions">
              <Button variant="aurora" asChild>
                <a href="#fleet">
                  <Grid2X2 size={15} aria-hidden="true" />
                  Browse Servers
                </a>
              </Button>
              <Button variant="neutral" asChild>
                <a href="https://github.com/jmagar" target="_blank" rel="noreferrer">
                  <ExternalLink size={15} aria-hidden="true" />
                  Source
                </a>
              </Button>
            </div>
            <StatGrid className="pt-4" aria-label="Fleet stats">
              <StatCard compact label="Registry Names" value={servers.length} />
              <StatCard compact label="npm Wrappers" value={servers.length} />
              <StatCard compact label="Install Path" value="npx" />
              <StatCard compact label="Runtime" value="Rust" />
            </StatGrid>
          </div>

          <div className="db-radar" aria-hidden="true">
            <div className="db-ring db-ring--a" />
            <div className="db-ring db-ring--b" />
            <div className="db-ring db-ring--c" />
            <div className="db-trace db-trace--one" />
            <div className="db-trace db-trace--two" />
            {heroNodes.map((node, index) => (
              <span
                key={node.id}
                className={"core" in node && node.core ? "db-node db-node--core" : "db-node"}
                style={
                  {
                    "--x": node.x,
                    "--y": node.y,
                    "--delay": `${index * 120}ms`,
                  } as React.CSSProperties
                }
              >
                {servers.find((entry) => entry.id === node.id)?.shortName}
              </span>
            ))}
          </div>
        </section>

        <section
          className="flex flex-col gap-4 rounded-[var(--aurora-radius-2)] border px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background: "var(--aurora-panel-medium)",
            borderColor: "var(--aurora-border-default)",
            boxShadow: "var(--aurora-shadow-medium), var(--aurora-highlight-medium)",
          }}
          aria-label="Install summary"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Package size={16} aria-hidden="true" style={{ color: "var(--aurora-accent-strong)" }} />
            <span className="aurora-text-body-sm" style={{ color: "var(--aurora-text-muted)" }}>
              Every listed package exposes stdio MCP with
            </span>
            <CodeChip>npx -y &lt;package&gt; mcp</CodeChip>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} aria-hidden="true" style={{ color: "var(--aurora-success)" }} />
            <span className="aurora-text-body-sm" style={{ color: "var(--aurora-text-muted)" }}>
              HTTP mode stays local unless you explicitly deploy it.
            </span>
          </div>
        </section>

        <section id="fleet" className="scroll-mt-20 py-16" aria-labelledby="fleet-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="aurora-text-eyebrow" style={{ color: "var(--aurora-accent-strong)" }}>
                Published fleet
              </p>
              <h2 id="fleet-title" className="aurora-text-display-2">
                Servers
              </h2>
            </div>
            <Segmented
              size="sm"
              aria-label="Fleet view"
              value={viewMode}
              onValueChange={(value) => setViewMode(value as ViewMode)}
              options={[
                { value: "cards", label: "Cards" },
                { value: "table", label: "Table" },
              ]}
            />
          </div>

          <div className="mt-6 overflow-x-auto pb-1">
            <Segmented
              size="sm"
              aria-label="Filter by category"
              value={category}
              onValueChange={(value) => setCategory(value as "All" | ServerCategory)}
              options={categories.map((item) => ({
                value: item,
                label: `${item} · ${categoryCounts[item]}`,
              }))}
            />
          </div>

          {viewMode === "cards" ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleServers.map((server) => (
                <ServerCard key={server.id} server={server} />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <FleetTable servers={visibleServers} />
            </div>
          )}
        </section>

        <section id="install" className="scroll-mt-20 pb-16" aria-labelledby="install-title">
          <div className="flex flex-col gap-2">
            <p className="aurora-text-eyebrow" style={{ color: "var(--aurora-accent-strong)" }}>
              Client setup
            </p>
            <h2 id="install-title" className="aurora-text-display-2">
              Install by npm Package or MCP Config
            </h2>
          </div>

          <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
            <Terminal title="~/dinglebear/mcp" status="connected" lines={terminalLines} />
            <div className="flex flex-col gap-4">
              <CodeBlock code={clientConfigCode} language="json" filename="mcp-client.json" />
              <p className="aurora-text-body-sm" style={{ color: "var(--aurora-text-muted)" }}>
                Use the package name as the npx target and pass <CodeChip>mcp</CodeChip>. Add
                service env vars to the client config only when that server needs upstream
                credentials. The npm launcher downloads the matching Rust binary during
                install.
              </p>
            </div>
          </div>
        </section>

        <section id="design" className="scroll-mt-20 pb-16" aria-labelledby="design-title">
          <div className="flex flex-col gap-2">
            <p className="aurora-text-eyebrow" style={{ color: "var(--aurora-accent-strong)" }}>
              Design system
            </p>
            <h2 id="design-title" className="aurora-text-display-2">
              Home of the Aurora Design System
            </h2>
            <p
              className="aurora-text-body max-w-2xl"
              style={{ color: "var(--aurora-text-muted)" }}
            >
              dinglebear.ai also serves Aurora: a shadcn-compatible component registry with
              {" "}{registryCount} items, a live component gallery, and theme packs for
              editors, terminals, browsers, and shells.
            </p>
          </div>

          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
            <CodeBlock code={registryInstallCode} language="bash" filename="install.sh" />
            <div className="grid gap-4 sm:grid-cols-2">
              <DesignCard
                href="/gallery"
                icon={<Grid2X2 size={17} aria-hidden="true" />}
                title="Gallery"
                body="Browse primitives and product blocks as live Aurora demos."
              />
              <DesignCard
                href="/themes"
                icon={<Palette size={17} aria-hidden="true" />}
                title="Themes"
                body="Aurora palettes for Zed, Warp, Chrome, and shell tools."
              />
              <DesignCard
                href="/docs"
                icon={<BookOpen size={17} aria-hidden="true" />}
                title="Docs"
                body="Install, foundations, and theming guides."
              />
              <DesignCard
                href="/plugins"
                icon={<Puzzle size={17} aria-hidden="true" />}
                title="Plugins"
                body="dendrite marketplace for Claude, Codex, and Gemini."
              />
            </div>
          </div>
        </section>

        <section id="stack" className="scroll-mt-20 pb-16" aria-labelledby="stack-title">
          <div className="flex flex-col gap-2">
            <p className="aurora-text-eyebrow" style={{ color: "var(--aurora-accent-strong)" }}>
              Runtime contract
            </p>
            <h2 id="stack-title" className="aurora-text-display-2">
              Same Operating Model Across the Fleet
            </h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StackCard
              icon={<Workflow size={17} aria-hidden="true" />}
              title="One Service Tool"
              body="Each server keeps MCP discovery small: one service tool dispatches a typed action surface instead of exposing hundreds of top-level tools."
            />
            <StackCard
              icon={<TerminalIcon size={17} aria-hidden="true" />}
              title="CLI Parity"
              body="The same Rust binary serves MCP and exposes scriptable CLI commands, so failures are reproducible outside an agent session."
            />
            <StackCard
              icon={<Network size={17} aria-hidden="true" />}
              title="stdio First"
              body="The npm wrappers are designed for local MCP clients through stdio, with HTTP mode available for controlled deployments."
            />
            <StackCard
              icon={<ShieldCheck size={17} aria-hidden="true" />}
              title="Scoped Safety"
              body="Destructive and admin-oriented operations live behind service policy, explicit env configuration, and runtime auth boundaries."
            />
          </div>
        </section>
      </main>

      <footer
        className="border-t"
        style={{ borderColor: "var(--aurora-border-default)", background: "var(--aurora-nav-bg)" }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <a href="#top" className="flex items-center gap-2.5" aria-label="Back to top">
            <DinglebearMark />
            <Wordmark />
          </a>
          <nav className="flex flex-wrap items-center gap-4" aria-label="Footer">
            {[
              ["#fleet", "Fleet", undefined],
              ["#install", "Install", undefined],
              ["/gallery", "Gallery", undefined],
              ["/plugins", "Plugins", undefined],
              ["/themes", "Themes", undefined],
              ["/docs", "Docs", undefined],
              ["https://github.com/jmagar", "GitHub", "noreferrer"],
              ["https://www.npmjs.com/~jmagar", "npm", "noreferrer"],
            ].map(([href, label, rel]) => (
              <a
                key={label}
                href={href}
                rel={rel}
                target={rel ? "_blank" : undefined}
                className="aurora-text-ui"
                style={{ color: "var(--aurora-text-muted)" }}
              >
                {label}
              </a>
            ))}
          </nav>
          <p className="aurora-text-meta" style={{ color: "var(--aurora-text-muted)" }}>
            Published MCP servers. Rust binaries. npm launchers.
          </p>
        </div>
      </footer>

      <CommandPalette
        open={palette.open}
        onOpenChange={palette.onOpenChange}
        items={paletteItems}
        sections={paletteSections}
        placeholder="Search servers, packages, sections…"
      />
    </div>
  )
}

function ServerCard({ server }: { server: ServerEntry }) {
  const Icon = categoryIcons[server.category]
  const command = installCommand(server)

  return (
    <Card interactive className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <span
            className="flex size-9 items-center justify-center rounded-[10px] border"
            style={{
              background: "var(--aurora-control-surface)",
              borderColor: "var(--aurora-border-default)",
              color: "var(--aurora-accent-strong)",
            }}
            aria-hidden="true"
          >
            <Icon size={17} />
          </span>
          <Badge tone={categoryTones[server.category]}>{server.category}</Badge>
        </div>
        <CardTitle className="pt-2">{server.name}</CardTitle>
        <CardDescription>{server.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col gap-4">
        <p className="aurora-text-caption" style={{ color: "var(--aurora-accent-strong)" }}>
          {server.highlight}
        </p>
        <div className="flex flex-wrap gap-1.5" aria-label={`${server.name} capabilities`}>
          {server.capabilities.map((capability) => (
            <Badge key={capability} tone="neutral" fill="outline">
              {capability}
            </Badge>
          ))}
        </div>
        <div
          className="flex items-center justify-between gap-2 rounded-[10px] border px-3 py-2"
          style={{
            background: "var(--aurora-control-surface)",
            borderColor: "var(--aurora-border-default)",
          }}
        >
          <code
            className="aurora-text-code truncate"
            style={{ color: "var(--aurora-text-primary)" }}
          >
            {command}
          </code>
          <CopyButton value={command} aria-label={`Copy ${server.packageName} install command`} />
        </div>
        <dl className="flex flex-col gap-1.5">
          {[
            ["Registry", server.mcpName],
            ["npm", `${server.packageName}@${server.version}`],
            ["Binary", server.binary],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-3">
              <dt className="aurora-text-meta" style={{ color: "var(--aurora-text-muted)" }}>
                {label}
              </dt>
              <dd className="aurora-text-caption truncate" style={{ color: "var(--aurora-text-primary)" }}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href={npmUrl(server.packageName)} target="_blank" rel="noreferrer">
              npm
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href={githubUrl(server.repo)} target="_blank" rel="noreferrer">
              GitHub
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function FleetTable({ servers: visibleServers }: { servers: ServerEntry[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Server</TableHead>
          <TableHead>Registry</TableHead>
          <TableHead>npm</TableHead>
          <TableHead>Binary</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Source</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visibleServers.map((server) => (
          <TableRow key={server.id}>
            <TableCell style={{ color: "var(--aurora-text-primary)", fontWeight: 560 }}>
              {server.name}
            </TableCell>
            <TableCell>{server.mcpName}</TableCell>
            <TableCell>
              <a
                href={npmUrl(server.packageName)}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--aurora-accent-strong)" }}
              >
                {server.packageName}@{server.version}
              </a>
            </TableCell>
            <TableCell>{server.binary}</TableCell>
            <TableCell>
              <Badge tone={categoryTones[server.category]}>{server.category}</Badge>
            </TableCell>
            <TableCell>
              <a
                href={githubUrl(server.repo)}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--aurora-accent-strong)" }}
              >
                {server.repo}
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function DesignCard({
  href,
  icon,
  title,
  body,
}: {
  href: string
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <a href={href} className="block focus-visible:outline-none">
      <Card interactive elevated={false} className="h-full">
        <CardHeader>
          <span
            className="flex size-9 items-center justify-center rounded-[10px] border"
            style={{
              background: "var(--aurora-control-surface)",
              borderColor: "var(--aurora-border-default)",
              color: "var(--aurora-accent-strong)",
            }}
            aria-hidden="true"
          >
            {icon}
          </span>
          <CardTitle className="pt-2">{title}</CardTitle>
          <CardDescription>{body}</CardDescription>
        </CardHeader>
      </Card>
    </a>
  )
}

function StackCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <Card elevated={false}>
      <CardHeader>
        <span
          className="flex size-9 items-center justify-center rounded-[10px] border"
          style={{
            background: "var(--aurora-control-surface)",
            borderColor: "var(--aurora-border-default)",
            color: "var(--aurora-accent-strong)",
          }}
          aria-hidden="true"
        >
          {icon}
        </span>
        <CardTitle className="pt-2">{title}</CardTitle>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function Wordmark() {
  return (
    <span
      className="aurora-text-section"
      style={{ letterSpacing: "-0.01em", color: "var(--aurora-text-primary)" }}
    >
      dinglebear
      <span style={{ color: "var(--aurora-accent-pink)" }}>.ai</span>
    </span>
  )
}

function DinglebearMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 48 48" role="img" aria-label="dinglebear.ai mark">
      <g transform="translate(0 1)">
        <path d="M8 13 24 7l16 6-16 6L8 13Z" fill="var(--aurora-border-strong)" />
        <path d="M8 21 24 15l16 6-16 6L8 21Z" fill="var(--aurora-accent-deep)" />
        <path d="M8 29 24 23l16 6-16 6L8 29Z" fill="var(--aurora-accent-primary)" />
        <path d="M8 37 24 31l16 6-16 6L8 37Z" fill="var(--aurora-accent-strong)" />
      </g>
    </svg>
  )
}
