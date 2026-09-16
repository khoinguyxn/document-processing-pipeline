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
        <CardContent className="grid grid-cols-2 grid-rows-1 gap-2">
          <CardAction className="col-span-2 col-start-1 row-span-1 row-start-1 grid w-full grid-cols-[repeat(2,minmax(max-content,1fr))] grid-rows-1 gap-3 justify-self-stretch">
            <Button className="w-full">
              <Upload className="stroke-white" />
              <span>Tải file lên</span>
            </Button>
            <Button variant="secondary" className="w-full">
              <Image className="stroke-black" />
              <span>Chọn ảnh từ điện thoại</span>
            </Button>
          </CardAction>
        </CardContent>
      </Card>
    </main>
  )
}
