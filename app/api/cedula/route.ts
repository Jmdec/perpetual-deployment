// app/api/cedula/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie using async cookies()
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    console.log('GET /api/cedula - Token exists:', !!token)

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - No token provided" 
      }, { status: 401 })
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
    // Use the admin route for fetching all cedulas
    const url = `${API_URL}/admin/cedulas${queryString ? `?${queryString}` : ''}`

    console.log('Fetching cedulas:', {
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
      console.error('Raw response (last 500 chars):', responseText.substring(Math.max(0, responseText.length - 500)))
      
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
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get token from cookie using async cookies()
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    console.log('POST /api/cedula - Token exists:', !!token)
    console.log('POST /api/cedula - Request body:', body)

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - No token provided" 
      }, { status: 401 })
    }

    // First, get the current user to obtain user_id
    const userResponse = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to authenticate user" 
      }, { status: 401 })
    }

    const userData = await userResponse.json()
    const userId = userData?.data?.user?.id

    console.log('POST /api/cedula - User ID:', userId)

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: "User ID not found" 
      }, { status: 401 })
    }

    // Convert camelCase to snake_case for Laravel
    const payload = {
      user_id: userId,
      full_name: body.full_name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      birth_date: body.birth_date,
      civil_status: body.civil_status,
      citizenship: body.citizenship,
      occupation: body.occupation,
      tin_number: body.tin_number || null,
      height: body.height,
      height_unit: body.height_unit,
      weight: body.weight,
      weight_unit: body.weight_unit,
    }

    console.log('POST /api/cedula - Payload to Laravel:', payload)
    console.log('POST /api/cedula - API URL:', `${API_URL}/cedula`)

    const response = await fetch(`${API_URL}/cedula`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    console.log('POST /api/cedula - Laravel response status:', response.status)

    const data = await response.json()
    console.log('POST /api/cedula - Laravel response data:', data)

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to submit application", errors: data.errors },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Cedula POST API Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...formData } = body
    
    // Get token from cookie using async cookies()
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    console.log('PUT /api/cedula - Token exists:', !!token)

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - No token provided" 
      }, { status: 401 })
    }

    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      birth_date: formData.birth_date,
      civil_status: formData.civil_status,
      citizenship: formData.citizenship,
      occupation: formData.occupation,
      tin_number: formData.tin_number || null,
      height: formData.height,
      height_unit: formData.height_unit,
      weight: formData.weight,
      weight_unit: formData.weight_unit,
    }

    const response = await fetch(`${API_URL}/cedula/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    console.log('PUT /api/cedula - Response status:', response.status)

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to update application", errors: data.errors },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Cedula PUT API Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    // Get token from cookie using async cookies()
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    console.log('DELETE /api/cedula - Token exists:', !!token)

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized - No token provided" 
      }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: "ID is required" 
      }, { status: 400 })
    }

    const response = await fetch(`${API_URL}/cedula/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    console.log('DELETE /api/cedula - Response status:', response.status)

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to delete application" },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Cedula DELETE API Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}