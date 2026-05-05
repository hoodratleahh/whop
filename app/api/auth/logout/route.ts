import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
	const cookieStore = await cookies();
	cookieStore.delete("whop_user_id");
	cookieStore.delete("whop_access_token");

	return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL || "https://testol.wtf"));
}
