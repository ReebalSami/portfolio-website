import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/contact-schema";
import { getContactFormConfig } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = contactFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { name, email, subject, message, website } = result.data;

    if (website && website.length > 0) {
      return NextResponse.json({ success: true });
    }

    const config = getContactFormConfig();
    const apiKey = process.env[config.apiKeyEnvVar];

    if (!apiKey) {
      console.error(`Missing env var: ${config.apiKeyEnvVar}`);
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    if (config.provider === "resend") {
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      };

      const notificationRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers,
        body: JSON.stringify({
          from: "Portfolio Contact <onboarding@resend.dev>",
          to: config.recipientEmail,
          subject: `[Portfolio] ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
          reply_to: email,
        }),
      });

      if (!notificationRes.ok) {
        const errorData = await notificationRes.json();
        console.error("Resend error:", errorData);
        return NextResponse.json(
          { error: "Failed to send email" },
          { status: 500 }
        );
      }

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers,
        body: JSON.stringify({
          from: "Reebal Sami <onboarding@resend.dev>",
          to: email,
          subject: "Thanks for reaching out!",
          text: `Hi ${name},\n\nThank you for your message. I received it and will get back to you as soon as possible.\n\nBest regards,\nReebal Sami\nhttps://reebal-sami.com`,
        }),
      }).catch((err) => {
        console.error("Confirmation email failed:", err);
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
