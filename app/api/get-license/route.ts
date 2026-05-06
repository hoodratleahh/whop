import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { whopsdk } from "@/lib/whop-sdk";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
	try {
		const productId = request.nextUrl.searchParams.get("product") || "prod_wnUBQEF08WxYE";
		const email = request.nextUrl.searchParams.get("email");

		let userId: string | null = null;

		// Try Whop auth first
		try {
			const verified = await whopsdk.verifyUserToken(request.headers);
			userId = verified.userId;
		} catch (err) {
			// Whop auth failed, try email-based retrieval for recent licenses
		}

		// If no Whop auth, try email-based retrieval (only for recent licenses)
		if (!userId && email) {
			const { data, error } = await supabase
				.from("licenses")
				.select("license_key, created_at, user_id")
				.eq("email", email)
				.eq("product_id", productId)
				.is("revoked_at", null)
				.order("created_at", { ascending: false })
				.limit(1)
				.single();

			if (error || !data) {
				return NextResponse.json(
					{ error: "No license found for this email" },
					{ status: 404 }
				);
			}

			// Only allow retrieval if license was created in the last 10 minutes
			const createdTime = new Date(data.created_at).getTime();
			const now = new Date().getTime();
			const diffMinutes = (now - createdTime) / (1000 * 60);

			if (diffMinutes > 10) {
				return NextResponse.json(
					{ error: "License retrieval window expired. Please log in with Whop to retrieve your license." },
					{ status: 403 }
				);
			}

			return NextResponse.json({
				success: true,
				licenseKey: data.license_key,
				createdAt: data.created_at,
				email: email,
			});
		}

		// If Whop auth succeeded, retrieve by user_id
		if (userId) {
			const { data, error } = await supabase
				.from("licenses")
				.select("license_key, created_at, email")
				.eq("user_id", userId)
				.eq("product_id", productId)
				.is("revoked_at", null)
				.single();

			if (error || !data) {
				return NextResponse.json(
					{ error: "No active license found. Make sure your membership is active." },
					{ status: 404 }
				);
			}

			return NextResponse.json({
				success: true,
				licenseKey: data.license_key,
				createdAt: data.created_at,
				email: data.email,
			});
		}

		return NextResponse.json(
			{ error: "Email is required or please log in with Whop" },
			{ status: 401 }
		);
	} catch (error) {
		console.error("[get-license] Error:", error instanceof Error ? error.message : String(error));
		return NextResponse.json(
			{ error: "Failed to retrieve license" },
			{ status: 500 }
		);
	}
}
