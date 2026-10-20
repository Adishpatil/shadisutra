"use server";

import { enquirySchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { consumeRateLimit, rateLimitKey } from "@/lib/security/rate-limit";

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

  try {
    const requestHeaders = await headers();
    const allowed = await consumeRateLimit(
      rateLimitKey(requestHeaders, "contact"),
      1,
      10
    );
    if (!allowed) {
      return {
        success: false,
        message: "Please wait a few seconds before submitting another enquiry.",
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("enquiries").insert({
      name: validation.data.name,
      phone: validation.data.phone,
      event_type: validation.data.eventType,
      event_date: validation.data.eventDate || null,
      message: validation.data.message,
    });
    if (error) {
      return {
        success: false,
        message: "Your enquiry could not be submitted. Please try again later.",
      };
    }
  } catch {
    return {
      success: false,
      message: "Your enquiry could not be submitted. Please try again later.",
    };
  }

  return {
    success: true,
    message: "Thank you! Your enquiry has been received. Our planning team will reach out to you shortly.",
  };
}
