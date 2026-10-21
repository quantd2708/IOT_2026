import pool from "../config/db.js";

export async function listDevices() {
  const [rows] = await pool.query(
    `SELECT id, name, location, device_type AS type,
            current_status AS status, mqtt_key AS mqttKey
     FROM devices
     ORDER BY id`
  );
  return rows;
}

export async function getDeviceById(id) {
  const [rows] = await pool.query(
    `SELECT id, name, current_status AS status, mqtt_key AS mqttKey
     FROM devices WHERE id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

export async function getDeviceByMqttKey(key) {
  const [rows] = await pool.query(
    "SELECT id, name FROM devices WHERE mqtt_key = ?",
    [key]
  );
  return rows[0] ?? null;
}

export async function setDeviceStatus(id, status) {
  await pool.query("UPDATE devices SET current_status = ? WHERE id = ?", [status, id]);
}

export async function logAction({ deviceId, userId, action, status, triggeredBy, at }) {
  const [result] = await pool.query(
    `INSERT INTO action_logs (device_id, user_id, action, status, triggered_by, timestamp)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [deviceId, userId, action, status, triggeredBy, at]
  );
  return result; 
}

export async function updateLogStatus(logId, status) {
  const [result] = await pool.query(
    `UPDATE action_logs SET status = ? WHERE id = ?`,
    [status, logId]
  );
  return result;
}