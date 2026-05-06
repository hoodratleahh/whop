import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Generate a random 4-digit code
function generateVerificationCode(): string {
	return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json();

		if (!email) {
			return NextResponse.json(
				{ error: "Email is required" },
				{ status: 400 }
			);
		}

		// Check if email exists in licenses table
		const { data: license, error: licenseError } = await supabase
			.from("licenses")
			.select("license_key")
			.eq("email", email)
			.eq("product_id", "prod_wnUBQEF08WxYE")
			.is("revoked_at", null)
			.single();

		if (licenseError || !license) {
			return NextResponse.json(
				{ error: "No active license found for this email" },
				{ status: 404 }
			);
		}

		// Generate verification code
		const code = generateVerificationCode();
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

		// Store verification code
		const { error: insertError } = await supabase
			.from("email_verifications")
			.insert({
				email,
				code,
				expires_at: expiresAt.toISOString(),
			});

		if (insertError) {
			console.error("[verify-email] Failed to store code:", insertError);
			return NextResponse.json(
				{ error: "Failed to process request" },
				{ status: 500 }
			);
		}

		// Send email with code
		if (resend) {
			console.log(`[verify-email] Sending code ${code} to ${email} via Resend`);
			try {
				const result = await resend.emails.send({
					from: "noreply@testol.wtf",
					to: email,
					subject: "Your Recon AI Verification Code",
					html: `
						<div style="font-family: Arial, sans-serif; max-width: 500px;">
							<h2>Verify Your Email</h2>
							<p>Your verification code is:</p>
							<div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
								${code}
							</div>
							<p>This code expires in 15 minutes.</p>
							<p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
						</div>
					`,
				});
				console.log(`[verify-email] Email sent successfully:`, result);
			} catch (emailError) {
				console.error("[verify-email] Failed to send email:", emailError);
				// Don't fail if email sending fails, code is still stored
			}
		} else {
			console.warn("[verify-email] Resend API key not configured");
		}

		return NextResponse.json({
			success: true,
			message: "Verification code sent to your email",
		});
	} catch (error) {
		console.error("[verify-email] Error:", error);
		return NextResponse.json(
			{ error: "Failed to verify email" },
			{ status: 500 }
		);
	}
}
