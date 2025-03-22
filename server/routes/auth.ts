import { sendPasswordResetEmail } from "../lib/email-service";
import { randomBytes } from "crypto";
import { storage } from "../storage";
import { hash } from "bcrypt";

// ... existing imports and code ...

router.post("/reset-password", async (req, res) => {
  console.log(req.body, "reset password");
  try {
    const { email } = req.body;

    // Generate a random reset token
    const resetToken = randomBytes(32).toString("hex");

    // Store the reset token in the database with an expiration (2 hours)
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    await storage.storeResetToken(email, resetToken, expiresAt);

    // Send the reset email
    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (emailSent) {
      res.json({ message: "Password reset email sent successfully" });
    } else {
      res.status(500).json({ error: "Failed to send reset email" });
    }
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reset-password/confirm", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify the token and get the associated email
    const resetInfo = await storage.verifyResetToken(token);

    if (!resetInfo || resetInfo.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update the user's password
    await storage.updateUserPassword(resetInfo.email, hashedPassword);

    // Clear the used reset token
    await storage.clearResetToken(token);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password reset confirmation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
