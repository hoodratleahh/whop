import { waitUntil } from "@vercel/functions";
import type { NextRequest } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { Resend } from "resend";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { grantAccess, revokeAccess } from "@/lib/access-store";
import { getOrCreateLicense, revokeLicense } from "@/lib/license-store";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: NextRequest): Promise<Response> {
	try {
		// Rate limiting on webhook endpoint
		const ip = getClientIp(request);
		if (isRateLimited(ip, 30)) {
			return new Response("Too Many Requests", { status: 429 });
		}

		// Validate the webhook to ensure it's from Whop
		const requestBodyText = await request.text();
		const headers = Object.fromEntries(request.headers);
		const webhookData = whopsdk.webhooks.unwrap(requestBodyText, { headers });

		// Handle different webhook event types (per Whop docs)
		if (webhookData.type === "membership.activated") {
			// User gained access to product (per Whop spec)
			waitUntil(handleMembershipValid(webhookData.data));
		} else if (webhookData.type === "membership.deactivated") {
			// User lost access (subscription ended/canceled)
			waitUntil(handleMembershipInvalid(webhookData.data));
		} else if (webhookData.type === "payment.failed") {
			// Payment failed (per Whop spec)
			waitUntil(handlePaymentFailed(webhookData.data));
		}

		// Make sure to return a 2xx status code quickly. Otherwise the webhook will be retried.
		return new Response("OK", { status: 200 });
	} catch (error) {
		console.error("[webhook] Signature verification failed:", error instanceof Error ? error.message : String(error));
		return new Response("Bad Request", { status: 400 });
	}
}


async function handleMembershipValid(membership: any) {
	// Log full payload to see structure
	console.log("[WEBHOOK] Full membership payload:", JSON.stringify(membership, null, 2));

	// Try different field names for user_id
	const userId = membership.user_id || membership.userId || membership.user?.id || membership.access_pass?.user_id;
	const productId = membership.product_id || membership.productId || membership.product?.id || "prod_wnUBQEF08WxYE";
	const email = membership.user?.email || membership.email || membership.user?.account?.email;

	if (!userId) {
		console.error("[WEBHOOK] No user_id found. Membership data:", JSON.stringify(membership));
		return;
	}

	// Grant access to the user (store in Supabase)
	await grantAccess(userId, productId);

	// Get or create a license key (reuses existing if already present)
	const licenseKey = await getOrCreateLicense(userId, productId, email);

	// Send license key email if we have an email and Resend is configured
	if (email && licenseKey && resend) {
		try {
			await sendLicenseKeyEmail(email, licenseKey);
		} catch (error) {
			console.error("[WEBHOOK] Failed to send license key email:", error);
		}
	}

	console.log("[WEBHOOK] Membership activated:", {
		userId: userId.slice(0, 8),
		productId,
		email: email || "unknown",
		licenseKey: licenseKey || "failed",
		status: "ACTIVE",
		timestamp: new Date().toISOString(),
	});
}

async function handleMembershipInvalid(membership: any) {
	// Try different field names for user_id
	const userId = membership.user_id || membership.userId || membership.user?.id || membership.access_pass?.user_id;
	const productId = membership.product_id || membership.productId || membership.product?.id || "prod_wnUBQEF08WxYE";

	if (!userId) {
		console.error("[WEBHOOK] No user_id found in deactivation event. Data:", JSON.stringify(membership));
		return;
	}

	// Revoke access from the user
	await revokeAccess(userId, productId);

	// Also revoke all licenses for this user/product
	const { getLicenseByUserId, revokeLicense } = await import("@/lib/license-store");
	const licenseKey = await getLicenseByUserId(userId, productId);
	if (licenseKey) {
		await revokeLicense(licenseKey);
	}

	console.log("[WEBHOOK] Membership deactivated:", {
		userId: userId.slice(0, 8),
		productId,
		licenseRevoked: !!licenseKey,
		status: "INACTIVE",
		reason: membership.reason || "unknown",
		timestamp: new Date().toISOString(),
	});
}

async function handlePaymentFailed(payment: any) {
	// Triggered when payment fails
	console.log("[WEBHOOK] Payment failed:", {
		paymentId: payment.id,
		reason: payment.failure_reason || "unknown",
		timestamp: new Date().toISOString(),
	});
	// TODO: Alert user to retry, etc.
}

async function sendLicenseKeyEmail(email: string, licenseKey: string) {
	if (!resend) {
		console.log("[WEBHOOK] Resend not configured, skipping license email");
		return;
	}

	console.log(`[WEBHOOK] Sending license key email to ${email}`);
	const accessUrl = `https://testol.wtf/experiences/recon-ai?license_key=${encodeURIComponent(licenseKey)}`;

	const result = await resend.emails.send({
		from: "noreply@testol.wtf",
		to: email,
		subject: "Your Recon AI License Key",
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 500px;">
				<h2>Welcome to Recon AI! 🎉</h2>
				<p>Thank you for your purchase! Your license key is ready to use.</p>
				<div style="background: #f0a020; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
					<p style="margin: 0 0 10px 0; font-size: 12px; color: #0b0b0f; font-weight: bold; text-transform: uppercase;">Your License Key</p>
					<p style="margin: 0; font-size: 18px; font-family: 'Courier New', monospace; color: #0b0b0f; font-weight: bold; word-break: break-all;">
						${licenseKey}
					</p>
				</div>
				<p style="margin: 20px 0;">You can use this key to access Recon AI:</p>
				<ol style="line-height: 1.8;">
					<li>Visit <a href="${accessUrl}" style="color: #f0a020;">your access link</a></li>
					<li>Or paste your key on any page asking for it</li>
					<li>Keep this email safe in case you need to retrieve it later</li>
				</ol>
				<p style="color: #666; font-size: 12px; margin-top: 30px;">
					If you have any questions, feel free to reach out. Happy researching! 🚀
				</p>
			</div>
		`,
	});

	console.log(`[WEBHOOK] License key email sent to ${email}:`, result);
}
