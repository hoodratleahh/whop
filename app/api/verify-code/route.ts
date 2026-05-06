import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
	try {
		const { email, code } = await request.json();

		if (!email || !code) {
			return NextResponse.json(
				{ error: "Email and code are required" },
				{ status: 400 }
			);
		}

		// Verify code
		const { data: verification, error: verifyError } = await supabase
			.from("email_verifications")
			.select("*")
			.eq("email", email)
			.eq("code", code)
			.single();

		if (verifyError || !verification) {
			return NextResponse.json(
				{ error: "Invalid verification code" },
				{ status: 400 }
			);
		}

		// Check if code is expired
		const expiresAt = new Date(verification.expires_at).getTime();
		const now = new Date().getTime();
		if (now > expiresAt) {
			return NextResponse.json(
				{ error: "Verification code has expired" },
				{ status: 400 }
			);
		}

		// Get license key
		const { data: license, error: licenseError } = await supabase
			.from("licenses")
			.select("license_key")
			.eq("email", email)
			.eq("product_id", "prod_wnUBQEF08WxYE")
			.is("revoked_at", null)
			.single();

		if (licenseError || !license) {
			return NextResponse.json(
				{ error: "License not found" },
				{ status: 404 }
			);
		}

		// Delete used verification code
		await supabase
			.from("email_verifications")
			.delete()
			.eq("id", verification.id);

		return NextResponse.json({
			success: true,
			licenseKey: license.license_key,
		});
	} catch (error) {
		console.error("[verify-code] Error:", error);
		return NextResponse.json(
			{ error: "Failed to verify code" },
			{ status: 500 }
		);
	}
}
