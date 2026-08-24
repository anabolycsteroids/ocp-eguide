import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, authorize("ADMIN", "EMPLOYEE"), userController.getAll);
router.get("/employees", authenticate, userController.getEmployees);
router.get("/employees/:id/status", authenticate, userController.getEmployeeStatus);
router.patch("/employees/:id/status", authenticate, userController.updateStatus);
router.get("/supervisor/:supervisorId/interns", authenticate, authorize("ADMIN", "EMPLOYEE"), userController.getInternsBySupervisor);
router.get("/me/interns", authenticate, authorize("ADMIN", "EMPLOYEE"), userController.getInternsBySupervisor);
router.get("/:id", authenticate, userController.getById);

export default router;
