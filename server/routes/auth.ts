import { Router } from 'express';
import { sendPasswordResetEmail } from '../lib/email-service';
import { randomBytes } from 'crypto';
import { storage } from '../storage';

const router = Router();

// ... existing auth routes ...

router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Generate a random reset token
    const resetToken = randomBytes(32).toString('hex');

    // Store the reset token in the database with an expiration
    await storage.storeResetToken(email, resetToken);

    // Send the reset email
    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (emailSent) {
      console.log('Reset email sent successfully to:', email);
      res.json({ message: 'Password reset email sent successfully' });
    } else {
      console.error('Failed to send reset email to:', email);
      res.status(500).json({ error: 'Failed to send reset email' });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reset-password/confirm', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify the token and update the password
    const isValid = await storage.verifyResetToken(token);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update the user's password
    await storage.updatePasswordByResetToken(token, newPassword);

    // Clear the used reset token
    await storage.clearResetToken(token);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;