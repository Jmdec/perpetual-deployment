import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Define the base URL for your Laravel API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authentication token found' },
        { status: 401 }
      )
    }

    console.log('Fetching applications with token:', token.substring(0, 10) + '...')

    // First, get the current user's information to extract user_id
    const userResponse = await fetch(`${API_BASE_URL}/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Failed to verify user' },
        { status: 401 }
      )
    }

    const userData = await userResponse.json()
    const userId = userData.id || userData.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User ID not found' },
        { status: 401 }
      )
    }

    console.log('Fetching applications for user_id:', userId)

    // Fetch all application types from Laravel API
    const endpoints = [
      { path: '/barangay-clearance', name: 'Barangay Clearance' },
      { path: '/business-permit', name: 'Business Permit', fallbacks: ['/business-permits'] },
      { path: '/building-permit', name: 'Building Permit' },
      { path: '/cedula', name: 'Cedula' },
      { path: '/medical-assistance', name: 'Medical Assistance' },
      { path: '/health-certificate', name: 'Health Certificate' }
    ]

    const applicationPromises = endpoints.map(async (endpoint) => {
      // Try primary path first, then fallback paths
      const pathsToTry = [endpoint.path, ...(endpoint.fallbacks || [])]
      
      for (const path of pathsToTry) {
        try {
          const url = `${API_BASE_URL}${path}`
          console.log(`Attempting to fetch from: ${url}`)
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            cache: 'no-store',
          })

          console.log(`${endpoint.name} (${path}) response status:`, response.status)

          if (!response.ok) {
            console.error(`Failed to fetch ${path}:`, {
              status: response.status,
              statusText: response.statusText
            })
            
            if (response.status === 404 && pathsToTry.indexOf(path) < pathsToTry.length - 1) {
              console.log(`${endpoint.name} not found at ${path}, trying next path...`)
              continue
            }
            
            return []
          }

          const data = await response.json()
          console.log(`${endpoint.name} raw data:`, JSON.stringify(data).substring(0, 200))
          
          // Handle different response formats from Laravel
          let applications = []
          
          if (Array.isArray(data)) {
            applications = data
          } else if (data.data) {
            if (Array.isArray(data.data)) {
              applications = data.data
            } else if (data.data.data && Array.isArray(data.data.data)) {
              // Handle paginated response
              applications = data.data.data
            }
          } else if (data.applications && Array.isArray(data.applications)) {
            applications = data.applications
          }

          // Filter applications by user_id on the frontend
          console.log(`${endpoint.name} received ${applications.length} applications (before filtering)`)

          const userApplications = applications.filter((app: any) => {
            const appUserId = app.user_id || app.userId || app.applicant_id
            const matches = appUserId === userId
            if (!matches) {
              console.log(`Filtering out application ${app.id}: user_id ${appUserId} !== ${userId}`)
            }
            return matches
          })

          console.log(`${endpoint.name} filtered to ${userApplications.length} applications for user ${userId}`)

          // Add type field using the endpoint name
          const processedApps = userApplications.map((app: any) => ({
            ...app,
            type: app.type || endpoint.name,
            id: app.id,
            reference_number: app.reference_number || app.referenceNumber || 'N/A',
            status: app.status || 'pending',
            created_at: app.created_at || app.createdAt || new Date().toISOString(),
          }))
          
          return processedApps
          
        } catch (error) {
          console.error(`Error fetching ${path}:`, error)
          
          if (pathsToTry.indexOf(path) < pathsToTry.length - 1) {
            console.log(`Error with ${path}, trying next path...`)
            continue
          }
          
          return []
        }
      }
      
      return []
    })

    // Wait for all requests to complete
    const results = await Promise.all(applicationPromises)
    
    // Flatten the results into a single array
    const allApplications = results.flat()
    
    console.log(`Total applications fetched for user ${userId}: ${allApplications.length}`)
    console.log('Application types:', allApplications.map(app => app.type))

    return NextResponse.json({
      success: true,
      data: allApplications,
      count: allApplications.length,
      user_id: userId,
      breakdown: {
        'Barangay Clearance': results[0]?.length || 0,
        'Business Permit': results[1]?.length || 0,
        'Building Permit': results[2]?.length || 0,
        'Cedula': results[3]?.length || 0,
        'Medical Assistance': results[4]?.length || 0,
        'Health Certificate': results[5]?.length || 0,
      }
    })
  } catch (error) {
    console.error('Error in applications API route:', error)
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: error instanceof Error ? error.message : 'Failed to fetch applications'
      },
      { status: 500 }
    )
  }
}