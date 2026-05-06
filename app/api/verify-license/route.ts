import { NextRequest, NextResponse } from "next/server";
import { verifyLicense } from "@/lib/license-store";

export async function GET(request: NextRequest) {
	try {
		const licenseKey = request.nextUrl.searchParams.get("license");
		const productId = request.nextUrl.searchParams.get("product") || "prod_wnUBQEF08WxYE";

		if (!licenseKey) {
			return NextResponse.json(
				{
					valid: false,
					error: "Missing license key",
				},
				{ status: 400 }
			);
		}

		const result = await verifyLicense(licenseKey, productId);

		if (!result.valid) {
			return NextResponse.json(
				{
					valid: false,
					error: "Invalid or revoked license key",
				},
				{ status: 401 }
			);
		}

		return NextResponse.json({
			valid: true,
			userId: result.userId,
			email: result.email,
		});
	} catch (error) {
		console.error("[verify-license] Error:", error);
		return NextResponse.json(
			{
				valid: false,
				error: "Verification failed",
			},
			{ status: 500 }
		);
	}
}
