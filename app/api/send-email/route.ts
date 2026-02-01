// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Configuration Error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Email templates
const emailTemplates = {
  verification: (data: any) => ({
    subject: 'Verify Your Subscription',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #059669 0%, #f97316 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Verify Your Subscription</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Thank you for subscribing to our announcements and news updates!</p>
            <p>Please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${data.verifyUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #059669;">${data.verifyUrl}</p>
            <p>Once verified, you'll receive the latest announcements and news directly to your inbox.</p>
            <p>If you didn't subscribe to this service, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Local Government. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  announcement: (data: any) => ({
    subject: `New Announcement: ${data.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .badge { display: inline-block; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
          .badge-alert { background: #fee2e2; color: #991b1b; }
          .badge-event { background: #e9d5ff; color: #6b21a8; }
          .badge-update { background: #dbeafe; color: #1e40af; }
          .badge-development { background: #e0e7ff; color: #3730a3; }
          .badge-health { background: #d1fae5; color: #065f46; }
          .badge-notice { background: #fef3c7; color: #92400e; }
          .announcement-content { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; background: #f9fafb; }
          .unsubscribe { color: #6b7280; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Announcement</h1>
          </div>
          <div class="content">
            <span class="badge badge-${data.category.toLowerCase()}">${data.category.toUpperCase()}</span>
            <h2 style="color: #111827; margin: 10px 0;">${data.title}</h2>
            <p style="color: #6b7280; font-size: 14px;"> ${data.date}</p>
            <p style="color: #4b5563; margin: 15px 0;">${data.description}</p>
            <div class="announcement-content">
              <p style="white-space: pre-wrap;">${data.content}</p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Local Government. All rights reserved.</p>
            <p>You received this email because you subscribed to our announcements.</p>
            <p><a href="${data.unsubscribeUrl}" class="unsubscribe">Unsubscribe from these emails</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  news: (data: any) => ({
    subject: `Latest News: ${data.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .badge { display: inline-block; padding: 5px 10px; background: #dbeafe; color: #1e40af; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
          .news-image { width: 100%; max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0; }
          .news-content { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #059669 0%, #f97316 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; background: #f9fafb; }
          .unsubscribe { color: #6b7280; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📰 Latest News</h1>
          </div>
          <div class="content">
            <span class="badge">${data.category.toUpperCase()}</span>
            <h2 style="color: #111827; margin: 10px 0;">${data.title}</h2>
            <p style="color: #6b7280; font-size: 14px;">📅 ${data.published_at}</p>
            <div class="news-content">
              <p style="white-space: pre-wrap;">${data.content}</p>
            </div>
            ${data.readMoreUrl ? `
              <div style="text-align: center;">
                <a href="${data.readMoreUrl}" class="button">Read Full Article</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Local Government. All rights reserved.</p>
            <p>You received this email because you subscribed to our news updates.</p>
            <p><a href="${data.unsubscribeUrl}" class="unsubscribe">Unsubscribe from these emails</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, type, data } = body;

    if (!to || !type) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: to, type' },
        { status: 400 }
      );
    }

    const template = emailTemplates[type as keyof typeof emailTemplates];
    if (!template) {
      return NextResponse.json(
        { success: false, message: 'Invalid email type' },
        { status: 400 }
      );
    }

    const emailContent = template(data);

    const mailOptions = {
      from: `"Local Government" <${process.env.SMTP_FROM}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', { to, type, messageId: info.messageId });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });

  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email', error: error.message },
      { status: 500 }
    );
  }
}