import nodemailer from "nodemailer";

const EMAIL_MODE = process.env.EMAIL_MODE || "console";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const port = Number(process.env.SMTP_PORT) || 587;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // port 465 uses implicit TLS; everything else (587, 2525) uses STARTTLS
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      // Allows Gmail App Passwords and Mailtrap without certificate issues
      rejectUnauthorized: false,
    },
  });

  return transporter;
}

interface MailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email. In "console" mode (the default for local development),
 * it just logs the email to the terminal instead of dispatching it, so the
 * whole flow can be tested without SMTP credentials. Set EMAIL_MODE=smtp
 * and fill in SMTP_* vars in .env to actually send email (e.g. via Mailtrap
 * for testing or Gmail SMTP for production).
 */
export async function sendMail({ to, subject, html }: MailInput): Promise<void> {
  if (EMAIL_MODE !== "smtp") {
    console.log("\n=== 📧 EMAIL (console mode - not actually sent) ===");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${html.replace(/<[^>]+>/g, " ").trim()}`);
    console.log("=== end email ===\n");
    return;
  }

  const from = process.env.EMAIL_FROM || "SmartCart <no-reply@smartcart.com>";
  await getTransporter().sendMail({ from, to, subject, html });
}

// ---------------------------------------------------------------------------
// Shared layout wrapper
// ---------------------------------------------------------------------------
function emailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SmartCart</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#2563eb;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:-0.5px;">🛒 SmartCart</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                © ${new Date().getFullYear()} SmartCart. You're receiving this email because you have an account with us.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ---------------------------------------------------------------------------
// Welcome email — sent after user registration
// ---------------------------------------------------------------------------
export function welcomeEmail(name: string) {
  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">Welcome to SmartCart, ${name}! 🎉</h2>
    <p style="margin:0 0 16px;color:#6b7280;font-size:15px;">We're excited to have you on board.</p>

    <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
      Your account has been created successfully. You can now browse our products,
      add items to your cart, and place orders — all in one place.
    </p>

    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#2563eb;border-radius:6px;padding:12px 24px;">
          <a href="${process.env.CLIENT_URL || "http://localhost:5173"}"
             style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
            Start Shopping →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
      If you didn't create this account, please ignore this email.
    </p>
  `;

  return {
    subject: "Welcome to SmartCart 🎉",
    html: emailLayout(content),
  };
}

// ---------------------------------------------------------------------------
// Order confirmation email — sent after a successful checkout
// ---------------------------------------------------------------------------
export function orderConfirmationEmail(name: string, orderId: string, total: number) {
  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">Order Confirmed! ✅</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Thanks for shopping with SmartCart, ${name}.</p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:14px;color:#6b7280;padding-bottom:8px;">Order Number</td>
              <td align="right" style="font-size:14px;font-weight:bold;color:#111827;padding-bottom:8px;">#${orderId}</td>
            </tr>
            <tr>
              <td style="font-size:14px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:8px;">Order Total</td>
              <td align="right" style="font-size:18px;font-weight:bold;color:#2563eb;border-top:1px solid #e5e7eb;padding-top:8px;">
                $${total.toFixed(2)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
      We've received your order and it's now being processed. You'll be able to
      track your order status from your account.
    </p>

    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#2563eb;border-radius:6px;padding:12px 24px;">
          <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/orders"
             style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
            View Order History →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
      Questions about your order? Reply to this email and we'll be happy to help.
    </p>
  `;

  return {
    subject: `Order Confirmed — #${orderId}`,
    html: emailLayout(content),
  };
}

// ---------------------------------------------------------------------------
// Password reset email — sent when a reset is requested
// ---------------------------------------------------------------------------
export function passwordResetEmail(name: string, resetLink: string) {
  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">Reset Your Password 🔐</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Hi ${name}, we received a request to reset your SmartCart password.</p>

    <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
      Click the button below to choose a new password. This link will expire in
      <strong>1 hour</strong> for your security.
    </p>

    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#2563eb;border-radius:6px;padding:12px 24px;">
          <a href="${resetLink}"
             style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
            Reset Password →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;color:#374151;font-size:13px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 24px;word-break:break-all;">
      <a href="${resetLink}" style="color:#2563eb;font-size:13px;">${resetLink}</a>
    </p>

    <p style="margin:0;font-size:13px;color:#9ca3af;">
      If you didn't request a password reset, you can safely ignore this email.
      Your password will remain unchanged.
    </p>
  `;

  return {
    subject: "Reset your SmartCart password",
    html: emailLayout(content),
  };
}

// ---------------------------------------------------------------------------
// Order status update email — sent when admin changes the order status
// ---------------------------------------------------------------------------
const STATUS_META: Record<string, { label: string; colour: string; emoji: string; message: string }> = {
  pending: {
    label: "Pending",
    colour: "#f59e0b",
    emoji: "🕐",
    message: "We've received your order and it's waiting to be processed.",
  },
  processing: {
    label: "Processing",
    colour: "#3b82f6",
    emoji: "⚙️",
    message: "Great news! Your order is currently being prepared.",
  },
  shipped: {
    label: "Shipped",
    colour: "#8b5cf6",
    emoji: "🚚",
    message: "Your order is on its way! It has been handed over to the courier.",
  },
  delivered: {
    label: "Delivered",
    colour: "#10b981",
    emoji: "✅",
    message: "Your order has been delivered. We hope you enjoy your purchase!",
  },
  cancelled: {
    label: "Cancelled",
    colour: "#ef4444",
    emoji: "❌",
    message: "Your order has been cancelled. If you have any questions, please contact us.",
  },
};

export function orderStatusUpdateEmail(name: string, orderId: string, status: string) {
  const meta = STATUS_META[status] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    colour: "#6b7280",
    emoji: "📦",
    message: `Your order status has been updated to ${status}.`,
  };

  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">Order Update ${meta.emoji}</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Hi ${name}, here's the latest on your order.</p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:14px;color:#6b7280;padding-bottom:8px;">Order Number</td>
              <td align="right" style="font-size:14px;font-weight:bold;color:#111827;padding-bottom:8px;">#${orderId}</td>
            </tr>
            <tr>
              <td style="font-size:14px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:8px;">New Status</td>
              <td align="right" style="border-top:1px solid #e5e7eb;padding-top:8px;">
                <span style="display:inline-block;background:${meta.colour};color:#ffffff;font-size:13px;font-weight:bold;padding:4px 12px;border-radius:999px;">
                  ${meta.label}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
      ${meta.message}
    </p>

    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#2563eb;border-radius:6px;padding:12px 24px;">
          <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/orders"
             style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
            View Order History →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
      Questions? Reply to this email and we'll be happy to help.
    </p>
  `;

  return {
    subject: `Order #${orderId} — Status Updated to ${meta.label}`,
    html: emailLayout(content),
  };
}
