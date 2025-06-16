import express from "express";
import {
  createTicket,
  getTickets,
  getTicket,
} from "../controllers/ticket.controllers.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createTicket);
router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);



export default router;
