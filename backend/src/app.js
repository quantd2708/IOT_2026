import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import sensorRoutes from "./routes/sensor.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import { UPLOAD_ROOT } from "./config/upload.js";
import deviceRoutes from "./routes/device.routes.js";
import actionRoutes from "./routes/action.routes.js";

const app = express();

// 1. Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// 2. Route
app.get("/api/health/db", async (req, res) => {
  try {
    const [tables] = await pool.query("SHOW TABLES");
    res.json({ status: "ok", tables });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.use("/api/sensors", sensorRoutes);
app.use("/api/profile", profileRoutes);
app.use("/uploads", express.static(UPLOAD_ROOT)); // cho phép trình duyệt xem ảnh đã upload
app.use("/api/devices", deviceRoutes);
app.use("/api/actions", actionRoutes);

// 3. Xử lý lỗi chung (luôn đặt cuối cùng)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Lỗi server" });
});

export default app;