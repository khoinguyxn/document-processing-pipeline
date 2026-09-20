import { formatDate, getCurrentDate } from "@/lib/datetime"
import { describe, expect, it } from "vitest"

function toParts(date: Date) {
  return [date.getFullYear(), date.getMonth(), date.getDate()]
}

describe("formatDate", () => {
  it("FormatDate_ShouldRenderDayMonthYear_WhenGivenADate", () => {
    // Arrange
    const date = new Date(2026, 8, 1)

    // Act
    const result = formatDate(date)

    // Assert
    expect(result).toBe("01/09/2026")
  })

  it("FormatDate_ShouldZeroPadDayAndMonth_WhenTheyAreSingleDigit", () => {
    // Arrange
    const date = new Date(2025, 0, 5)

    // Act
    const result = formatDate(date)

    // Assert
    expect(result).toBe("05/01/2025")
  })

  it("FormatDate_ShouldUseTheDisplayTimeZone_WhenTheInstantCrossesMidnight", () => {
    // Arrange
    const beforeMidnight = new Date("2026-09-18T16:30:00.000Z")
    const afterMidnight = new Date("2026-09-18T17:30:00.000Z")

    // Act
    const before = formatDate(beforeMidnight)
    const after = formatDate(afterMidnight)

    // Assert
    expect(before).toBe("18/09/2026")
    expect(after).toBe("19/09/2026")
  })
})

describe("getCurrentDate", () => {
  it("GetCurrentDate_ShouldReturnTheDisplayTimeZoneDate_WhenTheUtcDayDiffers", () => {
    // Arrange
    const now = new Date("2026-08-31T18:00:00.000Z")

    // Act
    const date = getCurrentDate(now)

    // Assert
    expect(toParts(date)).toEqual([2026, 8, 1])
  })

  it("GetCurrentDate_ShouldReturnThePreviousDay_WhenTheInstantIsBeforeMidnight", () => {
    // Arrange
    const now = new Date("2026-08-31T16:00:00.000Z")

    // Act
    const date = getCurrentDate(now)

    // Assert
    expect(toParts(date)).toEqual([2026, 7, 31])
  })

  it("GetCurrentDate_ShouldFormatBackToTheSameDate_WhenReadInTheDisplayTimeZone", () => {
    // Arrange
    const now = new Date("2026-08-31T18:00:00.000Z")

    // Act
    const date = getCurrentDate(now)

    // Assert
    expect(formatDate(date)).toBe("01/09/2026")
  })
})
