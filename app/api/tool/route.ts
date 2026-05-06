import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { whopsdk } from "@/lib/whop-sdk";

export async function GET(request: NextRequest) {
	try {
		// Try to get userId from query params (license-based access)
		const uid = request.nextUrl.searchParams.get("uid");
		let userId = uid;

		// If no uid in query, try Whop auth (legacy Whop-based access)
		if (!userId) {
			try {
				const { userId: whopUserId } = await whopsdk.verifyUserToken(request.headers);
				userId = whopUserId;
			} catch (whopError) {
				console.error("[tool] No Whop auth or uid provided");
				throw whopError;
			}
		}

		if (!userId) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		// Read and return lead-tool.html (async to not block event loop)
		const filePath = join(process.cwd(), "app/api/tool/lead-tool.html");
		const fileContent = await readFile(filePath, "utf-8");

		return new NextResponse(fileContent, {
			headers: {
				"Content-Type": "text/html; charset=utf-8",
				"Cache-Control": "private, no-store",
			},
		});
	} catch (error) {
		console.error("[tool] Access denied:", error instanceof Error ? error.message : String(error));
		return new NextResponse("Unauthorized", { status: 401 });
	}
}
