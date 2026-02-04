// app/api/trigger-announcement-email/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { announcement } = body;

    if (!announcement) {
      return NextResponse.json(
        { success: false, message: 'Announcement data is required' },
        { status: 400 }
      );
    }

    // Prepare email data
    const emailData = {
      title: announcement.title,
      description: announcement.description,
      content: announcement.content,
      category: announcement.category,
      date: new Date(announcement.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    // Call the bulk email API route
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-bulk-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'announcement',
        data: emailData,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send emails');
    }

    console.log('Announcement emails triggered:', result);

    return NextResponse.json({
      success: true,
      message: 'Announcement emails sent successfully',
      results: result.results,
    });

  } catch (error: any) {
    console.error('Error triggering announcement emails:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send announcement emails', error: error.message },
      { status: 500 }
    );
  }
}