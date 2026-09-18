import type { LinkProps } from "@tanstack/react-router"
import { CirclePile, Folder, Sheet } from "lucide-react"

type Page = {
  title: string
  to: LinkProps["to"]
  icon: React.ReactNode
}

export const PAGES: Page[] = [
  {
    title: "Hòm thư",
    to: "/app",
    icon: <Folder />,
  },
  {
    title: "Xuất dữ liệu",
    to: "/app/exports",
    icon: <Sheet />,
  },
  {
    title: "Nhà cung cấp",
    to: "/app/suppliers",
    icon: <CirclePile />,
  },
]
