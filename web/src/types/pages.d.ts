import type { LinkProps } from "@tanstack/react-router"

export type Page = {
  title: string
  to: LinkProps["to"]
  icon: React.ReactNode
}
