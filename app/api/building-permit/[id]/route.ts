// app/api/building-permit/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get token from HTTP-only cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated. Please log in again.' },
        { status: 401 }
      )
    }

    // Await params in Next.js 15
    const { id } = await context.params

    console.log('Fetching building permit by ID:', {
      id,
      url: `${LARAVEL_API_URL}/building-permit/${id}`,
      hasAuth: !!token,
    })

    const response = await fetch(`${LARAVEL_API_URL}/building-permit/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
    })

    // Get raw text first to check what we're receiving
    const responseText = await response.text()
    
    console.log('Laravel raw response:', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      textLength: responseText.length,
      textPreview: responseText.substring(0, 200)
    })

    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw response:', responseText.substring(0, 1000))
      
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON response from server. Please check Laravel logs for errors.',
          debug: {
            status: response.status,
            contentType: response.headers.get('content-type'),
            preview: responseText.substring(0, 500)
          }
        },
        { status: 500 }
      )
    }

    console.log('Laravel response:', {
      status: response.status,
      success: data.success,
    })

    return NextResponse.json(data, { status: response.status })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get token from HTTP-only cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated. Please log in again.' },
        { status: 401 }
      )
    }

    // Await params in Next.js 15
    const { id } = await context.params
    const body = await request.json()

    console.log('Updating building permit status:', {
      id,
      url: `${LARAVEL_API_URL}/building-permit/${id}/status`,
      hasAuth: !!token,
      bodyKeys: Object.keys(body),
    })

    const response = await fetch(`${LARAVEL_API_URL}/building-permit/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    // Get raw text first to check what we're receiving
    const responseText = await response.text()
    
    console.log('Laravel raw response:', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      textLength: responseText.length,
      textPreview: responseText.substring(0, 200)
    })

    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw response:', responseText)
      
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid response from server. Please check Laravel logs.',
          debug: {
            status: response.status,
            contentType: response.headers.get('content-type'),
            preview: responseText.substring(0, 500)
          }
        },
        { status: 500 }
      )
    }

    console.log('Laravel response:', {
      status: response.status,
      success: data.success,
      message: data.message,
    })

    return NextResponse.json(data, { status: response.status })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get token from HTTP-only cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated. Please log in again.' },
        { status: 401 }
      )
    }

    // Await params in Next.js 15
    const { id } = await context.params
    const formData = await request.formData()

    // Add _method for Laravel to handle PUT with FormData
    formData.append('_method', 'PUT')

    console.log('Updating building permit:', {
      id,
      url: `${LARAVEL_API_URL}/building-permit/${id}`,
      hasAuth: !!token,
      hasFiles: formData.has('documents'),
    })

    const response = await fetch(`${LARAVEL_API_URL}/building-permit/${id}`, {
      method: 'POST', // Laravel uses POST with _method for file uploads
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: formData,
    })

    const responseText = await response.text()
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid response from server.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: response.status })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get token from HTTP-only cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated. Please log in again.' },
        { status: 401 }
      )
    }

    // Await params in Next.js 15
    const { id } = await context.params

    console.log('Deleting building permit:', {
      id,
      url: `${LARAVEL_API_URL}/building-permit/${id}`,
      hasAuth: !!token,
    })

    const response = await fetch(`${LARAVEL_API_URL}/building-permit/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    const responseText = await response.text()
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid response from server.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: response.status })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}