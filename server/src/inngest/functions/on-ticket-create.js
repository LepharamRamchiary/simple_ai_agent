import { inngest } from "../client";
import { Ticket } from "../../models/ticket.model.js";
import { User } from "../../models/user.model.js";
import { sendEmail } from "../../utils/mailer.js";
import { NonRetriableError } from "inngest";
import analyzeTicket from "../../../utils/agent.js";

export const onTicketCreate = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },

  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      // fetch the ticket from the database
      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObj = await Ticket.findById(ticketId);
        if (!ticket) {
          throw new NonRetriableError(`Ticket with ID ${ticketId} not found`);
        }
        return ticketObj;
      });

      await step.run("upadete-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, {
          status: "TODO",
        });
      });
      const aiResponse = await analyzeTicket(ticket);

      const relatedSkills = await step.run("ai-processing", async () => {
        let skills = [];
        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            status: "IN_PROCESSED",
            summary: aiResponse.summary,
            priority: !["low", "medium", "high", "critical"].includes(
              aiResponse.priority
            )
              ? "medium"
              : aiResponse.priority,
            helpfulNotes: aiResponse.helpfulNotes,
            relatedSkills: aiResponse.requiredSkills,
          });
          skills = aiResponse.requiredSkills;
        }
        return skills;
      });

      const moderator = await step.run("assign-moderator", async () => {
        let user = await User.findOne({
          role: "moderator",
          skills: {
            $elemMatch: {
              $regex: relatedSkills.join("|"),
              $options: "i",
            },
          },
        });

        if (!user) {
          user = await User.findOne({ role: "admin" });
        }

        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user?._id || null,
        });

        return user;
      });

      await step.run("send-email-notification", async () => {
        if (moderator) {
          const finalTicket = await Ticket.findById(ticket._id);
          await sendEmail(
            moderator.email,
            `New Ticket Assigned: ${ticket.title}`,
            `You have been assigned a new ticket ${finalTicket.title}`
          );
        }
      });

      return { success: true };
    } catch (err) {
      console.error("Error in onTicketCreate function:", err.message);
      return { sucess: false };
    }
  }
);
