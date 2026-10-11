import { WebSocketServer, WebSocket } from "ws";

let wss;

export function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket) => {
    socket.isAlive = true;
    socket.on("pong", () => {
      socket.isAlive = true;
    });
    socket.on("error", (err) => console.error("WebSocket lỗi:", err.message));
  });

  // Mỗi 30s kiểm tra, ngắt các kết nối không còn phản hồi
  const timer = setInterval(() => {
    for (const socket of wss.clients) {
      if (!socket.isAlive) {
        socket.terminate();
        continue;
      }
      socket.isAlive = false;
      socket.ping();
    }
  }, 30000);

  wss.on("close", () => clearInterval(timer));
}

// Gửi một tin nhắn tới tất cả trình duyệt đang mở Dashboard
export function broadcast(message) {
  if (!wss) return;
  const text = JSON.stringify(message);

  for (const socket of wss.clients) {
    if (socket.readyState === WebSocket.OPEN) socket.send(text);
  }
}