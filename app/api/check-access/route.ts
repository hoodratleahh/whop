import { NextRequest, NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { verifyLicense } from "@/lib/license-store";

export async function GET(request: NextRequest) {
	try {
		// Rate limiting
		const ip = getClientIp(request);
		if (isRateLimited(ip)) {
			return NextResponse.json({ userId: null, hasAccess: false }, { status: 429 });
		}

		const productId = process.env.NEXT_PUBLIC_WHOP_PRODUCT_ID || "prod_wnUBQEF08WxYE";
		let userId: string | null = null;

		// First, try license key verification
		const licenseKey = request.nextUrl.searchParams.get("license_key") ||
			request.headers.get("x-license-key");

		if (licenseKey) {
			const licenseResult = await verifyLicense(licenseKey, productId);
			if (licenseResult.valid && licenseResult.userId) {
				return NextResponse.json({
					userId: licenseResult.userId,
					hasAccess: true,
					source: "license-key",
				});
			}
		}

		// Try to verify user token from headers (Whop auth)
		try {
			const verified = await whopsdk.verifyUserToken(request.headers);
			userId = verified.userId;
		} catch (tokenError) {
			// Token verification failed, try to get from authorization header or cookies
			const authHeader = request.headers.get("authorization");
			if (authHeader?.startsWith("Bearer ")) {
				userId = authHeader.slice(7); // Extract token after "Bearer "
			}
		}

		if (!userId) {
			console.error("[check-access] No user ID or license key found");
			return NextResponse.json(
				{
					userId: null,
					hasAccess: false,
				},
				{ status: 401 }
			);
		}

		// Check if user has access to Recon AI product
		// 1. First check database (from webhook)
		// 2. Then verify with Whop API as backup
		const { hasAccess } = await import("@/lib/access-store");

		const dbAccess = await hasAccess(userId, productId);

		if (dbAccess) {
			return NextResponse.json({
				userId,
				hasAccess: true,
				accessLevel: "customer",
				source: "database",
			});
		}

		// Fallback: Check with Whop API
		try {
			const access = await whopsdk.users.checkAccess(productId, { id: userId });
			if (access.has_access) {
				return NextResponse.json({
					userId,
					hasAccess: true,
					accessLevel: access.access_level,
					source: "whop-api",
				});
			}
		} catch (err) {
			console.error("[check-access] Whop API check failed:", err);
		}

		return NextResponse.json({
			userId,
			hasAccess: false,
			source: "not-found",
		});
	} catch (error) {
		const ip = getClientIp(request);
		console.error(`[check-access] Auth failed for IP ${ip}:`, error instanceof Error ? error.message : String(error));
		return NextResponse.json(
			{
				userId: null,
				hasAccess: false,
			},
			{ status: 401 }
		);
	}
}
