import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const response = NextResponse.next();

	// Allow framing for internal iframes
	response.headers.set("X-Frame-Options", "ALLOWALL");

	// Prevent MIME sniffing
	response.headers.set("X-Content-Type-Options", "nosniff");

	// Enforce HTTPS (1 year)
	response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

	// XSS protection (legacy browsers)
	response.headers.set("X-XSS-Protection", "1; mode=block");

	// Referrer policy
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	// Content Security Policy
	// Note: 'unsafe-inline' needed for inline Babel/React in lead-tool.html
	response.headers.set(
		"Content-Security-Policy",
		"default-src 'self'; " +
		"script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net https://*.whop.com; " +
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
		"font-src 'self' https://fonts.gstatic.com; " +
		"img-src 'self' data: https:; " +
		"connect-src 'self' https://*.whop.com https://openrouter.ai https://api.groq.com https://api.whop.com; " +
		"frame-ancestors 'self' https://*.whop.com;"
	);

	return response;
}

export const config = {
	matcher: [
		// Apply to all routes except Next.js internals and static files
		"/((?!_next/static|_next/image|favicon.ico).*)",
	],
};
