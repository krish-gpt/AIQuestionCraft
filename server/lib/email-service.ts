import { MailService } from '@sendgrid/mail';

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: 'noreply@surveyai.com', // Update this with your verified sender
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    console.log('Email sent successfully to:', params.to);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string, 
  resetToken: string
): Promise<boolean> {
  const text = `
    Password Reset Request

    You recently requested to reset your password for your SurveyAI account.
    Your password reset token is: ${resetToken}

    Please use this token in the password reset form to create a new password.

    If you did not request a password reset, please ignore this email or contact support if you have concerns.
  `;

  const html = `
    <h1>Password Reset Request</h1>
    <p>You recently requested to reset your password for your SurveyAI account.</p>
    <p>Your password reset token is: <strong>${resetToken}</strong></p>
    <p>Please use this token in the password reset form to create a new password.</p>
    <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your SurveyAI Password',
    text,
    html,
  });
}