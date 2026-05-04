// In-memory token store (use database in production)
const tokenStore = new Map<string, { email: string; usedAt: Date | null }>();

export function generateToken(email: string): string {
	const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	tokenStore.set(token, { email, usedAt: null });
	return token;
}

export function validateToken(token: string): { email: string; valid: boolean } {
	const record = tokenStore.get(token);
	if (!record) return { email: "", valid: false };
	if (record.usedAt) return { email: record.email, valid: false }; // Already used
	return { email: record.email, valid: true };
}

export function useToken(token: string): boolean {
	const record = tokenStore.get(token);
	if (!record || record.usedAt) return false;
	record.usedAt = new Date();
	return true;
}
