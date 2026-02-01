// app/api/send-bulk-email/route.ts
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

// Email templates
const emailTemplates = {
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
            <p style="color: #6b7280; font-size: 14px;">📅 ${data.date}</p>
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
            <p style="color: #6b7280; font-size: 14px;"> ${data.published_at}</p>
            <div class="news-content">
              <p style="white-space: pre-wrap;">${data.content}</p>
            </div>
           
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
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: type, data' },
        { status: 400 }
      );
    }

    // Fetch all active subscribers from Laravel backend
    const subscribersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscribers/active`);
    
    if (!subscribersResponse.ok) {
      throw new Error('Failed to fetch subscribers');
    }

    const subscribersData = await subscribersResponse.json();
    const subscribers = subscribersData.data || [];

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active subscribers to notify',
        results: { total: 0, success: 0, failed: 0 },
      });
    }

    const template = emailTemplates[type as keyof typeof emailTemplates];
    if (!template) {
      return NextResponse.json(
        { success: false, message: 'Invalid email type' },
        { status: 400 }
      );
    }

    const results = {
      success: [] as string[],
      failed: [] as { email: string; error: string }[],
    };

    // Send emails to each subscriber
    for (const subscriber of subscribers) {
      try {
        const recipientData = {
          ...data,
          unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe?token=${subscriber.token}`,
        };

        const emailContent = template(recipientData);

        const mailOptions = {
          from: `"Local Government" <${process.env.SMTP_FROM}>`,
          to: subscriber.email,
          subject: emailContent.subject,
          html: emailContent.html,
        };

        await transporter.sendMail(mailOptions);
        results.success.push(subscriber.email);

        // Small delay to avoid overwhelming SMTP server
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        console.error(`Failed to send to ${subscriber.email}:`, error.message);
        results.failed.push({
          email: subscriber.email,
          error: error.message,
        });
      }
    }

    console.log('Bulk email results:', {
      total: subscribers.length,
      success: results.success.length,
      failed: results.failed.length,
    });

    return NextResponse.json({
      success: true,
      message: 'Bulk email process completed',
      results: {
        total: subscribers.length,
        success: results.success.length,
        failed: results.failed.length,
        details: results,
      },
    });

  } catch (error: any) {
    console.error('Error in bulk email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send bulk emails', error: error.message },
      { status: 500 }
    );
  }
}