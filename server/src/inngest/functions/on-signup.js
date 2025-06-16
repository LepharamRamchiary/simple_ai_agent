import { inngest } from "../client.js";
import  User from "../../models/user.model.js";
import { sendEmail } from "../../utils/mailer.js";
import { NonRetriableError } from "inngest";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      const user = await step.run("get-user-email", async () => {
        const userObject = await User.findOne({ email });
        if (!userObject) {
          throw new NonRetriableError("User no longer in our DB");
        }
        return userObject;
      });

      await step.run("send-welcome-email", async () => {
        const subject = "Welcome to Our Service!";
        const message = `Hello,\n\n Thank you for signing up! We're excited to have you on board.\n\nBest regards,\nThe Team`;
        await sendEmail(user.email, subject, message);
      });

      return { success: true };
    } catch (error) {
      console.error("Error in running step", error.message);
      return { success: false };
    }
  }
);
