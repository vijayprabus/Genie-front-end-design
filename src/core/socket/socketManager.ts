import { io, type Socket } from "socket.io-client";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3000";

class SocketManager {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      autoConnect: false,
      auth: {
        token: localStorage.getItem("authToken"),
      },
    });

    this.socket.connect();
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  on<T>(event: string, callback: (data: T) => void) {
    this.socket?.on(event, callback as (...args: unknown[]) => void);
  }

  off(event: string) {
    this.socket?.off(event);
  }

  emit<T>(event: string, data?: T) {
    this.socket?.emit(event, data);
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketManager = new SocketManager();
