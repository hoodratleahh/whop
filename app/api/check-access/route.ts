import { NextRequest, NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";

// Simple rate limiter (per IP, 10 requests per minute)
const rateLimitStore = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const oneMinuteAgo = now - 60000;
	const timestamps = rateLimitStore.get(ip) || [];

	// Remove old timestamps
	const recentTimestamps = timestamps.filter((t) => t > oneMinuteAgo);

	if (recentTimestamps.length >= 10) {
		return true;
	}

	recentTimestamps.push(now);
	rateLimitStore.set(ip, recentTimestamps);
	return false;
}

export async function GET(request: NextRequest) {
	try {
		// Rate limiting
		const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
		if (isRateLimited(ip)) {
			return NextResponse.json({ userId: null, hasAccess: false }, { status: 429 });
		}

		const { userId } = await whopsdk.verifyUserToken(request.headers);

		// Check if user has access to Recon AI product
		const productId = "prod_wnUBQEF08WxYE";
		const access = await whopsdk.users.checkAccess(productId, { id: userId });

		return NextResponse.json({
			userId,
			hasAccess: access.has_access,
		});
	} catch (error) {
		return NextResponse.json({
			userId: null,
			hasAccess: false,
		});
	}
}
