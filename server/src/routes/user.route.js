import express from "express";
import {
  signup,
  login,
  logout,
  updateUser,
  getUsers,
} from "../controllers/user.controllers.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.post("/logout", authenticate, logout);
router.put("/update-user", authenticate, updateUser);
router.get("/users", authenticate, getUsers);

export default router;
