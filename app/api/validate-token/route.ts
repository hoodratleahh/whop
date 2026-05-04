import { NextRequest, NextResponse } from "next/server";
import { validateToken, useToken } from "@/lib/tokens";

export async function POST(request: NextRequest) {
	try {
		const { token } = await request.json();

		if (!token) {
			return NextResponse.json({ valid: false }, { status: 400 });
		}

		// Check if token is valid and unused
		const { email, valid } = validateToken(token);

		if (!valid) {
			return NextResponse.json({ valid: false }, { status: 401 });
		}

		// Mark token as used (expires immediately)
		useToken(token);

		// Return user ID (use email as user ID for now, or extract from Whop)
		return NextResponse.json({
			valid: true,
			userId: email.replace(/[^a-z0-9]/gi, "").substring(0, 20),
		});
	} catch (error) {
		console.error("Token validation error:", error);
		return NextResponse.json({ valid: false }, { status: 500 });
	}
}
