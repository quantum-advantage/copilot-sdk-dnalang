import type { NextRequest } from "next/server"

// Real-time telemetry streaming endpoint
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendData = () => {
        const data = {
          timestamp: Date.now(),
          lambda: 0.85 + Math.random() * 0.1,
          phi: 2.176435e-8 * (1 + Math.random() * 0.2),
          gamma: 0.05 + Math.random() * 0.05,
          coherence: 0.92 + Math.random() * 0.06,
          entropy: -0.15 - Math.random() * 0.1,
          qbyte_rate: 1200 + Math.random() * 400,
        }

        const message = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      // Send initial data
      sendData()

      // Send data every second
      const interval = setInterval(sendData, 1000)

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
