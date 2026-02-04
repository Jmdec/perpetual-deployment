// app/api/trigger-news-email/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { news } = body;

    if (!news) {
      return NextResponse.json(
        { success: false, message: 'News data is required' },
        { status: 400 }
      );
    }

    // Prepare email data
    const emailData = {
      title: news.title,
      content: news.content,
      category: news.category,
      published_at: news.published_at 
        ? new Date(news.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
      imageUrl: news.image 
        ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/${news.image}`
        : null,
      readMoreUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/news/${news.id}`,
    };

    // Call the bulk email API route
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-bulk-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'news',
        data: emailData,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send emails');
    }

    console.log('News emails triggered:', result);

    return NextResponse.json({
      success: true,
      message: 'News emails sent successfully',
      results: result.results,
    });

  } catch (error: any) {
    console.error('Error triggering news emails:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send news emails', error: error.message },
      { status: 500 }
    );
  }
}