import { NextRequest, NextResponse } from "next/server";
import { revokeLicense } from "@/lib/license-store";

export async function POST(request: NextRequest) {
	try {
		// Check admin key (add this to your environment variables)
		const adminKey = request.headers.get("x-admin-key");
		const expectedKey = process.env.ADMIN_API_KEY;

		if (!adminKey || !expectedKey || adminKey !== expectedKey) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { licenseKey } = await request.json();

		if (!licenseKey) {
			return NextResponse.json(
				{ error: "Missing licenseKey" },
				{ status: 400 }
			);
		}

		// Revoke the license
		await revokeLicense(licenseKey);

		return NextResponse.json({
			success: true,
			message: `License ${licenseKey} has been revoked`,
		});
	} catch (error) {
		console.error("[admin/revoke-license] Error:", error);
		return NextResponse.json(
			{ error: "Failed to revoke license" },
			{ status: 500 }
		);
	}
}
