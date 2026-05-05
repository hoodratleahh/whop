import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
	const code = request.nextUrl.searchParams.get("code");
	const state = request.nextUrl.searchParams.get("state");
	const error = request.nextUrl.searchParams.get("error");

	// Check for errors from Whop
	if (error) {
		console.error("[oauth] Whop returned error:", error);
		return NextResponse.redirect(
			new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
		);
	}

	if (!code || !state) {
		return NextResponse.redirect(new URL("/login?error=missing_params", request.url));
	}

	// Verify CSRF token
	const cookieStore = await cookies();
	const savedState = cookieStore.get("oauth_state")?.value;

	if (!savedState || savedState !== state) {
		console.error("[oauth] CSRF token mismatch");
		return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
	}

	try {
		// Exchange code for token with Whop's token endpoint
		const tokenResponse = await fetch("https://whop.com/oauth/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				client_id: process.env.NEXT_PUBLIC_WHOP_APP_ID,
				client_secret: process.env.WHOP_API_KEY,
				code,
				grant_type: "authorization_code",
				redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || "https://testol.wtf"}/api/auth/callback`,
			}),
		});

		if (!tokenResponse.ok) {
			const error = await tokenResponse.text();
			console.error("[oauth] Token exchange failed:", error);
			return NextResponse.redirect(
				new URL("/login?error=token_exchange_failed", request.url)
			);
		}

		const tokenData = await tokenResponse.json();
		const accessToken = tokenData.access_token;
		const idToken = tokenData.id_token;

		if (!accessToken) {
			console.error("[oauth] No access token in response");
			return NextResponse.redirect(new URL("/login?error=no_token", request.url));
		}

		// Extract user info from the ID token (JWT) or fetch from userinfo endpoint
		let userId: string | null = null;

		try {
			// Try to get user info from Whop's userinfo endpoint
			const userinfoResponse = await fetch("https://whop.com/oauth/userinfo", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (userinfoResponse.ok) {
				const userinfo = await userinfoResponse.json();
				userId = userinfo.sub || userinfo.id;
			}
		} catch (e) {
			console.error("[oauth] Failed to fetch userinfo:", e);
		}

		if (!userId) {
			console.error("[oauth] Could not extract userId");
			return NextResponse.redirect(new URL("/login?error=no_userid", request.url));
		}

		// Create session cookies
		const response = NextResponse.redirect(
			new URL("/experiences/recon-ai", request.url)
		);

		const newCookieStore = await cookies();
		newCookieStore.set("whop_user_id", userId, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			maxAge: 30 * 24 * 60 * 60, // 30 days
		});

		newCookieStore.set("whop_access_token", accessToken, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			maxAge: tokenData.expires_in || 3600,
		});

		// Clear the state token
		newCookieStore.delete("oauth_state");

		console.log("[oauth] Session created for user:", userId.slice(0, 8));
		return response;
	} catch (error) {
		console.error("[oauth] Callback error:", error instanceof Error ? error.message : String(error));
		return NextResponse.redirect(
			new URL(`/login?error=${encodeURIComponent("auth_failed")}`, request.url)
		);
	}
}
