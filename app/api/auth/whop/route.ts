import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET() {
	const appID = process.env.NEXT_PUBLIC_WHOP_APP_ID;
	const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "https://testol.wtf"}/api/auth/callback`;

	if (!appID) {
		return new Response("Missing WHOP_APP_ID", { status: 500 });
	}

	// Generate CSRF token for security
	const state = crypto.randomBytes(32).toString("hex");
	const cookieStore = await cookies();
	cookieStore.set("oauth_state", state, {
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		maxAge: 10 * 60, // 10 minutes
	});

	// Whop OAuth endpoint
	const params = new URLSearchParams({
		client_id: appID,
		redirect_uri: redirectUri,
		response_type: "code",
		state,
		scope: "openid profile email",
	});

	redirect(`https://whop.com/oauth/authorize?${params.toString()}`);
}
