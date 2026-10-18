import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .min(10, "Please enter a valid 10-digit phone number")
    .max(15)
    .regex(/^[0-9+\-\s()]+$/, "Phone number contains invalid characters"),
  eventType: z.enum(["wedding", "birthday", "function", "other"], {
    message: "Please select an event type",
  }),
  eventDate: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(1500),
  // Honeypot field - must be empty
  website_hp: z.string().max(0, "Invalid submission"),
});

export type EnquiryFormData = z.infer<typeof enquirySchema>;
