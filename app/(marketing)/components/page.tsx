import { redirect } from "next/navigation"

export const metadata = {
  title: "Gallery — Aurora Design System",
  description: "Aurora component browsing now lives in the Gallery.",
}

type LegacySearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function ComponentsPage({ searchParams }: { searchParams: LegacySearchParams }) {
  const legacy = await searchParams
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(legacy)) {
    if (Array.isArray(value)) value.forEach((entry) => params.append(key, entry))
    else if (value != null) params.set(key, value)
  }

  const query = params.toString()
  redirect(`/gallery${query ? `?${query}` : ""}`)
}
