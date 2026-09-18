import { InboxButtonGroup } from "@/components/inbox-button-group"
import { describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

const BUTTON_SELECTOR = '[data-slot="button"]'

const ALL_LABEL = "Tất cả"
const REVIEW_LABEL = "Cần kiểm tra"
const DONE_LABEL = "Hoàn tất"

function getButtons(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLButtonElement>(BUTTON_SELECTOR)]
}

function getPressedButtons(container: HTMLElement) {
  return getButtons(container).filter(
    (button) => button.getAttribute("aria-pressed") === "true"
  )
}

describe("InboxButtonGroup", () => {
  it("InboxButtonGroup_ShouldSelectTheFirstButton_WhenRendered", async () => {
    // Arrange & Act
    const screen = await render(<InboxButtonGroup />)

    // Assert
    const [pressed] = getPressedButtons(screen.container)
    expect(pressed.textContent).toContain(ALL_LABEL)
  })

  it("InboxButtonGroup_ShouldKeepOnlyOneButtonSelected_WhenAnotherIsClicked", async () => {
    // Arrange
    const screen = await render(<InboxButtonGroup />)

    // Act
    await screen.getByRole("button", { name: new RegExp(REVIEW_LABEL) }).click()

    // Assert
    const pressed = getPressedButtons(screen.container)
    expect(pressed).toHaveLength(1)
    expect(pressed[0].textContent).toContain(REVIEW_LABEL)
  })

  it("InboxButtonGroup_ShouldSwitchSelection_WhenSelectedButtonIsClickedAgain", async () => {
    // Arrange
    const screen = await render(<InboxButtonGroup />)

    // Act
    await screen.getByRole("button", { name: new RegExp(REVIEW_LABEL) }).click()
    await screen.getByRole("button", { name: new RegExp(ALL_LABEL) }).click()

    // Assert
    const pressed = getPressedButtons(screen.container)
    expect(pressed).toHaveLength(1)
    expect(pressed[0].textContent).toContain(ALL_LABEL)
  })

  it("InboxButtonGroup_ShouldReportTheFilterStatuses_WhenAButtonIsClicked", async () => {
    // Arrange
    const onStatusesChange = vi.fn()
    const screen = await render(
      <InboxButtonGroup onStatusesChange={onStatusesChange} />
    )

    // Act
    await screen.getByRole("button", { name: new RegExp(REVIEW_LABEL) }).click()
    await screen.getByRole("button", { name: new RegExp(DONE_LABEL) }).click()

    // Assert
    expect(onStatusesChange).toHaveBeenNthCalledWith(1, ["needs_review"])
    expect(onStatusesChange).toHaveBeenNthCalledWith(2, ["ready"])
  })
})
