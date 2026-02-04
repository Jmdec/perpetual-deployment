import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import nodemailer from "nodemailer"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { message, recipientEmail, recipientName, originalSubject } = body
    const { id } = await params

    // Save reply to Laravel backend first
    const response = await fetch(`${LARAVEL_API_URL}/admin/contacts/${id}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({ message }),
    })

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json(data, { status: response.status })
    }

    // Send email using Nodemailer
    try {
      // Use MAIL_* variables (Laravel style) or SMTP_* variables (Next.js style)
      const smtpHost = process.env.SMTP_HOST || process.env.MAIL_HOST
      const smtpPort = parseInt(process.env.SMTP_PORT || process.env.MAIL_PORT || "587")
      const smtpSecure = process.env.SMTP_SECURE === "true" || process.env.MAIL_ENCRYPTION === "ssl"
      const smtpUser = process.env.SMTP_USER || process.env.MAIL_USERNAME
      const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASSWORD
      const smtpFrom = process.env.SMTP_FROM || process.env.MAIL_FROM_ADDRESS

      if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
        throw new Error("Missing required SMTP configuration")
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })

      // Verify connection before sending
      await transporter.verify()

      await transporter.sendMail({
        from: `"Perpetual Village Government" <${smtpFrom}>`,
        to: recipientEmail,
        subject: `Re: ${originalSubject}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(to right, #059669, #f97316); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">Perpetual Village Government</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Response to Your Inquiry</p>
              </div>
              <div class="content">
                <p>Dear ${recipientName},</p>
                <p>Thank you for contacting Perpetual Village Government. We have reviewed your message regarding: <strong>${originalSubject}</strong></p>
                
                <div class="message">
                  <h3 style="margin-top: 0; color: #059669;">Our Response:</h3>
                  <p style="white-space: pre-wrap;">${message}</p>
                </div>

                <p>If you have any further questions or concerns, please don't hesitate to reach out to us.</p>
                
                <p>Best regards,<br>
                <strong>Perpetual Village Government</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated response from Perpetual Village Government.<br>
                Please do not reply directly to this email.</p>
                <p>© ${new Date().getFullYear()} Perpetual Village Government. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Dear ${recipientName},\n\nThank you for contacting Perpetual Village Government. We have reviewed your message regarding: ${originalSubject}\n\nOur Response:\n${message}\n\nIf you have any further questions or concerns, please don't hesitate to reach out to us.\n\nBest regards,\nPerpetual Village Government`,
      })

      return NextResponse.json({
        success: true,
        message: "Reply sent successfully",
        data: data.data,
      })
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      // Reply was saved but email failed
      return NextResponse.json({
        success: false,
        message: `Reply saved but email sending failed: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`,
        data: data.data,
        emailError: true,
      }, { status: 500 })
    }
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to send reply" },
      { status: 500 }
    )
  }
}