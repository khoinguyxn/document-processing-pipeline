import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createFileRoute } from "@tanstack/react-router"
import { Image, Upload } from "lucide-react"

export const Route = createFileRoute("/app/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="flex h-full w-full flex-col items-center justify-center bg-accent">
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
    </main>
  )
}
