export type HeaderAction = "upload" | "camera"

export type HeaderFilter = "date-range"

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    title?: string
    actions?: readonly HeaderAction[]
    filters?: readonly HeaderFilter[]
    search?: { placeholder: string }
  }
}
