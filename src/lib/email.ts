import "server-only";
import { Resend } from "resend";

export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Dev fallback: no email provider configured, print to the server console.
    console.log(`\n[email] to=${to} subject="${subject}"\n${html}\n`);
    return;
  }
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "KamKarOAI <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
  if (error) throw new Error(`Failed to send email: ${error.message}`);
}
