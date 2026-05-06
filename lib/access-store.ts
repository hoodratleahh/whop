import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Table: access_grants (user_id, product_id, granted_at)
export async function grantAccess(userId: string, productId = "prod_wnUBQEF08WxYE") {
	try {
		await supabase.from("access_grants").upsert(
			{
				user_id: userId,
				product_id: productId,
				granted_at: new Date().toISOString(),
			},
			{ onConflict: "user_id,product_id" }
		);
		console.log(`[access-store] Access granted to ${userId.slice(0, 8)} for ${productId}`);
	} catch (error) {
		console.error("[access-store] Failed to grant access:", error);
	}
}

export async function hasAccess(userId: string, productId = "prod_wnUBQEF08WxYE"): Promise<boolean> {
	try {
		const { data, error } = await supabase
			.from("access_grants")
			.select("*")
			.eq("user_id", userId)
			.eq("product_id", productId)
			.single();

		if (error && error.code !== "PGRST116") {
			// PGRST116 means no rows found, which is expected
			console.error("[access-store] Error checking access:", error);
			return false;
		}

		return !!data;
	} catch (error) {
		console.error("[access-store] Error checking access:", error);
		return false;
	}
}

export async function revokeAccess(userId: string, productId = "prod_wnUBQEF08WxYE") {
	try {
		await supabase
			.from("access_grants")
			.delete()
			.eq("user_id", userId)
			.eq("product_id", productId);
		console.log(`[access-store] Access revoked for ${userId.slice(0, 8)}`);
	} catch (error) {
		console.error("[access-store] Failed to revoke access:", error);
	}
}
