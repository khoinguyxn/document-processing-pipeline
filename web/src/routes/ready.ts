import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/ready")({
  server: {
    handlers: {
      GET: async () => {
        const isReady = await CHECK_CRITICAL_DEPENDENCIES()

        if (isReady) {
          return Response.json({
            status: "ready",
            timestamp: new Date().toISOString(),
          })
        } else {
          return Response.json(
            {
              status: "not ready",
              timestamp: new Date().toISOString(),
            },
            { status: 503 }
          )
        }
      },
    },
  },
})

const CHECK_CRITICAL_DEPENDENCIES = () => Promise.resolve(true)
