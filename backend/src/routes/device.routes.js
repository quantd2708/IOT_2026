import { Router } from "express";
import { list, toggle } from "../controllers/device.controller.js";

const router = Router();

router.get("/", list);
router.post("/:id/toggle", toggle);

export default router;