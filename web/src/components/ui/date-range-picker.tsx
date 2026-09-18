import * as React from "react"
import { cn } from "cn"
import { vi } from "date-fns/locale"
import { CalendarIcon, ChevronDown } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatDate, getCurrentDate } from "@/lib/datetime"

function getMonthRange(reference: Date, offset: number): DateRange {
  const year = reference.getFullYear()
  const month = reference.getMonth() + offset

  return {
    from: new Date(year, month, 1),
    to: new Date(year, month + 1, 0),
  }
}

function getYearRange(reference: Date, offset: number): DateRange {
  const year = reference.getFullYear() + offset

  return {
    from: new Date(year, 0, 1),
    to: new Date(year, 11, 31),
  }
}

function getCurrentMonthRange() {
  return getMonthRange(getCurrentDate(), 0)
}

type Preset = {
  label: string
  getRange: (today: Date) => DateRange
}

const PRESETS: Preset[] = [
  { label: "Tháng trước", getRange: (today) => getMonthRange(today, -1) },
  { label: "Tháng sau", getRange: (today) => getMonthRange(today, 1) },
  { label: "Năm trước", getRange: (today) => getYearRange(today, -1) },
]

function getMonthSpan(range: DateRange | undefined) {
  if (!range?.from || !range.to) return 1

  const months =
    (range.to.getFullYear() - range.from.getFullYear()) * 12 +
    (range.to.getMonth() - range.from.getMonth())

  return Math.min(months + 1, 2)
}

function DateRangePicker({
  value,
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "value" | "onChange"> & {
  value?: DateRange
  onValueChange?: (range: DateRange | undefined) => void
}) {
  const [open, setOpen] = React.useState(false)

  const label =
    value?.from && value.to
      ? `${formatDate(value.from)} – ${formatDate(value.to)}`
      : "Chọn khoảng thời gian"

  const numberOfMonths = getMonthSpan(value)

  const defaultMonth =
    numberOfMonths === 2 && value?.to ? value.to : value?.from

  function applyPreset(preset: Preset) {
    onValueChange?.(preset.getRange(getCurrentDate()))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-slot="date-range-picker"
          variant="outline"
          className={cn(
            "justify-start gap-2 bg-background font-normal",
            className
          )}
          {...props}
        >
          <CalendarIcon data-icon="inline-start" />
          <span
            data-slot="date-range-picker-label"
            className="data-[empty=true]:text-muted-foreground"
            data-empty={!value?.from}
          >
            {label}
          </span>
          <ChevronDown
            data-icon="inline-end"
            className={cn(
              "opacity-50 transition-transform",
              open && "rotate-180"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto overflow-hidden p-0">
        <Card size="sm" className="gap-0 p-0">
          <CardContent className="px-0">
            <Calendar
              mode="range"
              locale={vi}
              numberOfMonths={numberOfMonths}
              defaultMonth={defaultMonth}
              selected={value}
              onSelect={onValueChange}
              autoFocus
            />
          </CardContent>
          <CardFooter className="flex-wrap gap-1 border-t py-3">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="xs"
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

export {
  DateRangePicker,
  getCurrentMonthRange,
  getMonthRange,
  getMonthSpan,
  getYearRange,
  PRESETS,
}
export type { DateRange, Preset }
