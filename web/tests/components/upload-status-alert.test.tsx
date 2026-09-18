import { UploadStatusAlert } from "@/components/upload-status-alert"
import { describe, expect, it } from "vitest"
import { render } from "vitest-browser-react"

const ALERT_SELECTOR = '[data-slot="alert"]'
const TITLE_SELECTOR = '[data-slot="alert-title"]'
const DESCRIPTION_SELECTOR = '[data-slot="alert-description"]'
const ACTION_SELECTOR = '[data-slot="alert-action"]'
const PROGRESS_SELECTOR = '[data-slot="progress"]'
const SPINNER_SELECTOR = '[data-slot="spinner"]'
const BUTTON_SELECTOR = '[data-slot="button"]'

const CANCEL_LABEL = "Huỷ tải lên"

function getAlert(container: HTMLElement) {
  return container.querySelector<HTMLElement>(ALERT_SELECTOR)!
}

function getTitle(container: HTMLElement) {
  return getAlert(container).querySelector<HTMLElement>(TITLE_SELECTOR)!
}

function getDescription(container: HTMLElement) {
  return getAlert(container).querySelector<HTMLElement>(DESCRIPTION_SELECTOR)!
}

function getAction(container: HTMLElement) {
  return getAlert(container).querySelector<HTMLElement>(ACTION_SELECTOR)!
}

function getProgress(container: HTMLElement) {
  return getAlert(container).querySelector<HTMLElement>(PROGRESS_SELECTOR)!
}

function getStatusButton(container: HTMLElement) {
  return getAlert(container).querySelector<HTMLButtonElement>(BUTTON_SELECTOR)!
}

function rect(element: HTMLElement) {
  return element.getBoundingClientRect()
}

describe("UploadStatusAlert", () => {
  it("UploadStatusAlert_ShouldRenderTheUploadProgressCopy_WhenRendered", async () => {
    // Arrange & Act
    const screen = await render(<UploadStatusAlert />)

    // Assert
    expect(getTitle(screen.container).textContent).toBe("Đang đọc 9 hoá đơn")
    expect(getDescription(screen.container).textContent).toContain(
      "Đã xong 3 hoá đơn"
    )
  })

  it("UploadStatusAlert_ShouldRenderADisabledSpinnerButton_WhenRendered", async () => {
    // Arrange & Act
    const screen = await render(<UploadStatusAlert />)

    // Assert
    const button = getStatusButton(screen.container)
    expect(button.disabled).toBe(true)
    expect(button.querySelector(SPINNER_SELECTOR)).not.toBeNull()
  })

  it("UploadStatusAlert_ShouldPlaceTheTitleAndDescriptionOnTheSameRow", async () => {
    // Arrange & Act
    const screen = await render(<UploadStatusAlert />)

    // Assert
    const titleRect = rect(getTitle(screen.container))
    const descriptionRect = rect(getDescription(screen.container))
    expect(Math.abs(titleRect.top - descriptionRect.top)).toBeLessThanOrEqual(2)
  })

  it("UploadStatusAlert_ShouldPlaceTheSpinnerButtonLeftOfTheTitle", async () => {
    // Arrange & Act
    const screen = await render(<UploadStatusAlert />)

    // Assert
    const buttonRect = rect(getStatusButton(screen.container))
    const titleRect = rect(getTitle(screen.container))
    expect(buttonRect.right).toBeLessThanOrEqual(titleRect.left)
  })

  it("UploadStatusAlert_ShouldPlaceTheProgressBarBeneathTheCopyAndRightOfTheButton", async () => {
    // Arrange & Act
    const screen = await render(<UploadStatusAlert />)

    // Assert
    const progressRect = rect(getProgress(screen.container))
    const titleRect = rect(getTitle(screen.container))
    const descriptionRect = rect(getDescription(screen.container))
    const buttonRect = rect(getStatusButton(screen.container))
    expect(progressRect.top).toBeGreaterThanOrEqual(titleRect.bottom)
    expect(progressRect.top).toBeGreaterThanOrEqual(descriptionRect.bottom)
    expect(progressRect.left).toBeGreaterThanOrEqual(buttonRect.right)
  })

  it("UploadStatusAlert_ShouldPlaceTheDestructiveActionOnTheFarRight", async () => {
    // Arrange & Act
    const screen = await render(<UploadStatusAlert />)

    // Assert
    const alertRect = rect(getAlert(screen.container))
    const actionRect = rect(getAction(screen.container))
    const progressRect = rect(getProgress(screen.container))
    expect(actionRect.right).toBeGreaterThan(progressRect.right)
    expect(alertRect.right - actionRect.right).toBeLessThanOrEqual(20)

    const cancel = screen.getByRole("button", { name: CANCEL_LABEL })
    await expect.element(cancel).toBeVisible()
    expect(cancel.element().getAttribute("data-variant")).toBe("destructive")
  })

  it("UploadStatusAlert_ShouldRenderTheSuccessVariant_WhenVariantIsSuccess", async () => {
    // Arrange & Act
    const screen = await render(<UploadStatusAlert variant="success" />)

    // Assert
    expect(getTitle(screen.container).textContent).toBe("Đã tải lên")
    expect(getDescription(screen.container).textContent).toContain(
      "Đã tải lên 9 hoá đơn thành công"
    )
    expect(getStatusButton(screen.container).getAttribute("aria-label")).toBe(
      "Đã tải lên"
    )
    expect(
      getAlert(screen.container).querySelector(PROGRESS_SELECTOR)
    ).toBeNull()
    expect(getAction(screen.container)).toBeNull()
  })

  it("UploadStatusAlert_ShouldRenderTheDestructiveVariant_WhenVariantIsDestructive", async () => {
    // Arrange & Act
    const screen = await render(<UploadStatusAlert variant="destructive" />)

    // Assert
    expect(getTitle(screen.container).textContent).toContain(
      "3 hoá đơn cần bạn kiểm tra"
    )
    expect(getStatusButton(screen.container).getAttribute("aria-label")).toBe(
      "Cần kiểm tra"
    )
    expect(
      getAlert(screen.container).querySelector(PROGRESS_SELECTOR)
    ).toBeNull()
    await expect
      .element(screen.getByRole("button", { name: "Kiểm tra", exact: true }))
      .toBeVisible()
  })
})
