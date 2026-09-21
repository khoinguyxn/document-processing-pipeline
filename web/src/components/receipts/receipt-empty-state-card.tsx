import { Upload, Image } from "lucide-react"
import { Button } from "../ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "../ui/card"

export function ReceiptEmptyStateCard() {
  return (
    <Card className="w-2/5 justify-center text-center">
      <CardHeader className="w-full items-center justify-items-center">
        <Button disabled variant="outline" size="icon-lg">
          <Upload className="stroke-primary" />
        </Button>
        <CardTitle>Chưa có hoá đơn nào trong lô này</CardTitle>
        <CardDescription className="text-wrap">
          Kéo thả bản scan vào đây, hoặc gửi từ máy scan ở lễ tân. PDF, JPG và
          PNG tối đa 20 MB mỗi file.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <CardAction className="flex w-full flex-wrap gap-3">
          <Button className="grow basis-0">
            <Upload className="stroke-white" />
            <span>Tải file lên</span>
          </Button>
          <Button variant="secondary" className="grow basis-0">
            <Image className="stroke-black" />
            <span>Chọn ảnh từ điện thoại</span>
          </Button>
        </CardAction>
      </CardContent>
    </Card>
  )
}
