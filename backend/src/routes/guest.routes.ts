import { Router } from "express";
import { guestController } from "../controllers/guest.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getVisitSchema,
  checkInSchema,
  updateVisitStatusSchema,
  createVisitSchema,
} from "../validators/guest.validator";

const router = Router();

router.get("/hosts/search", authenticate, guestController.searchHosts);
router.get("/visits", authenticate, validate(getVisitSchema, "body"), guestController.getMyVisits);
router.get("/visit/active", authenticate, guestController.getMyActiveVisit);
router.post("/visit", authenticate, validate(createVisitSchema), guestController.createVisit);
router.patch("/visit/:id/status", authenticate, validate(updateVisitStatusSchema), guestController.updateVisitStatus);
router.post("/visit/:id/check-in", authenticate, validate(checkInSchema), guestController.checkIn);
router.post("/visit/:id/check-out", authenticate, guestController.checkOut);
router.get("/host/:hostId/presence", authenticate, guestController.getHostPresence);
router.get("/notifications", authenticate, guestController.getNotifications);
router.post("/visit/:id/qr", authenticate, guestController.generateQr);
router.get("/visit/:id", authenticate, guestController.getVisitById);

export default router;
