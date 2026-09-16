import { describe, expect, it } from "vitest"
import { renderRoute } from "../../utils/router"

const CARD_SELECTOR = '[data-slot="card"]'
const CARD_ACTION_SELECTOR = '[data-slot="card-action"]'
const BUTTON_SELECTOR = '[data-slot="button"]'
const ICON_BUTTON_SELECTOR = `[data-slot="card-header"] ${BUTTON_SELECTOR}`

const TITLE = "Chưa có hoá đơn nào trong lô này"
const UPLOAD_LABEL = "Tải file lên"
const PICK_IMAGE_LABEL = "Chọn ảnh từ điện thoại"

// The empty state lives on the `/app/` index route, nested under the `/app`
// layout route. `RouteComponent` is not exported, so the real router is the only
// way to reach it — same approach as the layout tests in `route.test.tsx`.
function renderEmptyState() {
  return renderRoute(<div />, { initialLocation: "/app" })
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

describe("EmptyStateCard", () => {
  it("EmptyStateCard_ShouldRenderTheEmptyStateCopy_WhenThereAreNoDocuments", async () => {
    // Arrange & Act
    const screen = await renderEmptyState()

    // Assert
    const card = getCard(screen.container)
    expect(card.querySelector('[data-slot="card-title"]')?.textContent).toBe(
      TITLE
    )
    expect(
      card.querySelector('[data-slot="card-description"]')?.textContent
    ).toContain("Kéo thả bản scan vào đây")
  })

  it("EmptyStateCard_ShouldRenderTheUploadButtonAsDisabled_WhenThereAreNoDocuments", async () => {
    // Arrange & Act
    const screen = await renderEmptyState()

    // Assert
    const iconButton = getIconButton(screen.container)
    expect(iconButton.disabled).toBe(true)
    expect(iconButton.getAttribute("data-size")).toBe("icon-lg")
    expect(iconButton.querySelector("svg")).not.toBeNull()
  })

  it("EmptyStateCard_ShouldRenderBothActionButtonsWithTheirLabels", async () => {
    // Arrange & Act
    const screen = await renderEmptyState()

    // Assert
    await expect
      .element(screen.getByRole("button", { name: UPLOAD_LABEL }))
      .toBeVisible()
    await expect
      .element(screen.getByRole("button", { name: PICK_IMAGE_LABEL }))
      .toBeVisible()
    expect(getActionButtons(screen.container)).toHaveLength(2)
  })

  it("EmptyStateCard_ShouldCenterTheUploadButtonOnTheCard", async () => {
    // Arrange & Act
    const screen = await renderEmptyState()

    // Assert
    const card = getCard(screen.container)
    expect(
      Math.abs(centerX(card) - centerX(getIconButton(screen.container)))
    ).toBeLessThanOrEqual(1)
  })

  it("EmptyStateCard_ShouldSpanTheActionAcrossTwoColumnsAndOneRow", async () => {
    // Arrange & Act
    const screen = await renderEmptyState()

    // Assert
    const style = getComputedStyle(getAction(screen.container))
    expect(style.display).toBe("grid")
    expect(style.gridColumn).toBe("1 / span 2")
    expect(style.gridRow).toBe("1 / span 1")
    expect(style.gridTemplateColumns.split(" ")).toHaveLength(2)
    expect(style.gridTemplateRows.split(" ")).toHaveLength(1)
  })

  it("EmptyStateCard_ShouldPlaceTheActionButtonsSideBySideInOneRow", async () => {
    // Arrange & Act
    const screen = await renderEmptyState()

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

  it("EmptyStateCard_ShouldSizeEachActionButtonToItsContent", async () => {
    // Arrange & Act
    const screen = await renderEmptyState()

    // Assert
    const [first, second] = getActionButtons(screen.container)
    // The longer label earns the wider column, proving the grid tracks content
    // instead of splitting the row into fixed equal halves.
    expect(second.getBoundingClientRect().width).toBeGreaterThan(
      first.getBoundingClientRect().width
    )
    for (const button of [first, second]) {
      expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth + 1)
    }
  })

  it("EmptyStateCard_ShouldFillTheActionWidthWithBothButtons", async () => {
    // Arrange & Act
    const screen = await renderEmptyState()

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
