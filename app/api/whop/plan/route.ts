import { NextRequest, NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
	try {
		// Rate limit this endpoint
		const ip = getClientIp(request);
		if (isRateLimited(ip, 20)) {
			return NextResponse.json(
				{ userId: null },
				{ status: 429 }
			);
		}

		// Verify user is authenticated
		const { userId } = await whopsdk.verifyUserToken(request.headers);

		// Get user's membership/plan information
		const productId = process.env.NEXT_PUBLIC_WHOP_PRODUCT_ID || "prod_wnUBQEF08WxYE";
		const access = await whopsdk.users.checkAccess(productId, { id: userId });

		return NextResponse.json({
			userId,
			productId,
			hasAccess: access.has_access,
			message: access.has_access ? "User has active membership" : "No active membership",
		});
	} catch (error) {
		const ip = getClientIp(request);
		console.error("[whop/plan] Error for IP ${ip}:", error instanceof Error ? error.message : String(error));
		return NextResponse.json(
			{
				userId: null,
				hasAccess: false,
			},
			{ status: 401 }
		);
	}
}
