import { z } from "zod";
import { CURRENCIES } from "@/lib/giving";
export const giftSchema = z.object({
  amount: z.coerce.number().min(1, "Minimum gift is 1.00").max(100000, "For gifts above 100,000 please contact the finance office."),
  currency: z.enum(CURRENCIES),
  fund: z.enum(["offering", "tithe", "special", "projects", "missions"]),
  frequency: z.enum(["one_time", "monthly"]),
  name: z.string().max(120).optional().default(""),
  email: z.string().email("Please enter a valid email for your receipt."),
  note: z.string().max(300).optional().default(""),
});
