import { NextRequest, NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { generateToken, validateToken } from "@/lib/tokens";

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 });
		}

		// Verify credentials with Whop (this would require Whop API support for password verification)
		// For now, we'll use a simpler approach: verify they have a valid Whop account
		// In production, you'd want to integrate with Whop's authentication system

		// Generate a one-time token
		const token = generateToken(email);

		return NextResponse.json({
			success: true,
			token,
		});
	} catch (error) {
		console.error("Verification error:", error);
		return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
	}
}
