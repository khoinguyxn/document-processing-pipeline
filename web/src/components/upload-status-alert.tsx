import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "cn"
import { Check, Pen, TriangleAlert, X } from "lucide-react"

type UploadStatusVariant = "loading" | "success" | "destructive"

interface UploadStatusPreset {
  accent: string
  iconWrapper: string
  icon: React.ReactNode
  iconLabel: string
  title: string
  description: string
  copyLayout: "inline" | "stacked"
  progress?: number
  action?: React.ReactNode
}

const UPLOAD_STATUS_PRESETS: Record<UploadStatusVariant, UploadStatusPreset> = {
  loading: {
    accent: "border-blue-100",
    iconWrapper: "border-none bg-blue-100",
    icon: <Spinner className="stroke-blue-900" />,
    iconLabel: "Đang tải lên",
    title: "Đang đọc 9 hoá đơn",
    description: "Đã xong 3 hoá đơn, đang đọc 6 hoá đơn còn lại.",
    copyLayout: "inline",
    progress: 33,
    action: (
      <AlertAction>
        <Button variant="destructive" size="icon" aria-label="Huỷ tải lên">
          <X />
        </Button>
      </AlertAction>
    ),
  },
  success: {
    accent: "border-green-100",
    iconWrapper: "border-none bg-green-100",
    icon: <Check className="stroke-green-900" />,
    iconLabel: "Đã tải lên",
    title: "Đã tải lên",
    description: "Đã tải lên 9 hoá đơn thành công.",
    copyLayout: "stacked",
  },
  destructive: {
    accent: "border-red-100",
    iconWrapper: "border-none bg-red-100",
    icon: <TriangleAlert className="stroke-red-900" />,
    iconLabel: "Cần kiểm tra",
    title: "3 hoá đơn cần bạn kiểm tra trước khi xuất lô này",
    description:
      "2 hoá đơn có trường thông tin không chắc chắn, 1 hoá đơn có trường thông tin sai. Vui lòng kiểm tra lại trước khi xuất lô này.",
    copyLayout: "stacked",
    action: (
      <AlertAction>
        <Button size="icon" aria-label="Kiểm tra">
          <Pen />
        </Button>
      </AlertAction>
    ),
  },
}

export function UploadStatusAlert({
  variant = "success",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: UploadStatusVariant
}) {
  const preset = UPLOAD_STATUS_PRESETS[variant]
  const copy = (
    <>
      <AlertTitle
        className={
          preset.copyLayout === "inline" ? undefined : "whitespace-normal"
        }
      >
        {preset.title}
      </AlertTitle>
      <AlertDescription className="text-wrap">
        {preset.description}
      </AlertDescription>
    </>
  )

  return (
    <Alert className={cn(className, preset.accent)} {...props}>
      <Button
        disabled
        className={preset.iconWrapper}
        variant="outline"
        size="icon"
        aria-label={preset.iconLabel}
      >
        {preset.icon}
      </Button>
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          preset.copyLayout === "inline" ? "gap-2" : "gap-0.5"
        )}
      >
        {preset.copyLayout === "inline" ? (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {copy}
          </div>
        ) : (
          copy
        )}
        {preset.progress === undefined ? null : (
          <Progress indicatorClassName="bg-blue-100" value={preset.progress} />
        )}
      </div>
      {preset.action}
    </Alert>
  )
}
