import { NextRequest, NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";

export async function GET(request: NextRequest) {
	try {
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
