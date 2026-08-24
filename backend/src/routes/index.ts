import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import internshipRoutes from "./internship.routes";
import taskRoutes from "./task.routes";
import requestRoutes from "./request.routes";
import notificationRoutes from "./notification.routes";
import locationRoutes from "./location.routes";
import qrRoutes from "./qr.routes";
import presenceRoutes from "./presence.routes";
import placeRoutes from "./place.routes";
import guestRoutes from "./guest.routes";
import guestPublicRoutes from "./guest-public.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/internships", internshipRoutes);
router.use("/tasks", taskRoutes);
router.use("/requests", requestRoutes);
router.use("/notifications", notificationRoutes);
router.use("/locations", locationRoutes);
router.use("/qr", qrRoutes);
router.use("/presence", presenceRoutes);
router.use("/places", placeRoutes);
router.use("/guest", guestRoutes);
router.use("/guest-public", guestPublicRoutes);

export default router;
