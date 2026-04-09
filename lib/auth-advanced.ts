import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

// Generate password reset token
export function generateResetToken(email: string): string {
    return jwt.sign(
        { email, type: 'password-reset' },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
}

// Verify password reset token
export function verifyResetToken(token: string): { email: string; type: string } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.type === 'password-reset') {
            return { email: decoded.email, type: decoded.type };
        }
        return null;
    } catch {
        return null;
    }
}

// Generate email verification token
export function generateVerificationToken(email: string): string {
    return jwt.sign(
        { email, type: 'email-verification' },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

// Verify email verification token
export function verifyVerificationToken(token: string): { email: string; type: string } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.type === 'email-verification') {
            return { email: decoded.email, type: decoded.type };
        }
        return null;
    } catch {
        return null;
    }
}

// Send password reset email (preview mode - no actual email)
export async function sendPasswordResetEmail(email: string, resetToken: string) {
    const resetLink = `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password?token=${resetToken}`;

    // For development/testing - log the reset link
    console.log(`\n📧 Password Reset Link for ${email}:`);
    console.log(`${resetLink}\n`);

    // In production, you'd use nodemailer or similar
    // For now, we'll just return the link for testing
    return {
        success: true,
        message: 'Password reset email sent (check console in dev)',
        resetLink, // Remove this in production
    };
}

// Send verification email (preview mode - no actual email)
export async function sendVerificationEmail(email: string, verificationToken: string) {
    const verificationLink = `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${verificationToken}`;

    console.log(`\n📧 Email Verification Link for ${email}:`);
    console.log(`${verificationLink}\n`);

    return {
        success: true,
        message: 'Verification email sent (check console in dev)',
        verificationLink, // Remove this in production
    };
}
