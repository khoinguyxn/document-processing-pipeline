import { PAGE_TITLE_LABELS, PAGES } from "@/models/pages"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"
import { renderRoute } from "../../utils/router"

// `AppLayout` renders `<Outlet />`, so it has to be mounted through a real
// router match rather than a bare context provider.
function renderAppLayout(initialLocation: string = "/app") {
  return renderRoute(<div />, {
    initialLocation: initialLocation,
  })
}

function getDateRangeLabel(container: HTMLElement) {
  return container.querySelector('[data-slot="date-range-picker-label"]')
    ?.textContent
}

describe("AppLayout", () => {
  it("AppLayout_ShouldRenderTheSidebarTrigger", async () => {
    // Arrange & Act
    const screen = await renderAppLayout()

    // Assert
    await expect
      .element(
        screen.getByRole("main").getByRole("button", { name: "Toggle Sidebar" })
      )
      .toBeVisible()
  })

  it("AppLayout_ShouldRenderTheSidebarWithEveryPage", async () => {
    // Arrange & Act
    const screen = await renderAppLayout()

    // Assert
    for (const page of PAGES) {
      await expect
        .element(
          screen.getByRole("link", { name: PAGE_TITLE_LABELS[page.title] })
        )
        .toBeVisible()
    }
  })

  it("AppLayout_ShouldRenderTheTitleOfTheCurrentPage", async () => {
    // Arrange & Act
    const screen = await renderAppLayout("/app/exports")

    // Assert
    await expect
      .element(screen.getByRole("heading", { level: 1 }))
      .toHaveTextContent("Xuất dữ liệu")
  })

  it("AppLayout_ShouldRenderTheDateRangePicker", async () => {
    // Arrange & Act
    const screen = await renderAppLayout()

    // Assert
    await expect
      .element(screen.getByRole("button", { name: /–/ }))
      .toBeVisible()
    expect(getDateRangeLabel(screen.container)).toBeTruthy()
  })

  it("AppLayout_ShouldRenderTheCurrentMonthRange_WhenItFirstMounts", async () => {
    // Arrange
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const format = (date: Date) =>
      `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}/${date.getFullYear()}`

    // Act
    const screen = await renderAppLayout()

    // Assert
    expect(getDateRangeLabel(screen.container)).toBe(
      `${format(firstDay)} – ${format(lastDay)}`
    )
  })

  it("AppLayout_ShouldUpdateTheDateRange_WhenAPresetIsSelected", async () => {
    // Arrange
    const screen = await renderAppLayout()
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const expected = `${String(lastMonth.getMonth() + 1).padStart(2, "0")}/${lastMonth.getFullYear()}`

    // Act
    await userEvent.click(
      screen.container.querySelector('[data-slot="date-range-picker"]')!
    )
    await userEvent.click(screen.getByRole("button", { name: "Tháng trước" }))

    // Assert
    expect(getDateRangeLabel(screen.container)).toContain(expected)
  })

  it("AppLayout_ShouldRenderTheOutletContent", async () => {
    // Arrange & Act
    const screen = await renderAppLayout("/app/exports")

    // Assert
    await expect.element(screen.getByRole("main")).toBeVisible()
  })
})
