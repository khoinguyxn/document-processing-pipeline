import { cn } from "cn"
import { Slot } from "radix-ui"

type HeadingProps = React.ComponentProps<"h1"> & {
  asChild?: boolean
}

const HEADING_BASE =
  "scroll-m-20 font-heading font-semibold tracking-tight text-balance"

function H1({ className, asChild, ...props }: HeadingProps) {
  const Comp: React.ElementType = asChild ? Slot.Root : "h1"

  return (
    <Comp
      data-slot="h1"
      className={cn(HEADING_BASE, "text-2xl font-bold", className)}
      {...props}
    />
  )
}

function H2({ className, asChild, ...props }: HeadingProps) {
  const Comp: React.ElementType = asChild ? Slot.Root : "h2"

  return (
    <Comp
      data-slot="h2"
      className={cn(HEADING_BASE, "text-xl font-semibold", className)}
      {...props}
    />
  )
}

function H3({ className, asChild, ...props }: HeadingProps) {
  const Comp: React.ElementType = asChild ? Slot.Root : "h3"

  return (
    <Comp
      data-slot="h3"
      className={cn(HEADING_BASE, "text-lg font-medium", className)}
      {...props}
    />
  )
}

export { H1, H2, H3 }
