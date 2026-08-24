import { Router } from "express";
import { internshipController } from "../controllers/internship.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, internshipController.getAll);
router.get("/:id", authenticate, internshipController.getById);
router.post("/", authenticate, authorize("ADMIN", "EMPLOYEE"), internshipController.create);
router.patch("/:id", authenticate, authorize("ADMIN", "EMPLOYEE"), internshipController.update);
router.get("/:id/progress", authenticate, internshipController.getProgress);
router.patch("/:id/progress", authenticate, authorize("ADMIN", "EMPLOYEE"), internshipController.updateProgress);

export default router;
