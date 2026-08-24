import { Router } from "express";
import { requestController } from "../controllers/request.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, requestController.getAll);
router.get("/:id", authenticate, requestController.getById);
router.post("/", authenticate, requestController.create);
router.patch("/:id", authenticate, requestController.update);

export default router;
