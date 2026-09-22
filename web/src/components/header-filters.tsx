import * as React from "react"

import {
  DateRangePicker,
  getCurrentMonthRange,
} from "@/components/ui/date-range-picker"
import type { HeaderFilter } from "@/models/header"
import type { DateRange } from "react-day-picker"

function DateRangeFilter() {
  const [range, setRange] = React.useState<DateRange | undefined>(
    getCurrentMonthRange
  )

  return <DateRangePicker size="sm" value={range} onValueChange={setRange} />
}

const HEADER_FILTERS: Record<HeaderFilter, React.ComponentType> = {
  "date-range": DateRangeFilter,
}

export { DateRangeFilter, HEADER_FILTERS }
