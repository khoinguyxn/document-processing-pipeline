import { HeaderSearch } from "@/components/header-search"
import { describe, expect, it } from "vitest"
import { render } from "vitest-browser-react"

const PLACEHOLDER = "Tìm kiếm hoá đơn…"
const TYPED_QUERY = "hoá đơn tháng 9"

describe("HeaderSearch", () => {
  it("HeaderSearch_ShouldExposeThePlaceholderAsTheAccessibleName", async () => {
    // Arrange & Act
    const screen = await render(<HeaderSearch placeholder={PLACEHOLDER} />)

    // Assert
    const input = screen.getByRole("searchbox").element()
    expect(input.getAttribute("placeholder")).toBe(PLACEHOLDER)
    expect(input.getAttribute("aria-label")).toBe(PLACEHOLDER)
  })

  it("HeaderSearch_ShouldUpdateTheValue_WhenTheUserTypes", async () => {
    // Arrange
    const screen = await render(<HeaderSearch placeholder={PLACEHOLDER} />)

    // Act
    await screen.getByRole("searchbox").fill(TYPED_QUERY)

    // Assert
    await expect.element(screen.getByRole("searchbox")).toHaveValue(TYPED_QUERY)
  })

  it("HeaderSearch_ShouldClearTheValue_WhenTheTypedValueIsRemoved", async () => {
    // Arrange
    const screen = await render(<HeaderSearch placeholder={PLACEHOLDER} />)

    // Act
    await screen.getByRole("searchbox").fill(TYPED_QUERY)
    await screen.getByRole("searchbox").fill("")

    // Assert
    await expect.element(screen.getByRole("searchbox")).toHaveValue("")
  })
})
