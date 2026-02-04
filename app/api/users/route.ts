import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = searchParams.get('page')
    const perPage = searchParams.get('per_page')

    // Build query string
    const queryParams = new URLSearchParams()
    if (status && status !== 'all') queryParams.append('status', status)
    if (search) queryParams.append('search', search)
    if (page) queryParams.append('page', page)
    if (perPage) queryParams.append('per_page', perPage)

    const queryString = queryParams.toString()
    const url = `${LARAVEL_API_URL}/users${queryString ? `?${queryString}` : ''}`

    console.log('Fetching users:', {
      url,
      hasAuth: !!token,
    })

    const response = await fetch(url, {
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
      console.error('Raw response (first 1000 chars):', responseText.substring(0, 1000))
      
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

export async function PATCH(request: NextRequest) {
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

    // Get the request body
    const body = await request.json()
    const { userId, status } = body

    if (!userId || !status) {
      return NextResponse.json(
        { success: false, message: 'User ID and status are required' },
        { status: 400 }
      )
    }

    console.log('Updating user status:', {
      userId,
      status,
      hasAuth: !!token,
    })

    const url = `${LARAVEL_API_URL}/users/${userId}/status`

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ status }),
    })

    // Get raw text first
    const responseText = await response.text()
    
    console.log('Laravel status update response:', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      textLength: responseText.length,
      textPreview: responseText.substring(0, 200)
    })

    // Handle empty response
    if (!responseText || responseText.trim() === '') {
      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: 'Status updated successfully'
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            message: `Server returned status ${response.status} with empty response`
          },
          { status: response.status }
        )
      }
    }

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
          message: 'Invalid JSON response from server',
          debug: {
            status: response.status,
            preview: responseText.substring(0, 500)
          }
        },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: response.status })

  } catch (error) {
    console.error('PATCH API route error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}