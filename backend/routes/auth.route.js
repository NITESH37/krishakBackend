import express from "express"
import { logout, signin,signup,verifyEmail,forgotPassword,resetPassword,checkAuth,deleteUser} from "../controllers/auth.controllers.js";
import {verifyToken} from "../middleware/verifyToken.js"
const router = express.Router();

router.get("/check-auth",verifyToken, checkAuth)
router.post("/signup",signup);
router.post("/signin",signin);
router.post("/logout",logout);
router.post("/verify-email",verifyEmail);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password/:token",resetPassword);
router.delete('/user/delete', deleteUser);
export default router;