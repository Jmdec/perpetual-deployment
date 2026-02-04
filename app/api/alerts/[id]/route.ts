// app/api/alerts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Helper function to format date to YYYY-MM-DD
function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    
    // Format to YYYY-MM-DD
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

interface BackendAlertBody {
  disaster_date?: string
  disaster_type?: string
  establishment_type?: string
  suspension_start?: string
  suspension_end?: string
  notes?: string
  status?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const apiUrl = `${API_BASE_URL}/api/alerts/${id}`.replace('/api/api/', '/api/')
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    const responseText = await response.text()
    console.log('Backend response status:', response.status)
    console.log('Backend response body:', responseText)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Alert not found' },
          { status: 404 }
        )
      }
      const errorData = responseText ? JSON.parse(responseText) : {}
      throw new Error(errorData.message || `Failed to fetch alert: ${response.statusText}`)
    }

    const data = responseText ? JSON.parse(responseText) : {}
    
    // Map backend field names to frontend field names and format dates
    const mappedData = {
      ...data,
      disaster_date: formatDateForInput(data.disaster_date),
      suspension_start_date: formatDateForInput(data.suspension_start || data.suspension_start_date),
      suspension_end_date: formatDateForInput(data.suspension_end || data.suspension_end_date),
      disaster_type: data.disaster_type || '',
      establishment_type: data.establishment_type || '',
      notes: data.notes || '',
      status: data.status || 'active',
    }
    
    console.log('Mapped data:', mappedData)
    
    return NextResponse.json(mappedData)
  } catch (error) {
    console.error('Error fetching alert:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alert' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    console.log('Received body from frontend:', body)

    // Map frontend field names to backend field names
    const backendBody: BackendAlertBody = {}
    
    if (body.disaster_date !== undefined) backendBody.disaster_date = body.disaster_date
    if (body.disaster_type !== undefined) backendBody.disaster_type = body.disaster_type
    if (body.establishment_type !== undefined) backendBody.establishment_type = body.establishment_type
    if (body.suspension_start !== undefined) backendBody.suspension_start = body.suspension_start
    if (body.suspension_end !== undefined) backendBody.suspension_end = body.suspension_end
    if (body.notes !== undefined) backendBody.notes = body.notes
    if (body.status !== undefined) backendBody.status = body.status

    // Validate date relationships if both dates are provided
    if (backendBody.suspension_start && backendBody.suspension_end) {
      const suspensionStart = new Date(backendBody.suspension_start)
      const suspensionEnd = new Date(backendBody.suspension_end)

      if (suspensionEnd <= suspensionStart) {
        return NextResponse.json(
          { error: 'Suspension end date must be after suspension start date' },
          { status: 400 }
        )
      }
    }

    console.log('Sending to backend:', backendBody)

    const apiUrl = `${API_BASE_URL}/api/alerts/${id}`.replace('/api/api/', '/api/')
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(backendBody),
    })

    const responseText = await response.text()
    console.log('Backend response status:', response.status)
    console.log('Backend response body:', responseText)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Alert not found' },
          { status: 404 }
        )
      }
      const errorData = responseText ? JSON.parse(responseText) : {}
      throw new Error(errorData.error || errorData.message || `Failed to update alert: ${response.statusText}`)
    }

    const data = responseText ? JSON.parse(responseText) : {}
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update alert' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const apiUrl = `${API_BASE_URL}/api/alerts/${id}`.replace('/api/api/', '/api/')
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Alert not found' },
          { status: 404 }
        )
      }
      throw new Error(`Failed to delete alert: ${response.statusText}`)
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}