export const passwordResetTemplate = (resetLink: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9; line-height: 1.6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 560px; border-collapse: collapse;">
          
          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <h1 style="margin: 16px 0 0 0; font-size: 38px; font-weight: 700; color: #2d5556;">Spraada</h1>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 32px 32px 0 32px; text-align: center;">
                    <div style="width: 56px; height: 56px; background-color: #eff6ff; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                     <div
                        style="
                          width: 56px;
                          height: 56px;
                          background-color: #eff6ff;
                          border-radius: 50%;
                          text-align: center;
                          line-height: 56px;
                          margin: 0 auto 20px auto;
                          font-size: 26px;
                        "
                      >
                        🔒
                      </div>
                    </div>
                    <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 600; color: #2d5556;">Reset Your Password</h2>
                    <p style="margin: 0; font-size: 15px; color: #64748b;">We received a request to reset your password</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 24px 32px;">
                    <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; text-align: center;">
                      Click the button below to create a new password. This link will expire in <strong style="color: #2d5556;">20 minutes</strong> for security purposes.
                    </p>
                    
                    <!-- CTA Button -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center">
                          <a href="${resetLink}" 
                             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #407374 0%, #2d5556 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 10px; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.4);">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 24px 0 0 0; font-size: 13px; color: #94a3b8; text-align: center;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #3b82f6; text-align: center; word-break: break-all;">
                      ${resetLink}
                    </p>
                  </td>
                </tr>
                
                <!-- Divider -->
                <tr>
                  <td style="padding: 0 32px;">
                    <div style="height: 1px; background-color: #e2e8f0;"></div>
                  </td>
                </tr>
                
                <!-- Security Notice -->
                <tr>
                  <td style="padding: 24px 32px 32px 32px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fefce8; border-radius: 8px; padding: 16px;">
                      <tr>
                        <td style="padding: 16px;">
                          <p style="margin: 0; font-size: 13px; color: #854d0e;">
                            <strong>⚠️ Didn't request this?</strong><br>
                            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 20px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;">
                Rent. Share. Build.
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} Spraada. All rights reserved.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 12px; color: #94a3b8;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
