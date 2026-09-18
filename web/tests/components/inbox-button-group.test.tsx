import { InboxButtonGroup } from "@/components/inbox-button-group"
import { describe, expect, it } from "vitest"
import { render } from "vitest-browser-react"

const BUTTON_SELECTOR = '[data-slot="button"]'

const ALL_LABEL = "Tất cả"
const REVIEW_LABEL = "Cần kiểm tra"

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
})
