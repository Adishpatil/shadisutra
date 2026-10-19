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
  eventDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
      const parsed = new Date(`${date}T00:00:00.000Z`);
      return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === date
      );
    }, "Please enter a valid event date."),
  message: z.string().min(10, "Message must be at least 10 characters").max(1500),
  // Honeypot field - must be empty
  website_hp: z.string().max(0, "Invalid submission"),
});

export type EnquiryFormData = z.infer<typeof enquirySchema>;
