import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, notificationController.getAll);
router.patch("/:id/read", authenticate, notificationController.markAsRead);
router.patch("/read-all", authenticate, notificationController.markAllAsRead);

export default router;
