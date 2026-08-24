import { Router } from "express";
import { placeController } from "../controllers/place.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, placeController.getAll);
router.get("/code/:code", authenticate, placeController.getByCode);
router.get("/:id", authenticate, placeController.getById);
router.patch("/:id/occupancy", authenticate, authorize("ADMIN", "EMPLOYEE"), placeController.updateOccupancy);
router.get("/:id/history", authenticate, placeController.getOccupancyHistory);

export default router;
