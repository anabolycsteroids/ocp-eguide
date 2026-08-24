import { Router } from "express";
import { locationController } from "../controllers/location.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, locationController.getAll);
router.get("/:id", authenticate, locationController.getById);
router.post("/", authenticate, authorize("ADMIN", "EMPLOYEE"), locationController.create);
router.patch("/:id", authenticate, authorize("ADMIN", "EMPLOYEE"), locationController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), locationController.delete);

export default router;
