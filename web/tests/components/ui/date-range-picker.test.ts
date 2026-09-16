import { afterEach, describe, expect, it, vi } from "vitest"

import {
  formatDate,
  getCurrentMonthRange,
  getMonthRange,
  getMonthSpan,
  getYearRange,
  PRESETS,
} from "@/components/ui/date-range-picker"
import type { DateRange } from "@/components/ui/date-range-picker"

// `toISOString()` is unusable here: the runner's timezone (UTC+7) shifts a
// local-midnight Date to the previous UTC day.
function toParts(date: Date | undefined) {
  if (!date) return undefined

  return [date.getFullYear(), date.getMonth(), date.getDate()]
}

afterEach(() => {
  vi.useRealTimers()
})

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
})

describe("getMonthRange", () => {
  it("GetMonthRange_ShouldReturnWholeMonth_WhenOffsetIsZero", () => {
    // Arrange
    const reference = new Date(2026, 8, 15)

    // Act
    const range = getMonthRange(reference, 0)

    // Assert
    expect(toParts(range.from)).toEqual([2026, 8, 1])
    expect(toParts(range.to)).toEqual([2026, 8, 30])
  })

  it("GetMonthRange_ShouldReturnPreviousMonth_WhenOffsetIsNegativeOne", () => {
    // Arrange
    const reference = new Date(2026, 8, 15)

    // Act
    const range = getMonthRange(reference, -1)

    // Assert
    expect(toParts(range.from)).toEqual([2026, 7, 1])
    expect(toParts(range.to)).toEqual([2026, 7, 31])
  })

  it("GetMonthRange_ShouldReturnNextMonth_WhenOffsetIsOne", () => {
    // Arrange
    const reference = new Date(2026, 8, 15)

    // Act
    const range = getMonthRange(reference, 1)

    // Assert
    expect(toParts(range.from)).toEqual([2026, 9, 1])
    expect(toParts(range.to)).toEqual([2026, 9, 31])
  })

  it("GetMonthRange_ShouldReturnTwentyEightDays_WhenFebruaryIsNotALeapYear", () => {
    // Arrange
    const reference = new Date(2026, 1, 10)

    // Act
    const range = getMonthRange(reference, 0)

    // Assert
    expect(toParts(range.from)).toEqual([2026, 1, 1])
    expect(toParts(range.to)).toEqual([2026, 1, 28])
  })

  it("GetMonthRange_ShouldReturnTwentyNineDays_WhenFebruaryIsALeapYear", () => {
    // Arrange
    const reference = new Date(2028, 1, 10)

    // Act
    const range = getMonthRange(reference, 0)

    // Assert
    expect(toParts(range.to)).toEqual([2028, 1, 29])
  })

  it("GetMonthRange_ShouldRollBackIntoPreviousYear_WhenJanuaryOffsetIsNegativeOne", () => {
    // Arrange
    const reference = new Date(2026, 0, 20)

    // Act
    const range = getMonthRange(reference, -1)

    // Assert
    expect(toParts(range.from)).toEqual([2025, 11, 1])
    expect(toParts(range.to)).toEqual([2025, 11, 31])
  })

  it("GetMonthRange_ShouldRollForwardIntoNextYear_WhenDecemberOffsetIsOne", () => {
    // Arrange
    const reference = new Date(2026, 11, 20)

    // Act
    const range = getMonthRange(reference, 1)

    // Assert
    expect(toParts(range.from)).toEqual([2027, 0, 1])
    expect(toParts(range.to)).toEqual([2027, 0, 31])
  })

  it("GetMonthRange_ShouldIgnoreDayOfMonth_WhenReferenceIsTheLastDay", () => {
    // Arrange
    const reference = new Date(2026, 8, 30)

    // Act
    const range = getMonthRange(reference, 0)

    // Assert
    expect(toParts(range.from)).toEqual([2026, 8, 1])
  })
})

describe("getYearRange", () => {
  it("GetYearRange_ShouldReturnFirstToLastDayOfYear_WhenOffsetIsZero", () => {
    // Arrange
    const reference = new Date(2026, 8, 15)

    // Act
    const range = getYearRange(reference, 0)

    // Assert
    expect(toParts(range.from)).toEqual([2026, 0, 1])
    expect(toParts(range.to)).toEqual([2026, 11, 31])
  })

  it("GetYearRange_ShouldReturnPreviousYear_WhenOffsetIsNegativeOne", () => {
    // Arrange
    const reference = new Date(2026, 0, 1)

    // Act
    const range = getYearRange(reference, -1)

    // Assert
    expect(toParts(range.from)).toEqual([2025, 0, 1])
    expect(toParts(range.to)).toEqual([2025, 11, 31])
  })

  it("GetYearRange_ShouldReturnNextYear_WhenOffsetIsOne", () => {
    // Arrange
    const reference = new Date(2026, 11, 31)

    // Act
    const range = getYearRange(reference, 1)

    // Assert
    expect(toParts(range.from)).toEqual([2027, 0, 1])
    expect(toParts(range.to)).toEqual([2027, 11, 31])
  })
})

describe("getCurrentMonthRange", () => {
  it("GetCurrentMonthRange_ShouldReturnMonthOfNow_WhenSystemTimeIsMocked", () => {
    // Arrange
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 15, 10, 30))

    // Act
    const range = getCurrentMonthRange()

    // Assert
    expect(toParts(range.from)).toEqual([2026, 8, 1])
    expect(toParts(range.to)).toEqual([2026, 8, 30])
  })

  it("GetCurrentMonthRange_ShouldMatchGetMonthRange_WhenOffsetIsZero", () => {
    // Arrange
    vi.useFakeTimers()
    const now = new Date(2027, 1, 3)
    vi.setSystemTime(now)

    // Act
    const range = getCurrentMonthRange()

    // Assert
    expect(toParts(range.from)).toEqual(toParts(getMonthRange(now, 0).from))
    expect(toParts(range.to)).toEqual(toParts(getMonthRange(now, 0).to))
  })
})

describe("getMonthSpan", () => {
  it("GetMonthSpan_ShouldReturnOne_WhenRangeIsUndefined", () => {
    // Arrange / Act
    const span = getMonthSpan(undefined)

    // Assert
    expect(span).toBe(1)
  })

  it("GetMonthSpan_ShouldReturnOne_WhenRangeHasNoFrom", () => {
    // Arrange
    const range: DateRange = { from: undefined, to: new Date(2026, 8, 30) }

    // Act
    const span = getMonthSpan(range)

    // Assert
    expect(span).toBe(1)
  })

  it("GetMonthSpan_ShouldReturnOne_WhenRangeHasNoTo", () => {
    // Arrange
    const range: DateRange = { from: new Date(2026, 8, 1) }

    // Act
    const span = getMonthSpan(range)

    // Assert
    expect(span).toBe(1)
  })

  it("GetMonthSpan_ShouldReturnOne_WhenBothEndsShareTheSameMonth", () => {
    // Arrange
    const range: DateRange = {
      from: new Date(2026, 8, 5),
      to: new Date(2026, 8, 20),
    }

    // Act
    const span = getMonthSpan(range)

    // Assert
    expect(span).toBe(1)
  })

  it("GetMonthSpan_ShouldReturnTwo_WhenEndsAreInAdjacentMonths", () => {
    // Arrange
    const range: DateRange = {
      from: new Date(2026, 8, 30),
      to: new Date(2026, 9, 2),
    }

    // Act
    const span = getMonthSpan(range)

    // Assert
    expect(span).toBe(2)
  })

  it("GetMonthSpan_ShouldCapAtTwo_WhenRangeSpansMoreThanTwoMonths", () => {
    // Arrange
    const range: DateRange = {
      from: new Date(2026, 6, 1),
      to: new Date(2027, 5, 30),
    }

    // Act
    const span = getMonthSpan(range)

    // Assert
    expect(span).toBe(2)
  })

  it("GetMonthSpan_ShouldCountAcrossYearRange_WhenMonthsWrap", () => {
    // Arrange
    const range: DateRange = {
      from: new Date(2026, 11, 20),
      to: new Date(2027, 0, 5),
    }

    // Act
    const span = getMonthSpan(range)

    // Assert
    expect(span).toBe(2)
  })
})

describe("PRESETS", () => {
  it("Presets_ShouldExposeThreePresets_WhenImported", () => {
    // Arrange / Act / Assert
    expect(PRESETS).toHaveLength(3)
    expect(PRESETS.map((preset) => preset.label)).toEqual([
      "Tháng trước",
      "Tháng sau",
      "Năm trước",
    ])
  })

  it("Presets_ShouldReturnAllPresetRangesRelativeToToday_WhenInvoked", () => {
    // Arrange
    const today = new Date(2026, 8, 15)

    // Act
    const ranges = PRESETS.map((preset) => preset.getRange(today))

    // Assert
    expect(toParts(ranges[0].from)).toEqual([2026, 7, 1])
    expect(toParts(ranges[0].to)).toEqual([2026, 7, 31])
    expect(toParts(ranges[1].from)).toEqual([2026, 9, 1])
    expect(toParts(ranges[1].to)).toEqual([2026, 9, 31])
    expect(toParts(ranges[2].from)).toEqual([2025, 0, 1])
    expect(toParts(ranges[2].to)).toEqual([2025, 11, 31])
  })

  it("Presets_ShouldReturnAFreshRangeEachCall_WhenInvokedTwice", () => {
    // Arrange
    const preset = PRESETS[0]
    const today = new Date(2026, 8, 15)

    // Act
    const first = preset.getRange(today)
    const second = preset.getRange(today)

    // Assert
    expect(toParts(first.from)).toEqual(toParts(second.from))
    expect(first.from).not.toBe(second.from)
  })
})
