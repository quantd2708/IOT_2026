import pool from "../config/db.js";

export async function getLatestReadings(limit = 20) {
  const [rows] = await pool.query(
    `SELECT
       sd.timestamp,
       MAX(CASE WHEN s.type = 'temperature' THEN sd.value END) AS temperature,
       MAX(CASE WHEN s.type = 'humidity'    THEN sd.value END) AS humidity,
       MAX(CASE WHEN s.type = 'light'       THEN sd.value END) AS light
     FROM sensor_data sd
     JOIN sensors s ON s.id = sd.sensor_id
     GROUP BY sd.timestamp
     ORDER BY sd.timestamp DESC
     LIMIT ?`,
    [limit]
  );

  return rows.reverse();
}

const SENSOR_TYPES = ["temperature", "humidity", "light"];
const OPERATOR_RE = /^(>=|<=|>|<|=)\s*(-?\d+(?:\.\d+)?)$/;

const TIME_SQL = "DATE_FORMAT(sd.timestamp, '%H:%i:%s')";
const DATE_SQL = "DATE_FORMAT(sd.timestamp, '%Y-%m-%d')";
const DMY_SQL = "DATE_FORMAT(sd.timestamp, '%d/%m/%Y')";
const LABEL_SQL = `CASE s.type
  WHEN 'temperature' THEN 'Nhiệt độ'
  WHEN 'humidity' THEN 'Độ ẩm'
  WHEN 'light' THEN 'Độ sáng'
  ELSE s.type END`;

// Chặn ký tự % và _ do người dùng nhập làm hỏng câu LIKE
const escapeLike = (s) => s.replace(/[\\%_]/g, "\\$&");

export async function listReadings({ mode, search, sort, page, pageSize }) {
  const where = [];
  const params = [];

  if (SENSOR_TYPES.includes(mode)) {
    where.push("s.type = ?");
    params.push(mode);
  }

  const keyword = search.trim();
  if (keyword) {
    const op = keyword.match(OPERATOR_RE);

    if (op && mode !== "time") {
      // VD: ">30" -> sd.value > 30 (op[1] đã được regex giới hạn nên an toàn)
      where.push(`sd.value ${op[1]} ?`);
      params.push(Number(op[2]));
    } else {
      const text = escapeLike(keyword.replace(/%$/, "")); // "65%" -> "65"
      const haystack =
        mode === "time"
          ? `CONCAT_WS(' ', ${TIME_SQL}, ${DATE_SQL}, ${DMY_SQL})`
          : `CONCAT_WS(' ', CONCAT('SD-', sd.id), ${LABEL_SQL}, sd.value, s.unit,
               ${TIME_SQL}, ${DATE_SQL}, ${DMY_SQL})`;

      where.push(`${haystack} LIKE ?`);
      params.push(`%${text}%`);
    }
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const dir = sort === "asc" ? "ASC" : "DESC";

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM sensor_data sd JOIN sensors s ON s.id = sd.sensor_id
     ${whereSql}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT CONCAT('SD-', sd.id) AS id,
            s.type AS sensor,
            sd.value,
            ${TIME_SQL} AS time,
            ${DATE_SQL} AS date
     FROM sensor_data sd JOIN sensors s ON s.id = sd.sensor_id
     ${whereSql}
     ORDER BY sd.timestamp ${dir}, sd.id ${dir}
     LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize]
  );

  return { rows, total };
}

// Lưu một lần đo: mỗi cảm biến một dòng, cùng chung mốc thời gian ts
export async function saveReading({ temperature, humidity, light }, ts) {
  const [sensors] = await pool.query(
    "SELECT id, type FROM sensors WHERE is_active = TRUE"
  );
  const idByType = Object.fromEntries(sensors.map((s) => [s.type, s.id]));

  const rows = Object.entries({ temperature, humidity, light })
    .filter(([type]) => idByType[type])
    .map(([type, value]) => [idByType[type], value, ts]);

  if (rows.length === 0) return;

  await pool.query(
    "INSERT INTO sensor_data (sensor_id, value, timestamp) VALUES ?",
    [rows]
  );
}