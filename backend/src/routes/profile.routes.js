import { Router } from "express";
import { avatarUpload } from "../config/upload.js";
import { get, update, uploadAvatar, deleteAvatar } from "../controllers/profile.controller.js";

const router = Router();

router.get("/", get);
router.put("/", update);
router.post("/avatar", avatarUpload, uploadAvatar);
router.delete("/avatar", deleteAvatar);

export default router;