import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'All fields are required' 
        },
        { status: 400 }
      )
    }

    // Call Laravel API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        subject,
        message,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || 'Failed to send message',
          errors: data.errors 
        },
        { status: response.status }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: data.message || 'Message sent successfully!',
        data: data.data 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Contact API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'An unexpected error occurred. Please try again later.' 
      },
      { status: 500 }
    )
  }
}