import { Router } from "express";
import { qrController } from "../controllers/qr.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.post("/generate", authenticate, authorize("ADMIN", "EMPLOYEE"), qrController.generate);
router.get("/:id", authenticate, qrController.getById);
router.get("/scan/:token", qrController.getByToken);
router.patch("/:id/deactivate", authenticate, authorize("ADMIN", "EMPLOYEE"), qrController.deactivate);

export default router;
