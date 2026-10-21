import fs from "node:fs/promises";
import path from "node:path";
import { AVATAR_DIR } from "../config/upload.js";
import { getUserById, updateUser, setAvatarPath } from "../services/profile.service.js";

const currentUserId = () => Number(process.env.CURRENT_USER_ID) || 1;

const RULES = {
  name:      { max: 100, required: true },
  studentId: { max: 20,  required: true },
  email:     { max: 100, required: true, email: true },
  phone:     { max: 20 },
  course:    { max: 100 },
  className: { max: 50 },
  github:    { max: 255, url: true },
  figma:     { max: 255, url: true },
  postman:   { max: 255, url: true },
  cv:        { max: 255, url: true },
};

function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function validate(body) {
  const data = {};

  for (const [key, rule] of Object.entries(RULES)) {
    if (body[key] === undefined) continue;
    const value = String(body[key]).trim();

    if (rule.required && !value) return { error: `Thiếu trường ${key}` };
    if (value.length > rule.max) return { error: `${key} quá dài (tối đa ${rule.max} ký tự)` };
    if (value && rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return { error: "Email không hợp lệ" };
    if (value && rule.url && !isHttpUrl(value))
      return { error: `${key} phải là đường dẫn http(s)` };

    data[key] = value === "" && !rule.required ? null : value;
  }

  return { data };
}

function toDto(u, req) {
  const base = `${req.protocol}://${req.get("host")}`;
  const avatar = !u.avatar_url
    ? ""
    : /^https?:\/\//.test(u.avatar_url)
      ? u.avatar_url
      : base + u.avatar_url;

  return {
    name: u.full_name,
    studentId: u.student_id,
    email: u.email,
    phone: u.phone ?? "",
    course: u.course ?? "",
    className: u.class_name ?? "",
    github: u.github_link ?? "",
    figma: u.figma_link ?? "",
    postman: u.linkPostman ?? "",
    cv: u.report_link ?? "",
    avatar,
  };
}

// Xóa file ảnh cũ trên đĩa (basename chặn kiểu đường dẫn "../")
async function removeAvatarFile(avatarPath) {
  if (!avatarPath || !avatarPath.startsWith("/uploads/avatars/")) return;
  await fs.unlink(path.join(AVATAR_DIR, path.basename(avatarPath))).catch(() => {});
}

const notFound = (res) => res.status(404).json({ message: "Không tìm thấy người dùng" });

export async function get(req, res) {
  const user = await getUserById(currentUserId());
  if (!user) return notFound(res);
  res.json(toDto(user, req));
}

export async function update(req, res) {
  const { data, error } = validate(req.body ?? {});
  if (error) return res.status(400).json({ message: error });

  try {
    const user = await updateUser(currentUserId(), data);
    if (!user) return notFound(res);
    res.json(toDto(user, req));
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email hoặc mã sinh viên đã tồn tại" });
    }
    throw err;
  }
}

export async function uploadAvatar(req, res) {
  if (!req.file) return res.status(400).json({ message: "Chưa chọn ảnh" });

  const newPath = `/uploads/avatars/${req.file.filename}`;
  const user = await getUserById(currentUserId());

  if (!user) {
    await removeAvatarFile(newPath);
    return notFound(res);
  }

  await setAvatarPath(user.id, newPath);
  await removeAvatarFile(user.avatar_url); // dọn ảnh cũ

  res.json(toDto(await getUserById(user.id), req));
}

export async function deleteAvatar(req, res) {
  const user = await getUserById(currentUserId());
  if (!user) return notFound(res);

  await setAvatarPath(user.id, null);
  await removeAvatarFile(user.avatar_url);

  res.json(toDto(await getUserById(user.id), req));
}