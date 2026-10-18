"use server";

import { enquirySchema } from "@/lib/validation";

// Simple in-memory rate limiting map for dev/server actions (IP or timestamp based)
const submissionTimestamps = new Map<string, number>();

export interface SubmitEnquiryResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export async function submitEnquiryAction(
  prevState: SubmitEnquiryResult | null,
  formData: FormData
): Promise<SubmitEnquiryResult> {
  // Extract values
  const rawData = {
    name: formData.get("name")?.toString() || "",
    phone: formData.get("phone")?.toString() || "",
    eventType: formData.get("eventType")?.toString() || "wedding",
    eventDate: formData.get("eventDate")?.toString() || "",
    message: formData.get("message")?.toString() || "",
    website_hp: formData.get("website_hp")?.toString() || "",
  };

  // 1. Honeypot check (bots fill this invisible field)
  if (rawData.website_hp && rawData.website_hp.length > 0) {
    // Silently pretend success to fool bots
    return {
      success: true,
      message: "Thank you for reaching out! We will contact you soon.",
    };
  }

  // 2. Validate with Zod
  const validation = enquirySchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0]?.toString() || "general";
      errors[field] = issue.message;
    }
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors,
    };
  }

  // 3. Basic Rate limit check (limit 1 enquiry per 10 seconds per phone)
  const phoneKey = validation.data.phone.replace(/\D/g, "");
  const lastSubmit = submissionTimestamps.get(phoneKey);
  const now = Date.now();
  if (lastSubmit && now - lastSubmit < 10000) {
    return {
      success: false,
      message: "Please wait a few seconds before submitting another enquiry.",
    };
  }
  submissionTimestamps.set(phoneKey, now);

  // In Phase 2, this will persist to Supabase `enquiries` table using supabase client.
  // For now, it validates and returns success cleanly.
  return {
    success: true,
    message: "Thank you! Your enquiry has been received. Our planning team will reach out to you shortly.",
  };
}
