/**
 * ALAYA INSIDER — Twilio SMS Service
 * Sends SMS messages (primarily OTP codes) using Twilio's Verify API.
 * Falls back gracefully if Twilio is not configured.
 */

const twilioClient = (() => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (accountSid && authToken) {
    try {
      // Dynamic import to prevent crash if twilio isn't installed in edge environments
      const twilio = require("twilio");
      return twilio(accountSid, authToken);
    } catch {
      console.warn("[SMS] Twilio client creation failed — SMS disabled (won't crash app)");
      return null;
    }
  }
  return null;
})();

/**
 * Send an SMS message via Twilio
 */
export async function sendSms(
  to: string,
  body: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn("[SMS] TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER missing — SMS skipped");
    return { success: false, error: "SMS not configured" };
  }

  try {
    const message = await twilioClient.messages.create({
      body,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error("[SMS] Twilio send failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send an OTP code via SMS
 * The message is short and clear for maximum deliverability
 */
export async function sendOtpSms(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  return sendSms(
    phoneNumber,
    `Your ALAYA INSIDER verification code is: ${code}. This code expires in 5 minutes. Do not share this code.`
  );
}

/**
 * Verify that Twilio is properly configured
 */
export function isTwilioConfigured(): boolean {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
}
