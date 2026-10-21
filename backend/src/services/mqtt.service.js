import mqtt from "mqtt";
import { broadcast } from "../config/ws.js";
import { saveReading } from "./sensor.service.js";
import { getDeviceByMqttKey, setDeviceStatus } from "./device.service.js";

const PREFIX = process.env.MQTT_TOPIC_PREFIX || "b23dccn684/esp32";
const SENSOR_TOPIC = `${PREFIX}/sensor/data`;
const COMMAND_PREFIX = `${PREFIX}/device/command/`;
const STATUS_PREFIX = `${PREFIX}/device/status/`;

export const ACK_TIMEOUT_MS = 3000;

let client = null;

const pending = new Map();

export function initMqtt() {
  client = mqtt.connect(process.env.MQTT_URL, {
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS,
    reconnectPeriod: 3000,
  });

  client.on("connect", () => {
    console.log("Đã kết nối MQTT broker:", process.env.MQTT_URL);
    client.subscribe([SENSOR_TOPIC, `${STATUS_PREFIX}+`], (err) => {
      if (err) console.error("Không đăng ký được topic MQTT:", err.message);
    });
  });

  client.on("reconnect", () => console.log("Đang kết nối lại MQTT..."));
  client.on("error", (err) => console.error("MQTT lỗi:", err.message));

  client.on("message", (topic, payload) => {
    const text = payload.toString().trim();

    if (topic === SENSOR_TOPIC) {
      handleSensor(text);
    } else if (topic.startsWith(STATUS_PREFIX)) {
      handleStatus(topic.slice(STATUS_PREFIX.length), text);
    }
  });
}


async function handleSensor(text) {
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.warn("Payload cảm biến không phải JSON:", text);
    return;
  }

  const { temp, hum, light } = json;
  if ([temp, hum, light].some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    console.warn("Payload cảm biến thiếu hoặc sai kiểu:", text);
    return;
  }

  const reading = { temperature: temp, humidity: hum, light };
  const ts = new Date();
  ts.setMilliseconds(0);

  broadcast({ type: "sensor", data: { timestamp: ts.toISOString(), ...reading } });

  try {
    await saveReading(reading, ts);
  } catch (err) {
    console.error("Lỗi ghi dữ liệu cảm biến:", err.message);
  }
}


async function handleStatus(key, text) {
  if (text !== "ON" && text !== "OFF") return;

  const waiting = pending.get(key);
  if (waiting && waiting.expected === text) {
    clearTimeout(waiting.timer);
    pending.delete(key);
    waiting.resolve({ ok: true });
  }

  try {
    const device = await getDeviceByMqttKey(key);
    if (!device) return;

    await setDeviceStatus(device.id, text);
    broadcast({ type: "device", data: { id: device.id, on: text === "ON" } });
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái thiết bị:", err.message);
  }
}

// ---------- Gửi lệnh và chờ phản hồi ----------
export function sendCommand(key, on) {
  return new Promise((resolve) => {
    if (!client || !client.connected) return resolve({ ok: false, reason: "offline" });
    if (pending.has(key)) return resolve({ ok: false, reason: "busy" });

    const expected = on ? "ON" : "OFF";

    const timer = setTimeout(() => {
      pending.delete(key);
      resolve({ ok: false, reason: "timeout" });
    }, ACK_TIMEOUT_MS);

    pending.set(key, { expected, timer, resolve });

    client.publish(`${COMMAND_PREFIX}${key}`, expected, (err) => {
      if (err) {
        clearTimeout(timer);
        pending.delete(key);
        resolve({ ok: false, reason: "offline" });
      }
    });
  });
}