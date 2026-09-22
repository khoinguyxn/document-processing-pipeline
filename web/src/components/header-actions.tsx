import { Image, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { HeaderAction } from "@/models/header"

function UploadActionButton() {
  return (
    <Button type="button" size="sm">
      <Upload className="stroke-white" />
      <span>Tải file lên</span>
    </Button>
  )
}

function CameraActionButton() {
  return (
    <Button type="button" variant="secondary" size="sm">
      <Image className="stroke-black" />
      <span>Chọn ảnh từ điện thoại</span>
    </Button>
  )
}

const HEADER_ACTIONS: Record<HeaderAction, React.ComponentType> = {
  upload: UploadActionButton,
  camera: CameraActionButton,
}

export { CameraActionButton, HEADER_ACTIONS, UploadActionButton }
