import { Router } from "express";
import { latest, list } from "../controllers/sensor.controller.js";

const router = Router();

router.get("/latest", latest);
router.get("/", list);

export default router;