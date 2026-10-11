import pool from "../config/db.js";

// tên trường frontend -> tên cột DB (danh sách cho phép, cũng chống SQL injection)
export const FIELD_MAP = {
  name: "full_name",
  studentId: "student_id",
  email: "email",
  phone: "phone",
  course: "course",
  className: "class_name",
  github: "github_link",
  figma: "figma_link",
  postman: "linkPostman",
  cv: "report_link",
};

export async function getUserById(id) {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function updateUser(id, data) {
  const keys = Object.keys(data).filter((k) => k in FIELD_MAP);

  if (keys.length > 0) {
    const setSql = keys.map((k) => `${FIELD_MAP[k]} = ?`).join(", ");
    const values = keys.map((k) => data[k]);
    await pool.query(`UPDATE users SET ${setSql} WHERE id = ?`, [...values, id]);
  }

  return getUserById(id);
}

export async function setAvatarPath(id, avatarPath) {
  await pool.query("UPDATE users SET avatar_url = ? WHERE id = ?", [avatarPath, id]);
}