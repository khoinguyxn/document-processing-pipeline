import { H1, H2, H3 } from "@/components/ui/typography"
import { describe, expect, it } from "vitest"
import { render } from "vitest-browser-react"

// `font-semibold` is intentionally absent: `cn` runs tailwind-merge, so the
// per-heading weight below overrides it.
const HEADING_BASE_CLASSES = [
  "scroll-m-20",
  "font-heading",
  "tracking-tight",
  "text-balance",
]

describe("H1", () => {
  it("H1_ShouldRenderAnH1Element_WhenRendered", async () => {
    // Arrange & Act
    const screen = await render(<H1>Hòm thư</H1>)

    // Assert
    await expect
      .element(screen.getByRole("heading", { level: 1 }))
      .toBeVisible()
    expect(screen.container.querySelector("h1")?.textContent).toBe("Hòm thư")
  })

  it("H1_ShouldCarryItsDataSlot_WhenRendered", async () => {
    // Arrange & Act
    const screen = await render(<H1>Hòm thư</H1>)

    // Assert
    expect(screen.container.querySelector('[data-slot="h1"]')?.tagName).toBe(
      "H1"
    )
  })

  it("H1_ShouldApplyBaseAndSizeClasses_WhenRendered", async () => {
    // Arrange & Act
    const screen = await render(<H1>Hòm thư</H1>)

    // Assert
    const className = screen.container.querySelector("h1")?.className ?? ""
    for (const expected of [...HEADING_BASE_CLASSES, "text-2xl", "font-bold"]) {
      expect(className).toContain(expected)
    }
  })

  it("H1_ShouldKeepCustomClassName_WhenClassNameIsProvided", async () => {
    // Arrange & Act
    const screen = await render(<H1 className="text-red-500">Hòm thư</H1>)

    // Assert
    expect(screen.container.querySelector("h1")?.className).toContain(
      "text-red-500"
    )
  })

  it("H1_ShouldRenderTheChildElement_WhenAsChildIsSet", async () => {
    // Arrange & Act
    const screen = await render(
      <H1 asChild>
        <a href="/app">Hòm thư</a>
      </H1>
    )

    // Assert
    expect(screen.container.querySelector("h1")).toBeNull()
    const link = screen.container.querySelector("a")
    expect(link?.textContent).toBe("Hòm thư")
    expect(link?.getAttribute("data-slot")).toBe("h1")
  })
})

describe("H2", () => {
  it("H2_ShouldRenderAnH2Element_WhenRendered", async () => {
    // Arrange & Act
    const screen = await render(<H2>Xuất dữ liệu</H2>)

    // Assert
    await expect
      .element(screen.getByRole("heading", { level: 2 }))
      .toBeVisible()
    expect(screen.container.querySelector('[data-slot="h2"]')?.tagName).toBe(
      "H2"
    )
  })

  it("H2_ShouldApplyBaseAndSizeClasses_WhenRendered", async () => {
    // Arrange & Act
    const screen = await render(<H2>Xuất dữ liệu</H2>)

    // Assert
    const className = screen.container.querySelector("h2")?.className ?? ""
    for (const expected of [
      ...HEADING_BASE_CLASSES,
      "font-semibold",
      "text-xl",
    ]) {
      expect(className).toContain(expected)
    }
  })
})

describe("H3", () => {
  it("H3_ShouldRenderAnH3Element_WhenRendered", async () => {
    // Arrange & Act
    const screen = await render(<H3>Nhà cung cấp</H3>)

    // Assert
    await expect
      .element(screen.getByRole("heading", { level: 3 }))
      .toBeVisible()
    expect(screen.container.querySelector('[data-slot="h3"]')?.tagName).toBe(
      "H3"
    )
  })

  it("H3_ShouldApplyBaseAndSizeClasses_WhenRendered", async () => {
    // Arrange & Act
    const screen = await render(<H3>Nhà cung cấp</H3>)

    // Assert
    const className = screen.container.querySelector("h3")?.className ?? ""
    for (const expected of [...HEADING_BASE_CLASSES, "text-lg"]) {
      expect(className).toContain(expected)
    }
  })

  it("H3_ShouldForwardDomProps_WhenExtraAttributesArePassed", async () => {
    // Arrange & Act
    const screen = await render(<H3 id="supplier-heading">Nhà cung cấp</H3>)

    // Assert
    expect(screen.container.querySelector("h3")?.getAttribute("id")).toBe(
      "supplier-heading"
    )
  })
})
