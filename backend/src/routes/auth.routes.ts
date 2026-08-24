import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema, refreshSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
