import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function convertKeysToSnakeCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToSnakeCase(item))
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = camelToSnake(key)
      acc[snakeKey] = convertKeysToSnakeCase((obj as Record<string, unknown>)[key])
      return acc
    }, {} as Record<string, unknown>)
  }
  return obj
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    const url = id ? `${API_URL}/api/police-clearance/${id}` : `${API_URL}/api/police-clearance`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const contentType = response.headers.get("content-type")
    let data

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.error("[v0] Non-JSON response from backend:", text)
      data = {
        success: false,
        message: "Server returned an invalid response. Please check your backend API.",
        error: text.substring(0, 200),
      }
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error fetching police clearances:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const snakeCaseBody = convertKeysToSnakeCase(body)

    const response = await fetch(`${API_URL}/api/police-clearance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(snakeCaseBody),
    })

    const contentType = response.headers.get("content-type")
    let data

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.error("[v0] Non-JSON response from backend:", text)
      data = {
        success: false,
        message: "Server returned an invalid response. Please check your backend API.",
        error: text.substring(0, 200),
      }
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error creating police clearance:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const snakeCaseBody = convertKeysToSnakeCase(body)

    const response = await fetch(`${API_URL}/api/police-clearance/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(snakeCaseBody),
    })

    const contentType = response.headers.get("content-type")
    let data

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.error("[v0] Non-JSON response from backend:", text)
      data = {
        success: false,
        message: "Server returned an invalid response. Please check your backend API.",
        error: text.substring(0, 200),
      }
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error updating police clearance:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 })
    }

    const response = await fetch(`${API_URL}/api/police-clearance/${id}`, {
      method: "DELETE",
    })

    const contentType = response.headers.get("content-type")
    let data

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.error("[v0] Non-JSON response from backend:", text)
      data = {
        success: false,
        message: "Server returned an invalid response. Please check your backend API.",
        error: text.substring(0, 200),
      }
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error deleting police clearance:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}