import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
    request: NextRequest,
    context: { params: { id: string } | Promise<{ id: string }> }
) {
    const params = await context.params;
    const id = params.id;

    try {
        const authToken = await request.cookies.get("auth_token")?.value;
        if (!authToken) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        // Forward FormData or JSON body
        let body: any;
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("multipart/form-data")) {
            body = await request.formData();
        } else {
            body = await request.json();
        }

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/business-partners/${id}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body:
                    body instanceof FormData
                        ? body
                        : JSON.stringify(body),
            }
        );

        const respContentType = response.headers.get("content-type");
        let data: any;

        if (respContentType?.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error("Non-JSON response from backend:", text);
            return NextResponse.json(
                { success: false, message: "Invalid response from server" },
                { status: 500 }
            );
        }

        // Handle validation errors (422)
        if (response.status === 422 && data.errors) {
            console.warn("Validation errors:", data.errors);
            return NextResponse.json(
                {
                    success: false,
                    message: data.message || "Validation failed",
                    errors: data.errors,
                },
                { status: 422 }
            );
        }

        // Other non-OK responses
        if (!response.ok) {
            console.error("Backend error:", data);
            return NextResponse.json(
                {
                    success: false,
                    message: data.message || "Failed to update business",
                    errors: data.errors,
                },
                { status: response.status }
            );
        }

        // Success
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error updating business partner:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}


export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const cookieStore = await cookies();
        const authToken = cookieStore.get("auth_token");

        if (!authToken) {
            return NextResponse.json(
                { success: false, message: "Authentication required - no auth token found" },
                { status: 401 }
            );
        }

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/business-partners/${id}`,
            {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${authToken.value}`,
                },
                credentials: "include",
            }
        );

        const contentType = response.headers.get("content-type");
        let data: any;
        if (contentType?.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error("Non-JSON response from Laravel:", text);
            return NextResponse.json(
                { success: false, message: "Invalid response from server" },
                { status: 500 }
            );
        }

        if (!response.ok) {
            console.error("Backend error:", data);
            return NextResponse.json(
                {
                    success: false,
                    message: data.message || "Failed to delete business",
                    errors: data.errors,
                    error: data.error,
                },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Error deleting business:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}