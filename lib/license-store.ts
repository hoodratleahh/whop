import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate a random license key (16 characters)
function generateLicenseKey(): string {
	return randomBytes(8).toString("hex").toUpperCase();
}

export async function createLicense(
	userId: string,
	productId: string,
	email?: string
) {
	const licenseKey = generateLicenseKey();

	try {
		const { data, error } = await supabase
			.from("licenses")
			.insert({
				license_key: licenseKey,
				user_id: userId,
				email: email || null,
				product_id: productId,
			})
			.select("license_key")
			.single();

		if (error) {
			console.error("[license-store] Failed to create license:", error);
			return null;
		}

		console.log(
			`[license-store] License created: ${licenseKey} for ${userId.slice(0, 8)}`
		);
		return licenseKey;
	} catch (error) {
		console.error("[license-store] Error creating license:", error);
		return null;
	}
}

export async function verifyLicense(
	licenseKey: string,
	productId: string
): Promise<{
	valid: boolean;
	userId?: string;
	email?: string;
}> {
	try {
		const { data, error } = await supabase
			.from("licenses")
			.select("user_id, email, revoked_at")
			.eq("license_key", licenseKey)
			.eq("product_id", productId)
			.single();

		if (error || !data) {
			return { valid: false };
		}

		// Check if license is revoked
		if (data.revoked_at) {
			return { valid: false };
		}

		return {
			valid: true,
			userId: data.user_id,
			email: data.email,
		};
	} catch (error) {
		console.error("[license-store] Error verifying license:", error);
		return { valid: false };
	}
}

export async function revokeLicense(licenseKey: string) {
	try {
		await supabase
			.from("licenses")
			.update({ revoked_at: new Date().toISOString() })
			.eq("license_key", licenseKey);

		console.log(`[license-store] License revoked: ${licenseKey}`);
	} catch (error) {
		console.error("[license-store] Error revoking license:", error);
	}
}

export async function getLicenseByUserId(
	userId: string,
	productId: string
): Promise<string | null> {
	try {
		const { data, error } = await supabase
			.from("licenses")
			.select("license_key")
			.eq("user_id", userId)
			.eq("product_id", productId)
			.is("revoked_at", null)
			.single();

		if (error || !data) {
			return null;
		}

		return data.license_key;
	} catch (error) {
		console.error("[license-store] Error getting license:", error);
		return null;
	}
}

export async function getOrCreateLicense(
	userId: string,
	productId: string,
	email?: string
): Promise<string | null> {
	try {
		// Check if a license already exists (revoked or not)
		const { data: existing, error: fetchError } = await supabase
			.from("licenses")
			.select("license_key, revoked_at")
			.eq("user_id", userId)
			.eq("product_id", productId)
			.single();

		if (!fetchError && existing) {
			// License exists
			if (existing.revoked_at) {
				// Un-revoke it
				const { error: updateError } = await supabase
					.from("licenses")
					.update({ revoked_at: null })
					.eq("user_id", userId)
					.eq("product_id", productId);

				if (updateError) {
					console.error("[license-store] Failed to un-revoke license:", updateError);
					return null;
				}

				console.log(`[license-store] License un-revoked and reactivated: ${existing.license_key}`);
			} else {
				console.log(`[license-store] License already exists and is active: ${existing.license_key}`);
			}
			return existing.license_key;
		}

		// No license exists, create a new one
		return await createLicense(userId, productId, email);
	} catch (error) {
		console.error("[license-store] Error in getOrCreateLicense:", error);
		return null;
	}
}
