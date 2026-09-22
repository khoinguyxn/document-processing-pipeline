import { DateRangeFilter } from "@/components/header-filters"
import { getCurrentMonthRange } from "@/components/ui/date-range-picker"
import { formatDate, getCurrentDate } from "@/lib/datetime"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"
import { render } from "vitest-browser-react"

// The popover content is portalled to `document.body`, so it lives outside the
// render container and has to be queried from the document.
function getTrigger() {
  return document.querySelector<HTMLElement>(
    '[data-slot="date-range-picker"]'
  ) as HTMLElement
}

function getLabel() {
  return document.querySelector<HTMLElement>(
    '[data-slot="date-range-picker-label"]'
  ) as HTMLElement
}

describe("DateRangeFilter", () => {
  it("DateRangeFilter_ShouldRenderTheCurrentMonthRange_WhenItMounts", async () => {
    // Arrange
    const { from, to } = getCurrentMonthRange()

    // Act
    await render(<DateRangeFilter />)

    // Assert
    expect(getLabel().textContent).toBe(
      `${formatDate(from!)} – ${formatDate(to!)}`
    )
    expect(getLabel().getAttribute("data-empty")).toBe("false")
  })

  it("DateRangeFilter_ShouldUpdateTheRange_WhenAPresetIsSelected", async () => {
    // Arrange
    const screen = await render(<DateRangeFilter />)
    const today = getCurrentDate()
    const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const expected = `${String(previousMonth.getMonth() + 1).padStart(2, "0")}/${previousMonth.getFullYear()}`

    // Act
    await userEvent.click(getTrigger())
    await userEvent.click(screen.getByRole("button", { name: "Tháng trước" }))

    // Assert
    expect(getLabel().textContent).toContain(expected)
    expect(getLabel().getAttribute("data-empty")).toBe("false")
  })
})
