import type { NextRequest } from "next/server";

/**
 * Security checks for checkout success endpoint
 * Prevents unauthorized access and fraud attempts
 */

// Track checkout attempts to detect abuse
const checkoutAttempts = new Map<string, { count: number; timestamp: number }>();

export function validateCheckoutRequest(request: NextRequest): { valid: boolean; reason?: string } {
	// Check 1: Must come from Whop redirect (POST or GET immediately after purchase)
	// Whop includes authorization headers in the redirect
	const hasAuthHeader = request.headers.has("authorization") ||
	                     request.headers.has("cookie") ||
	                     request.headers.get("referer")?.includes("whop.com");

	if (!hasAuthHeader && request.method === "GET") {
		// Direct URL visit without Whop context is suspicious but allowed
		// (will fail at token verification stage)
	}

	// Check 2: Rate limit checkout attempts per IP
	// Prevents brute force guessing of user IDs
	const ip = request.headers.get("x-forwarded-for") ||
	           request.headers.get("x-real-ip") ||
	           "unknown";

	const now = Date.now();
	const attempt = checkoutAttempts.get(ip) || { count: 0, timestamp: now };

	if (now - attempt.timestamp < 60_000) {
		// Within 1 minute
		if (attempt.count > 20) {
			return {
				valid: false,
				reason: "Rate limit exceeded (20 attempts per minute per IP)"
			};
		}
		attempt.count++;
	} else {
		// Reset after 1 minute
		attempt.count = 1;
		attempt.timestamp = now;
	}
	checkoutAttempts.set(ip, attempt);

	// Check 3: User agent should be a real browser (not curl/bot)
	const userAgent = request.headers.get("user-agent") || "";
	const isSuspiciousBot = !userAgent ||
	                        userAgent.includes("curl") ||
	                        userAgent.includes("wget") ||
	                        userAgent.includes("python");

	if (isSuspiciousBot) {
		console.warn(`[checkout-security] Suspicious user agent: ${userAgent}`);
		// Don't block, but log for monitoring
	}

	return { valid: true };
}

/**
 * Log authentication events for fraud detection
 */
export function logCheckoutEvent(
	event: "success" | "denied" | "error" | "suspicious",
	userId: string,
	productId: string,
	details: Record<string, any>
) {
	const timestamp = new Date().toISOString();
	const logEntry = {
		timestamp,
		event,
		userId: userId.slice(0, 8) + "...", // Redact most of ID
		productId,
		...details,
	};

	if (event === "success") {
		console.log("[checkout-auth] ✓ Verified purchase:", logEntry);
	} else if (event === "denied") {
		console.warn("[checkout-auth] ✗ Access denied:", logEntry);
	} else if (event === "suspicious") {
		console.error("[checkout-auth] ⚠️  Suspicious activity:", logEntry);
	} else {
		console.error("[checkout-auth] Error:", logEntry);
	}

	// In production, you could send this to:
	// - Sentry for error tracking
	// - Datadog for monitoring
	// - Custom analytics service
}
