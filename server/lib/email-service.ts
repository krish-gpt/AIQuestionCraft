import { MailService } from "@sendgrid/mail";

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  console.log("Sending email...");
  try {
    await mailService.send({
      to: params.to,
      from: "support@formcreator.org", // Update this with your verified sender
      subject: params.subject,
      text: params.text || params.html?.replace(/<[^>]*>/g, '') || "",
      html: params.html || params.text,
    });
    return true;
  } catch (error) {
    console.error("SendGrid email error:", error.response?.body || error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
): Promise<boolean> {
  const resetLink = `${process.env.APP_URL}/forget?token=${resetToken}`;
  const htmlContent = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
      <p>You recently requested to reset your password for your SurveyAI account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: #0070f3; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:
        <br>
        <a href="${resetLink}">${resetLink}</a>
      </p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        If you did not request a password reset, please ignore this email or contact support 
        if you have concerns.
      </p>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; 
                  text-align: center; color: #666; font-size: 12px;">
        &copy; ${new Date().getFullYear()} SurveyAI. All rights reserved.
      </div>
    </div>
  `;

  const textContent = `
    Password Reset Request

    You recently requested to reset your password for your SurveyAI account.

    Click the following link to reset your password:
    ${resetLink}

    If you did not request a password reset, please ignore this email or contact support if you have concerns.

    © ${new Date().getFullYear()} SurveyAI. All rights reserved.
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your SurveyAI Password",
    text: textContent,
    html: htmlContent,
  });
}