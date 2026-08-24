import { Router } from "express";
import { taskController } from "../controllers/task.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, taskController.getAll);
router.get("/:id", authenticate, taskController.getById);
router.post("/", authenticate, authorize("ADMIN", "EMPLOYEE"), taskController.create);
router.patch("/:id", authenticate, taskController.update);
router.delete("/:id", authenticate, authorize("ADMIN", "EMPLOYEE"), taskController.delete);

export default router;
