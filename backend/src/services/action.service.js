import pool from "../config/db.js";

const ACTION_DB = { "Bật": "TURN_ON", "Tắt": "TURN_OFF" };

const TIME_SQL = "DATE_FORMAT(al.timestamp, '%H:%i:%s')";
const DATE_SQL = "DATE_FORMAT(al.timestamp, '%Y-%m-%d')";
const DMY_SQL = "DATE_FORMAT(al.timestamp, '%d/%m/%Y')";

const ACTION_SQL = `CASE al.action
  WHEN 'TURN_ON' THEN 'Bật'
  WHEN 'TURN_OFF' THEN 'Tắt'
  ELSE al.action END`;

const STATUS_SQL = `CASE WHEN al.status = 'SUCCESS' THEN ${ACTION_SQL} ELSE 'Lỗi' END`;

const ACTOR_SQL = `COALESCE(u.full_name, CASE al.triggered_by
  WHEN 'AUTOMATION' THEN 'Tự động'
  WHEN 'SENSOR' THEN 'Cảm biến'
  WHEN 'USER' THEN 'Người dùng'
  ELSE al.triggered_by END)`;

const FROM_SQL = `FROM action_logs al
  JOIN devices d ON d.id = al.device_id
  LEFT JOIN users u ON u.id = al.user_id`;

const escapeLike = (s) => s.replace(/[\\%_]/g, "\\$&");

export async function listActions({ device, action, status, search, sort, page, pageSize }) {
  const where = [];
  const params = [];

  if (device !== "all") {
    where.push("al.device_id = ?");
    params.push(device);
  }

  if (ACTION_DB[action]) {
    where.push("al.action = ?");
    params.push(ACTION_DB[action]);
  }

  if (status !== "all") {
    where.push("al.status = ?");
    params.push(status);
  }

  const keyword = search.trim();
  if (keyword) {
    where.push(`CONCAT_WS(' ', ${TIME_SQL}, ${DATE_SQL}, ${DMY_SQL}) LIKE ?`);
    params.push(`%${escapeLike(keyword)}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const dir = sort === "asc" ? "ASC" : "DESC";

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total ${FROM_SQL} ${whereSql}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT CONCAT('AC-', al.id) AS id,
            al.device_id AS device,
            d.name AS deviceName,
            d.location AS location,
            ${ACTOR_SQL} AS actor,
            ${ACTION_SQL} AS action,
            al.status AS status,
            ${TIME_SQL} AS time,
            ${DATE_SQL} AS date
     ${FROM_SQL}
     ${whereSql}
     ORDER BY al.timestamp ${dir}, al.id ${dir}
     LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize]
  );

  return { rows, total };
}