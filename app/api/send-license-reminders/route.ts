import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const adminSecret = process.env.ADMIN_SECRET;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: NextRequest) {
	try {
		// Verify admin secret
		const secret = request.headers.get("x-admin-secret");
		if (!secret || secret !== adminSecret) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!resend) {
			return NextResponse.json(
				{ error: "Resend not configured" },
				{ status: 500 }
			);
		}

		// Get all active, non-revoked licenses
		const { data: licenses, error: licenseError } = await supabase
			.from("licenses")
			.select("license_key, email, user_id")
			.eq("product_id", "prod_wnUBQEF08WxYE")
			.is("revoked_at", null);

		if (licenseError || !licenses) {
			return NextResponse.json(
				{ error: "Failed to fetch licenses" },
				{ status: 500 }
			);
		}

		let sent = 0;
		let failed = 0;

		// Send email to each member
		for (const license of licenses) {
			if (!license.email) continue;

			try {
				const accessUrl = `https://testol.wtf/experiences/recon-ai?license_key=${encodeURIComponent(
					license.license_key
				)}`;

				await resend.emails.send({
					from: "noreply@testol.wtf",
					to: license.email,
					subject: "Your Recon AI License Key Reminder",
					html: `
						<div style="font-family: Arial, sans-serif; max-width: 500px;">
							<h2>Your Recon AI License Key 🔑</h2>
							<p>Here's a reminder of your active license key:</p>
							<div style="background: #f0a020; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
								<p style="margin: 0 0 10px 0; font-size: 12px; color: #0b0b0f; font-weight: bold; text-transform: uppercase;">Your License Key</p>
								<p style="margin: 0; font-size: 18px; font-family: 'Courier New', monospace; color: #0b0b0f; font-weight: bold; word-break: break-all;">
									${license.license_key}
								</p>
							</div>
							<p style="margin: 20px 0;">Quick access:</p>
							<ol style="line-height: 1.8;">
								<li>Click <a href="${accessUrl}" style="color: #f0a020;">here to launch Recon AI</a></li>
								<li>Or paste your key on any page asking for it</li>
								<li>Save this email for future reference</li>
							</ol>
							<p style="color: #666; font-size: 12px; margin-top: 30px;">
								Your membership is active and you have full access to all features. Let's find those qualified leads! 🚀
							</p>
						</div>
					`,
				});
				sent++;
			} catch (error) {
				console.error(
					`[send-reminders] Failed to send to ${license.email}:`,
					error
				);
				failed++;
			}
		}

		console.log(
			`[send-reminders] Completed: ${sent} sent, ${failed} failed out of ${licenses.length} licenses`
		);

		return NextResponse.json({
			success: true,
			message: `License reminders sent to ${sent} members (${failed} failed)`,
			total: licenses.length,
			sent,
			failed,
		});
	} catch (error) {
		console.error("[send-reminders] Error:", error);
		return NextResponse.json(
			{ error: "Failed to send reminders" },
			{ status: 500 }
		);
	}
}
