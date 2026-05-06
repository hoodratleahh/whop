import { waitUntil } from "@vercel/functions";
import type { NextRequest } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { grantAccess, revokeAccess } from "@/lib/access-store";
import { getOrCreateLicense, revokeLicense } from "@/lib/license-store";

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
