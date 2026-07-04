import nodemailer from "nodemailer";

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtpEmail = async (to, otp, purpose) => {
  // Create transporter here, not at module level
  // This ensures env vars are loaded before nodemailer reads them
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Without these, a blocked/slow outbound SMTP path (common on some
    // hosts' free tiers) leaves the request hanging for nodemailer's
    // default ~2 minute timeout — which held the whole /register (or
    // /resend-otp, /forgot-password, /login) request open the entire
    // time. Fail fast instead so the caller gets a clear error quickly.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  const isReset = purpose === "reset_password";

  const subject = isReset
    ? "DevCollab — Reset Your Password"
    : "DevCollab — Verify Your Email";

  const heading = isReset ? "Reset your password" : "Verify your email address";
  const description = isReset
    ? "You requested a password reset. Enter this OTP to set a new password."
    : "Thanks for signing up! Enter this OTP to activate your account.";

  const html = `
    <!DOCTYPE html><html>
    <body style="margin:0;padding:0;background:#080b14;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding:40px 16px;">
          <table width="480" cellpadding="0" cellspacing="0"
            style="background:#0d1117;border:1px solid #1e2535;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 24px;border-bottom:1px solid #1e2535;">
                <span style="color:#fff;font-size:18px;font-weight:700;">DevCollab</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h2 style="margin:0 0 8px;color:#fff;font-size:22px;">${heading}</h2>
                <p style="margin:0 0 28px;color:#94a3b8;font-size:14px;">${description}</p>
                <div style="background:#1a2035;border:1px solid #2a3550;border-radius:12px;
                  padding:24px;text-align:center;margin-bottom:28px;">
                  <p style="margin:0 0 8px;color:#64748b;font-size:11px;
                    text-transform:uppercase;letter-spacing:1.5px;">Your OTP</p>
                  <p style="margin:0;color:#818cf8;font-size:36px;font-weight:700;
                    letter-spacing:10px;">${otp}</p>
                </div>
                <p style="margin:0;color:#64748b;font-size:13px;">
                  Expires in <strong style="color:#94a3b8;">10 minutes</strong>.
                  If you didn't request this, ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #1e2535;">
                <p style="margin:0;color:#334155;font-size:12px;">© 2025 DevCollab · IIIT Kottayam</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body></html>`;

  const info = await transporter.sendMail({
    from: `"DevCollab" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  // Not throwing just means Gmail's SMTP server *accepted* the message —
  // it doesn't guarantee inbox delivery (spam filtering, throttling on a
  // new sender, etc. happen after this). Logging the actual response
  // makes it possible to confirm from the terminal whether it was really
  // accepted, instead of just inferring it from the absence of an error.
  /*console.log(
    `[email] OTP email accepted by Gmail for ${to} — messageId: ${info.messageId}, accepted: ${info.accepted}, rejected: ${info.rejected}`,
  );*/
};
