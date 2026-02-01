// app/api/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      // If backend returns 404 or error, return empty array instead of throwing
      console.warn(`Backend alerts API returned ${response.status}: ${response.statusText}`)
      return NextResponse.json([])
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    // Return empty array instead of error to prevent frontend from breaking
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)

    // Validate required fields
    const required = ['disaster_date', 'disaster_type', 'establishment_type', 'suspension_start', 'suspension_end', 'status']
    const missing = required.filter(field => !body[field])

    if (missing.length > 0) {
      console.warn('Missing required fields:', missing)
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}`, details: missing },
        { status: 400 }
      )
    }

    // Validate date format - parse dates properly
    const suspensionStart = new Date(body.suspension_start + 'T00:00:00Z')
    const suspensionEnd = new Date(body.suspension_end + 'T00:00:00Z')

    console.log('Parsed dates:', {
      start: suspensionStart.toISOString(),
      end: suspensionEnd.toISOString(),
      startTime: suspensionStart.getTime(),
      endTime: suspensionEnd.getTime(),
    })

    if (isNaN(suspensionStart.getTime()) || isNaN(suspensionEnd.getTime())) {
      console.warn('Invalid date format')
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD format' },
        { status: 400 }
      )
    }

    if (suspensionEnd < suspensionStart) {
      console.warn('suspension_end must be after suspension_start', {
        start: body.suspension_start,
        end: body.suspension_end,
      })
      return NextResponse.json(
        { error: 'suspension_end must be after or equal to suspension_start' },
        { status: 400 }
      )
    }

    console.log('Sending to backend:', `${API_BASE_URL}/api/alerts`)

    const response = await fetch(`${API_BASE_URL}/api/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const responseText = await response.text()
    console.log('Backend response status:', response.status)
    console.log('Backend response body:', responseText)

    if (!response.ok) {
      try {
        const errorData = responseText ? JSON.parse(responseText) : {}
        console.error('Backend error:', errorData)
        return NextResponse.json(
          { 
            error: errorData.message || errorData.error || 'Failed to create alert',
            details: errorData.errors || errorData,
            status: response.status
          },
          { status: response.status }
        )
      } catch (parseError) {
        console.error('Error parsing response:', parseError)
        return NextResponse.json(
          { 
            error: `Backend error: ${response.status} ${response.statusText}`,
            details: responseText || 'No response body'
          },
          { status: response.status }
        )
      }
    }

    const data = responseText ? JSON.parse(responseText) : {}
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create alert',
        details: error
      },
      { status: 500 }
    )
  }
}