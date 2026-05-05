// Simple in-memory store for granted access
// When membership.activated webhook fires, we grant access
// Expires after 24 hours

interface AccessGrant {
	userId: string;
	grantedAt: number;
}

const accessStore = new Map<string, AccessGrant>();
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function grantAccess(userId: string) {
	accessStore.set(userId, {
		userId,
		grantedAt: Date.now(),
	});
	console.log(`[access-store] Access granted to ${userId.slice(0, 8)}`);
}

export function hasAccess(userId: string): boolean {
	const grant = accessStore.get(userId);
	if (!grant) return false;

	const age = Date.now() - grant.grantedAt;
	if (age > EXPIRY_MS) {
		accessStore.delete(userId);
		return false;
	}

	return true;
}

export function revokeAccess(userId: string) {
	accessStore.delete(userId);
	console.log(`[access-store] Access revoked for ${userId.slice(0, 8)}`);
}
