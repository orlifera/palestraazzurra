import { z } from "zod"

/** Shared by the form (client) and the route handler (server). Error codes map to `contact.errors.*`. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "name").max(120, "name"),
  email: z.email("email").trim().max(200, "email"),
  subject: z.string().trim().min(2, "subject").max(160, "subject"),
  message: z.string().trim().min(10, "message").max(5000, "message"),
  consent: z.literal(true, "consent"),
  locale: z.enum(["it", "en"]).default("it"),
  /** Honeypot: humans never see this field. */
  website: z.string().max(0).optional(),
})

export type ContactInput = z.input<typeof contactSchema>
export type ContactField = "name" | "email" | "subject" | "message" | "consent"
