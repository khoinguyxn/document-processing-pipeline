import { describe, expect, it } from "vitest"
import { ReceiptEmptyStateCard } from "@/components/receipts/receipt-empty-state-card"
import { renderWithRouter } from "../../utils/router"

const CARD_SELECTOR = '[data-slot="card"]'
const CARD_ACTION_SELECTOR = '[data-slot="card-action"]'
const BUTTON_SELECTOR = '[data-slot="button"]'
const ICON_BUTTON_SELECTOR = `[data-slot="card-header"] ${BUTTON_SELECTOR}`

const TITLE = "Chưa có hoá đơn nào trong lô này"
const UPLOAD_LABEL = "Tải file lên"
const PICK_IMAGE_LABEL = "Chọn ảnh từ điện thoại"

// The card takes no props and reaches for no router state, so it mounts
// directly. The `/app` index route seeds fake receipts at module scope and no
// longer reaches this branch — see `tests/routes/app/index.test.tsx`.
function renderEmptyStateCard() {
  return renderWithRouter(<ReceiptEmptyStateCard />)
}

function getCard(container: HTMLElement) {
  return container.querySelector<HTMLElement>(CARD_SELECTOR)!
}

function getAction(container: HTMLElement) {
  return getCard(container).querySelector<HTMLElement>(CARD_ACTION_SELECTOR)!
}

function getIconButton(container: HTMLElement) {
  return getCard(container).querySelector<HTMLButtonElement>(
    ICON_BUTTON_SELECTOR
  )!
}

function getActionButtons(container: HTMLElement) {
  return [
    ...getAction(container).querySelectorAll<HTMLElement>(BUTTON_SELECTOR),
  ]
}

function centerX(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return rect.left + rect.width / 2
}

describe("ReceiptEmptyStateCard", () => {
  it("ReceiptEmptyStateCard_ShouldRenderTheEmptyStateCopy_WhenRendered", async () => {
    // Arrange & Act
    const screen = await renderEmptyStateCard()

    // Assert
    const card = getCard(screen.container)
    expect(card.querySelector('[data-slot="card-title"]')?.textContent).toBe(
      TITLE
    )
    expect(
      card.querySelector('[data-slot="card-description"]')?.textContent
    ).toContain("Kéo thả bản scan vào đây")
  })

  it("ReceiptEmptyStateCard_ShouldRenderTheUploadButtonAsDisabled_WhenRendered", async () => {
    // Arrange & Act
    const screen = await renderEmptyStateCard()

    // Assert
    const iconButton = getIconButton(screen.container)
    expect(iconButton.disabled).toBe(true)
    expect(iconButton.getAttribute("data-size")).toBe("icon-lg")
    expect(iconButton.querySelector("svg")).not.toBeNull()
  })

  it("ReceiptEmptyStateCard_ShouldRenderBothActionButtonsWithTheirLabels_WhenRendered", async () => {
    // Arrange & Act
    const screen = await renderEmptyStateCard()

    // Assert
    await expect
      .element(screen.getByRole("button", { name: UPLOAD_LABEL }))
      .toBeVisible()
    await expect
      .element(screen.getByRole("button", { name: PICK_IMAGE_LABEL }))
      .toBeVisible()
    expect(getActionButtons(screen.container)).toHaveLength(2)
  })

  it("ReceiptEmptyStateCard_ShouldCenterTheUploadButtonOnTheCard_WhenRendered", async () => {
    // Arrange & Act
    const screen = await renderEmptyStateCard()

    // Assert
    const card = getCard(screen.container)
    expect(
      Math.abs(centerX(card) - centerX(getIconButton(screen.container)))
    ).toBeLessThanOrEqual(1)
  })

  it("ReceiptEmptyStateCard_ShouldLayOutTheActionAsAWrappingFlexRow_WhenRendered", async () => {
    // Arrange & Act
    const screen = await renderEmptyStateCard()

    // Assert
    const style = getComputedStyle(getAction(screen.container))
    expect(style.display).toBe("flex")
    expect(style.flexWrap).toBe("wrap")
    expect(style.columnGap).not.toBe("normal")
  })

  it("ReceiptEmptyStateCard_ShouldPlaceTheActionButtonsSideBySideInOneRow_WhenThereIsEnoughSpace", async () => {
    // Arrange & Act
    const screen = await renderEmptyStateCard()

    // Assert
    const [first, second] = getActionButtons(screen.container)
    const firstRect = first.getBoundingClientRect()
    const secondRect = second.getBoundingClientRect()
    expect(Math.abs(firstRect.top - secondRect.top)).toBeLessThanOrEqual(1)
    expect(Math.abs(firstRect.bottom - secondRect.bottom)).toBeLessThanOrEqual(
      1
    )
    expect(secondRect.left).toBeGreaterThanOrEqual(firstRect.right)
  })

  it("ReceiptEmptyStateCard_ShouldStackTheActionButtonsVertically_WhenSpaceIsTight", async () => {
    // Arrange
    const screen = await renderEmptyStateCard()
    const card = getCard(screen.container)
    card.style.width = "160px"

    // Act
    const [first, second] = getActionButtons(screen.container)
    const firstRect = first.getBoundingClientRect()
    const secondRect = second.getBoundingClientRect()

    // Assert
    expect(secondRect.top).toBeGreaterThanOrEqual(firstRect.bottom - 1)
  })

  it("ReceiptEmptyStateCard_ShouldSizeEachActionButtonToItsContent_WhenTheRowCannotSplitEvenly", async () => {
    // Arrange — `grow basis-0` hands both buttons an equal share whenever each
    // label's min-content fits it, so the row must be narrowed before
    // min-content sizing can show up.
    const screen = await renderEmptyStateCard()
    const card = getCard(screen.container)
    card.style.width = "400px"

    // Act
    const [first, second] = getActionButtons(screen.container)
    const firstRect = first.getBoundingClientRect()
    const secondRect = second.getBoundingClientRect()

    // Assert — the longer label earns the wider button, proving the flex row
    // tracks content instead of splitting the row into fixed equal halves.
    expect(Math.abs(firstRect.top - secondRect.top)).toBeLessThanOrEqual(1)
    expect(secondRect.width).toBeGreaterThan(firstRect.width)
    for (const button of [first, second]) {
      expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth + 1)
    }
  })

  it("ReceiptEmptyStateCard_ShouldFillTheActionWidthWithBothButtons_WhenRendered", async () => {
    // Arrange & Act
    const screen = await renderEmptyStateCard()

    // Assert
    const action = getAction(screen.container)
    const [first, second] = getActionButtons(screen.container)
    const gap = parseFloat(getComputedStyle(action).columnGap)
    const used =
      first.getBoundingClientRect().width +
      second.getBoundingClientRect().width +
      gap
    expect(Math.abs(used - action.clientWidth)).toBeLessThanOrEqual(1)
    expect(action.scrollWidth).toBeLessThanOrEqual(action.clientWidth)
  })
})
