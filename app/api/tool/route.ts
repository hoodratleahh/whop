import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { whopsdk } from "@/lib/whop-sdk";

export async function GET(request: NextRequest) {
	try {
		// Verify user is authenticated
		const { userId } = await whopsdk.verifyUserToken(request.headers);

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
