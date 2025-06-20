import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { serve } from "inngest/express";
import userRouters from "./routes/user.route.js";
import ticketRouters from "./routes/ticket.route.js";
import { inngest } from "./inngest/client.js";
import { onTicketCreate } from "./inngest/functions/on-ticket-create.js";
import { onUserSignup } from "./inngest/functions/on-signup.js";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

app.use("/api/auth", userRouters);
app.use("/api/tickets", ticketRouters);

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onTicketCreate, onUserSignup],
  })
);

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((error) => console.log(error));
