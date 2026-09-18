import type { Page } from "@/types/pages"
import { CirclePile, Folder, Sheet } from "lucide-react"

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
