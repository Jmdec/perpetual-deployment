import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const response = await fetch(`${API_URL}/api/projects/${id}`)
    if (!response.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Error fetching project:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get the FormData from the request
    const formData = await request.formData()
    
    // Add _method field for Laravel method spoofing
    formData.append('_method', 'PUT')
    
    // Log what we're sending for debugging
    console.log("[API] Updating project with FormData:")
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value)
    }
    
    // Forward the FormData to Laravel backend using POST with _method=PUT
    const response = await fetch(`${API_URL}/api/projects/${id}`, {
      method: "POST", // Use POST with _method spoofing
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("[API] Backend error:", errorText)
      return NextResponse.json(
        { error: "Failed to update project", details: errorText }, 
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[API] Error updating project:", error)
    return NextResponse.json({ 
      error: "Failed to update project",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const response = await fetch(`${API_URL}/api/projects/${id}`, {
      method: "DELETE",
    })
    return NextResponse.json({ success: true }, { status: response.status })
  } catch (error) {
    console.error("[API] Error deleting project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}