import { waitUntil } from "@vercel/functions";
import type { Payment } from "@whop/sdk/resources.js";
import type { NextRequest } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

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
		if (webhookData.type === "payment.succeeded") {
			waitUntil(handlePaymentSucceeded(webhookData.data));
		} else if (webhookData.type === "membership.went_valid") {
			// User gained access to product (per Whop spec)
			waitUntil(handleMembershipValid(webhookData.data));
		} else if (webhookData.type === "membership.went_invalid") {
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

async function handlePaymentSucceeded(payment: Payment) {
	console.log("[WEBHOOK] Payment succeeded:", {
		paymentId: payment.id,
		amount: payment.amount,
		status: payment.status,
		timestamp: new Date().toISOString(),
	});
}

async function handleMembershipValid(membership: any) {
	// Triggered when user gains access to product
	console.log("[WEBHOOK] Membership activated:", {
		userId: membership.user_id,
		productId: membership.product_id,
		status: "ACTIVE",
		timestamp: new Date().toISOString(),
	});
	// TODO: Send welcome email, update database, etc.
}

async function handleMembershipInvalid(membership: any) {
	// Triggered when subscription ends/canceled
	console.log("[WEBHOOK] Membership revoked:", {
		userId: membership.user_id,
		productId: membership.product_id,
		status: "INACTIVE",
		reason: membership.reason || "unknown",
		timestamp: new Date().toISOString(),
	});
	// TODO: Notify user, revoke access, etc.
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
