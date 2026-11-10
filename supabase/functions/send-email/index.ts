// Supabase Edge Function: send-email
// Dispatches verified transactional emails via Resend API
// Exclusively accessible to authorized CHIPNG administrators

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SendEmailPayload {
  to: string | string[];
  subject: string;
  message: string;
  replyTo?: string;
  html?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function wrapChipngEmailTemplate(bodyContent: string): string {
  // If the content is already a full HTML document, preserve it
  if (bodyContent.includes("<html") && bodyContent.includes("<body")) {
    return bodyContent;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CHIPNG</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 36px; background-color: #0b0f17; border-bottom: 3px solid #16a34a;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                      CHIP<span style="color: #16a34a;">NG</span>
                    </div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.8px; color: #94a3b8; margin-top: 4px; font-weight: 600;">
                      Contactless Smart NFC Cards & Link-in-Bio
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(22, 163, 74, 0.15); border: 1px solid rgba(22, 163, 74, 0.35); border-radius: 9999px; font-size: 10px; font-weight: 700; color: #22c55e; text-transform: uppercase; letter-spacing: 1px;">
                      Official Support
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px; font-size: 15px; line-height: 1.65; color: #1e293b;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #0f172a;">
                CHIPNG Technologies • Lagos, Nigeria
              </p>
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b;">
                Website: <a href="https://chipng.com" style="color: #16a34a; text-decoration: none; font-weight: 600;">https://chipng.com</a>
                &nbsp;|&nbsp;
                Support: <a href="mailto:support@chipng.com" style="color: #16a34a; text-decoration: none; font-weight: 600;">support@chipng.com</a>
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                This message was sent from CHIPNG Support using our verified transactional email engine.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          error: "The email service could not authenticate. Please contact the administrator.",
          code: "CONFIG_MISSING",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Verify User Authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Missing authorization header.", code: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Invalid session.", code: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Verify Admin Authorization
    let isAdmin = user.email === "vickthor.dennis@gmail.com";
    if (!isAdmin) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      isAdmin = Boolean(profile?.is_admin);
    }

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "You do not have permission to send emails.", code: "FORBIDDEN" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Parse and Validate Request Payload
    const body: SendEmailPayload = await req.json();
    const { to, subject, message, replyTo, html } = body;

    if (!to) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid recipient email address.", code: "INVALID_RECIPIENT" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipients = (Array.isArray(to) ? to : [to])
      .map((e) => String(e).trim().toLowerCase())
      .filter(Boolean);

    if (recipients.length === 0 || recipients.some((e) => !isValidEmail(e))) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid recipient email address.", code: "INVALID_RECIPIENT" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subject || !subject.trim()) {
      return new Response(
        JSON.stringify({ error: "Please enter an email subject.", code: "MISSING_SUBJECT" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailContent = (html || message || "").trim();
    if (!emailContent) {
      return new Response(
        JSON.stringify({ error: "Please enter an email message.", code: "MISSING_MESSAGE" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format final HTML with CHIPNG branding
    const finalHtml = wrapChipngEmailTemplate(emailContent);

    // 4. Call Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CHIPNG Support <support@chipng.com>",
        to: recipients,
        reply_to: (replyTo && isValidEmail(replyTo)) ? replyTo.trim() : "support@chipng.com",
        subject: subject.trim(),
        html: finalHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      const errorDetail = resendData?.message || resendData?.error || "Resend API rejected dispatch";
      return new Response(
        JSON.stringify({
          error: "Unable to send the email right now. Please try again.",
          details: errorDetail,
          code: "RESEND_ERROR",
        }),
        { status: resendResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Additive Email Log (Attempt to record to email_logs table)
    try {
      const logRows = recipients.map((recipient) => ({
        admin_user_id: user.id,
        recipient,
        subject: subject.trim(),
        resend_message_id: resendData.id || null,
        status: "sent",
        created_at: new Date().toISOString(),
      }));

      await supabase.from("email_logs").insert(logRows);
    } catch (_logErr) {
      // Non-blocking if table hasn't been created yet
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully.",
        messageId: resendData.id,
        recipientCount: recipients.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Unable to send the email right now. Please try again.",
        details: err?.message || "Internal server error",
        code: "SERVER_ERROR",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
