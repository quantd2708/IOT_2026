import "dotenv/config";
import http from "node:http";
import app from "./app.js";
import pool from "./config/db.js";
import { initWebSocket } from "./config/ws.js";
import { initMqtt } from "./services/mqtt.service.js";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("Đã kết nối MySQL:", process.env.DB_NAME);
  } catch (err) {
    console.error("Không kết nối được MySQL:", err.message);
    process.exit(1);
  }

  const server = http.createServer(app);
  initWebSocket(server);
  initMqtt(); // MQTT lỗi không làm dừng server, thư viện tự kết nối lại

  server.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
  });
}

start();