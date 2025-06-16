import express from "express";
import {
  createTicket,
  getTickets,
  getTicket,
} from "../controllers/ticket.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createTicket);
router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);



export default router;
