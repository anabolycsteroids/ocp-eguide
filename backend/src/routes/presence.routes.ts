import { Router } from "express";
import { presenceController } from "../controllers/presence.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/me", authenticate, presenceController.getMine);
router.get("/sweep", presenceController.sweepStale);
router.post("/bulk", authenticate, presenceController.getMultiple);
router.post("/heartbeat", authenticate, presenceController.heartbeat);
router.patch("/status", authenticate, presenceController.setStatus);
router.get("/", authenticate, presenceController.getAll);
router.get("/:userId", authenticate, presenceController.get);

export default router;
