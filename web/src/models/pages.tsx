import type { LinkProps } from "@tanstack/react-router"
import { CirclePile, Folder, Sheet } from "lucide-react"

const PAGE_TITLES = ["index", "exports", "suppliers"] as const

type PageTitle = (typeof PAGE_TITLES)[number]

const PAGE_TITLE_LABELS: Record<PageTitle, string> = {
  index: "Hòm thư",
  exports: "Xuất dữ liệu",
  suppliers: "Nhà cung cấp",
}

type Page = {
  title: PageTitle
  to: LinkProps["to"]
  icon: React.ReactNode
}

const PAGES: Page[] = [
  {
    title: "index",
    to: "/app",
    icon: <Folder />,
  },
  {
    title: "exports",
    to: "/app/exports",
    icon: <Sheet />,
  },
  {
    title: "suppliers",
    to: "/app/suppliers",
    icon: <CirclePile />,
  },
]

export { PAGE_TITLE_LABELS, PAGES }
export type { Page }
