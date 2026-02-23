export interface DataStreamConfig {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export interface TelemetryData {
  timestamp: number
  lambda: number
  phi: number
  gamma: number
  coherence: number
  entropy: number
  qbyte_rate: number
}

export class RealTimeDataStream {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts: number
  private reconnectInterval: number
  private url: string
  private listeners: ((data: TelemetryData) => void)[] = []
  private connectionListeners: ((status: "connected" | "disconnected" | "error") => void)[] = []

  constructor(config: DataStreamConfig) {
    this.url = config.url
    this.reconnectInterval = config.reconnectInterval || 3000
    this.maxReconnectAttempts = config.maxReconnectAttempts || 10
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.notifyConnectionListeners("connected")
        console.log("[v0] WebSocket connected for real-time telemetry")
      }

      this.ws.onmessage = (event) => {
        try {
          const data: TelemetryData = JSON.parse(event.data)
          this.notifyListeners(data)
        } catch (err) {
          console.error("[v0] Failed to parse WebSocket message:", err)
        }
      }

      this.ws.onerror = () => {
        this.notifyConnectionListeners("error")
      }

      this.ws.onclose = () => {
        this.notifyConnectionListeners("disconnected")
        this.attemptReconnect()
      }
    } catch (err) {
      console.error("[v0] WebSocket connection failed:", err)
      this.notifyConnectionListeners("error")
      this.attemptReconnect()
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`[v0] Reconnecting in ${this.reconnectInterval}ms... (attempt ${this.reconnectAttempts})`)
      setTimeout(() => this.connect(), this.reconnectInterval)
    } else {
      console.error("[v0] Max reconnection attempts reached")
    }
  }

  subscribe(callback: (data: TelemetryData) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }

  onConnectionChange(callback: (status: "connected" | "disconnected" | "error") => void) {
    this.connectionListeners.push(callback)
    return () => {
      this.connectionListeners = this.connectionListeners.filter((l) => l !== callback)
    }
  }

  private notifyListeners(data: TelemetryData) {
    this.listeners.forEach((listener) => listener(data))
  }

  private notifyConnectionListeners(status: "connected" | "disconnected" | "error") {
    this.connectionListeners.forEach((listener) => listener(status))
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.error("[v0] WebSocket not connected")
    }
  }
}
