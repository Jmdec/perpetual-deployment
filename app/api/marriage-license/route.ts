import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    const url = id
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/marriage-license/${id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/marriage-license`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to fetch data" },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Marriage License API Error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Convert camelCase to snake_case for Laravel
    const payload = {
      groom_name: body.groomName,
      groom_birth_date: body.groomBirthDate,
      groom_birth_place: body.groomBirthPlace,
      groom_citizenship: body.groomCitizenship,
      groom_civil_status: body.groomCivilStatus,
      groom_address: body.groomAddress,
      groom_phone: body.groomPhone,
      groom_email: body.groomEmail,
      bride_name: body.brideName,
      bride_birth_date: body.brideBirthDate,
      bride_birth_place: body.brideBirthPlace,
      bride_citizenship: body.brideCitizenship,
      bride_civil_status: body.brideCivilStatus,
      bride_address: body.brideAddress,
      bride_phone: body.bridePhone,
      bride_email: body.brideEmail,
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marriage-license`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to submit application" },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Marriage License API Error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...formData } = body

    const payload = {
      groom_name: formData.groomName,
      groom_birth_date: formData.groomBirthDate,
      groom_birth_place: formData.groomBirthPlace,
      groom_citizenship: formData.groomCitizenship,
      groom_civil_status: formData.groomCivilStatus,
      groom_address: formData.groomAddress,
      groom_phone: formData.groomPhone,
      groom_email: formData.groomEmail,
      bride_name: formData.brideName,
      bride_birth_date: formData.brideBirthDate,
      bride_birth_place: formData.brideBirthPlace,
      bride_citizenship: formData.brideCitizenship,
      bride_civil_status: formData.brideCivilStatus,
      bride_address: formData.brideAddress,
      bride_phone: formData.bridePhone,
      bride_email: formData.brideEmail,
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marriage-license/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to update application" },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Marriage License API Error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marriage-license/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to delete application" },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Marriage License API Error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
