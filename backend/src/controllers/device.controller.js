import { listDevices, getDeviceById, logAction } from "../services/device.service.js";
import { sendCommand } from "../services/mqtt.service.js";

export async function list(req, res) {
  res.json({ data: await listDevices() });
}

export async function toggle(req, res) {
  const { on } = req.body ?? {};
  if (typeof on !== "boolean") {
    return res.status(400).json({ message: "Trường 'on' phải là true hoặc false" });
  }

  const device = await getDeviceById(req.params.id);
  if (!device) return res.status(404).json({ message: "Không tìm thấy thiết bị" });
  if (!device.mqttKey) {
    return res.status(400).json({ message: "Thiết bị này không điều khiển được" });
  }

  const requestedAt = new Date(); // ghi nhận thời điểm bấm, không phải lúc có kết quả
  const result = await sendCommand(device.mqttKey, on);

  // Lệnh trước chưa xong: không gửi lệnh mới, cũng không ghi log
  if (result.reason === "busy") {
    return res.status(409).json({ message: "Thiết bị đang xử lý lệnh trước đó" });
  }

  try {
    await logAction({
      deviceId: device.id,
      userId: Number(process.env.CURRENT_USER_ID) || null,
      action: on ? "TURN_ON" : "TURN_OFF",
      status: result.ok ? "SUCCESS" : "FAILED",
      triggeredBy: "USER",
      at: requestedAt,
    });
  } catch (err) {
    console.error("Không ghi được action_logs:", err.message);
  }

  if (result.ok) {
    return res.json({ id: device.id, on, status: "SUCCESS" });
  }

  const timeout = result.reason === "timeout";
  res.status(timeout ? 504 : 503).json({
    id: device.id,
    on: device.status === "ON",
    status: "FAILED",
    message: timeout
      ? "Thiết bị không phản hồi sau 3 giây"
      : "Không gửi được lệnh tới MQTT broker",
  });
}