import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"
import { render } from "vitest-browser-react"

import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "@/components/ui/date-range-picker"

const EMPTY_LABEL = "Chọn khoảng thời gian"

// The popover content is portalled to `document.body`, so it lives outside the
// render container and has to be queried from the document.
function countRenderedMonths() {
  return document.querySelectorAll(".rdp-month").length
}

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

// Mirrors how `routes/app/route.tsx` owns the value, so preset clicks can be
// observed through the same controlled-value path the app uses.
function ControlledPicker({ initialValue }: { initialValue?: DateRange }) {
  const [value, setValue] = useState<DateRange | undefined>(initialValue)

  return <DateRangePicker value={value} onValueChange={setValue} />
}

describe("DateRangePicker", () => {
  it("DateRangePicker_ShouldRenderTheEmptyLabel_WhenNoValueIsProvided", async () => {
    // Arrange & Act
    await render(<DateRangePicker />)

    // Assert
    expect(getLabel().textContent).toBe(EMPTY_LABEL)
    expect(getLabel().getAttribute("data-empty")).toBe("true")
  })

  it("DateRangePicker_ShouldRenderTheFormattedRange_WhenAValueIsProvided", async () => {
    // Arrange
    const value: DateRange = {
      from: new Date(2026, 8, 1),
      to: new Date(2026, 8, 30),
    }

    // Act
    await render(<DateRangePicker value={value} />)

    // Assert
    expect(getLabel().textContent).toBe("01/09/2026 – 30/09/2026")
    expect(getLabel().getAttribute("data-empty")).toBe("false")
  })

  it("DateRangePicker_ShouldRenderTheEmptyLabel_WhenOnlyFromIsProvided", async () => {
    // Arrange
    const value: DateRange = { from: new Date(2026, 8, 1) }

    // Act
    await render(<DateRangePicker value={value} />)

    // Assert
    expect(getLabel().textContent).toBe(EMPTY_LABEL)
    expect(getLabel().getAttribute("data-empty")).toBe("false")
  })

  it("DateRangePicker_ShouldOpenThePopover_WhenTheTriggerIsClicked", async () => {
    // Arrange
    const screen = await render(<DateRangePicker />)

    // Act
    await userEvent.click(screen.getByRole("button", { name: EMPTY_LABEL }))

    // Assert
    await expect.element(screen.getByText("Tháng trước")).toBeVisible()
    await expect.element(screen.getByText("Tháng sau")).toBeVisible()
    await expect.element(screen.getByText("Năm trước")).toBeVisible()
    expect(countRenderedMonths()).toBe(1)
  })

  it("DateRangePicker_ShouldRenderASingleMonth_WhenTheRangeSpansOneMonth", async () => {
    // Arrange
    const value: DateRange = {
      from: new Date(2026, 8, 1),
      to: new Date(2026, 8, 30),
    }
    const screen = await render(<DateRangePicker value={value} />)

    // Act
    await userEvent.click(
      screen.getByRole("button", { name: "01/09/2026 – 30/09/2026" })
    )

    // Assert
    await expect.element(screen.getByText("Tháng trước")).toBeVisible()
    expect(countRenderedMonths()).toBe(1)
  })

  it("DateRangePicker_ShouldRenderTwoMonths_WhenTheRangeSpansMultipleMonths", async () => {
    // Arrange
    const value: DateRange = {
      from: new Date(2025, 0, 1),
      to: new Date(2025, 11, 31),
    }
    const screen = await render(<DateRangePicker value={value} />)

    // Act
    await userEvent.click(
      screen.getByRole("button", { name: "01/01/2025 – 31/12/2025" })
    )

    // Assert
    await expect.element(screen.getByText("Tháng trước")).toBeVisible()
    expect(countRenderedMonths()).toBe(2)
  })

  it("DateRangePicker_ShouldAnchorTheWindowOnTheEndMonth_WhenTwoMonthsAreShown", async () => {
    // Arrange
    const value: DateRange = {
      from: new Date(2025, 0, 1),
      to: new Date(2025, 11, 31),
    }
    const screen = await render(<DateRangePicker value={value} />)

    // Act
    await userEvent.click(
      screen.getByRole("button", { name: "01/01/2025 – 31/12/2025" })
    )
    await expect.element(screen.getByText("Tháng trước")).toBeVisible()

    // Assert
    // The window starts on the end month, so a full-year range anchored on
    // 31/12/2025 shows December 2025 followed by January 2026.
    const captions = Array.from(
      document.querySelectorAll(".rdp-month_caption")
    ).map((node) => node.textContent)
    expect(captions).toHaveLength(2)
    expect(captions[0]).toContain("Tháng Mười Hai 2025")
    expect(captions[1]).toContain("Tháng Một 2026")
  })

  it("DateRangePicker_ShouldCallOnValueChangeWithThePreviousMonth_WhenThangTruocIsClicked", async () => {
    // Arrange
    const onValueChange = vi.fn()
    const screen = await render(
      <DateRangePicker onValueChange={onValueChange} />
    )
    const today = new Date()
    const expectedMonth = today.getMonth() - 1

    // Act
    await userEvent.click(screen.getByRole("button", { name: EMPTY_LABEL }))
    await userEvent.click(screen.getByRole("button", { name: "Tháng trước" }))

    // Assert
    expect(onValueChange).toHaveBeenCalledTimes(1)
    const range = onValueChange.mock.calls[0][0] as DateRange
    expect(range.from?.getDate()).toBe(1)
    expect(range.from?.getMonth()).toBe(((expectedMonth % 12) + 12) % 12)
    expect(range.to?.getDate()).toBe(
      new Date(range.to!.getFullYear(), range.to!.getMonth() + 1, 0).getDate()
    )
  })

  it("DateRangePicker_ShouldCallOnValueChangeWithTheNextMonth_WhenThangSauIsClicked", async () => {
    // Arrange
    const onValueChange = vi.fn()
    const screen = await render(
      <DateRangePicker onValueChange={onValueChange} />
    )
    const today = new Date()
    const expectedMonth = today.getMonth() + 1

    // Act
    await userEvent.click(screen.getByRole("button", { name: EMPTY_LABEL }))
    await userEvent.click(screen.getByRole("button", { name: "Tháng sau" }))

    // Assert
    expect(onValueChange).toHaveBeenCalledTimes(1)
    const range = onValueChange.mock.calls[0][0] as DateRange
    expect(range.from?.getDate()).toBe(1)
    expect(range.from?.getMonth()).toBe(expectedMonth % 12)
    expect(range.to?.getMonth()).toBe(expectedMonth % 12)
  })

  it("DateRangePicker_ShouldCallOnValueChangeWithThePreviousYear_WhenNamTruocIsClicked", async () => {
    // Arrange
    const onValueChange = vi.fn()
    const screen = await render(
      <DateRangePicker onValueChange={onValueChange} />
    )
    const expectedYear = new Date().getFullYear() - 1

    // Act
    await userEvent.click(screen.getByRole("button", { name: EMPTY_LABEL }))
    await userEvent.click(screen.getByRole("button", { name: "Năm trước" }))

    // Assert
    expect(onValueChange).toHaveBeenCalledTimes(1)
    const range = onValueChange.mock.calls[0][0] as DateRange
    expect(range.from?.getFullYear()).toBe(expectedYear)
    expect(range.from?.getMonth()).toBe(0)
    expect(range.from?.getDate()).toBe(1)
    expect(range.to?.getFullYear()).toBe(expectedYear)
    expect(range.to?.getMonth()).toBe(11)
    expect(range.to?.getDate()).toBe(31)
  })

  it("DateRangePicker_ShouldCloseThePopover_WhenAPresetIsClicked", async () => {
    // Arrange
    const screen = await render(<DateRangePicker />)

    // Act
    await userEvent.click(screen.getByRole("button", { name: EMPTY_LABEL }))
    await expect.element(screen.getByText("Tháng trước")).toBeVisible()
    await userEvent.click(screen.getByRole("button", { name: "Tháng trước" }))

    // Assert
    await expect
      .element(screen.getByText("Tháng trước"))
      .not.toBeInTheDocument()
    expect(countRenderedMonths()).toBe(0)
  })

  it("DateRangePicker_ShouldShowTwoMonths_WhenNamTruocWasSelected", async () => {
    // Arrange
    const screen = await render(<ControlledPicker />)

    // Act
    await userEvent.click(screen.getByRole("button", { name: EMPTY_LABEL }))
    await userEvent.click(screen.getByRole("button", { name: "Năm trước" }))
    await userEvent.click(getTrigger())

    // Assert
    await expect.element(screen.getByText("Tháng trước")).toBeVisible()
    expect(countRenderedMonths()).toBe(2)
  })

  it("DateRangePicker_ShouldShowOneMonth_WhenThangTruocWasSelected", async () => {
    // Arrange
    const screen = await render(<ControlledPicker />)

    // Act
    await userEvent.click(screen.getByRole("button", { name: EMPTY_LABEL }))
    await userEvent.click(screen.getByRole("button", { name: "Tháng trước" }))
    await userEvent.click(getTrigger())

    // Assert
    await expect.element(screen.getByText("Tháng trước")).toBeVisible()
    expect(countRenderedMonths()).toBe(1)
  })

  it("DateRangePicker_ShouldUpdateTheLabel_WhenAPresetIsSelected", async () => {
    // Arrange
    const screen = await render(<ControlledPicker />)
    const expectedYear = new Date().getFullYear() - 1

    // Act
    await userEvent.click(screen.getByRole("button", { name: EMPTY_LABEL }))
    await userEvent.click(screen.getByRole("button", { name: "Năm trước" }))

    // Assert
    expect(getLabel().textContent).toBe(
      `01/01/${expectedYear} – 31/12/${expectedYear}`
    )
    expect(getLabel().getAttribute("data-empty")).toBe("false")
  })

  it("DateRangePicker_ShouldForwardDomProps_WhenExtraAttributesArePassed", async () => {
    // Arrange & Act
    await render(<DateRangePicker id="range-picker" disabled />)

    // Assert
    expect(getTrigger().getAttribute("id")).toBe("range-picker")
    expect(getTrigger().hasAttribute("disabled")).toBe(true)
  })
})
