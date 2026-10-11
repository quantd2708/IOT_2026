import multer from "multer";
import path from "node:path";
import fs from "node:fs";

export const UPLOAD_ROOT = path.resolve("uploads");
export const AVATAR_DIR = path.join(UPLOAD_ROOT, "avatars");
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: AVATAR_DIR,
    // Tự đặt tên file, không dùng tên do người dùng gửi lên
    filename: (req, file, cb) =>
      cb(null, `avatar-${Date.now()}-${Math.round(Math.random() * 1e6)}${EXT[file.mimetype]}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (EXT[file.mimetype]) cb(null, true);
    else cb(new Error("Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF"));
  },
}).single("avatar");

// Bọc lại để lỗi upload trả về JSON 400 thay vì lỗi 500
export function avatarUpload(req, res, next) {
  upload(req, res, (err) => {
    if (!err) return next();
    const message = err.code === "LIMIT_FILE_SIZE" ? "Ảnh tối đa 2MB" : err.message;
    res.status(400).json({ message });
  });
}