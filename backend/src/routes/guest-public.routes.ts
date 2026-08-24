import { Router } from "express";
import { guestPublicController } from "../controllers/guest-public.controller";
import { validate } from "../middleware/validate";
import { createPublicVisitSchema } from "../validators/guest.validator";

const router = Router();

router.get("/hosts/search", guestPublicController.searchHosts);
router.post("/visit", validate(createPublicVisitSchema), guestPublicController.createVisit);
router.get("/visit/:token", guestPublicController.getVisit);
router.get("/visit-id/:id", guestPublicController.getVisitById);
router.post("/visit/:id/qr", guestPublicController.generateQr);
router.get("/host/:hostId/presence", guestPublicController.getHostPresence);
router.get("/places", guestPublicController.getPlaces);

export default router;
