import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  try {
    // Retrieve the session using getServerSession
    const session = await getServerSession(authOptions);

    // Return the session data
    return NextResponse.json({
      authenticated: !!session, // Convert session to a boolean
      session, // Include the full session object
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error retrieving session:", error);

    // Return an error response
    return NextResponse.json(
      {
        authenticated: false,
        session: null,
        error: "Failed to retrieve session",
      },
      { status: 500 }
    );
  }
};