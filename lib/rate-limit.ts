import type { NextRequest } from "next/server";

const rateLimitStore = new Map<string, number[]>();

export function getClientIp(request: NextRequest): string {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		const ips = forwarded.split(",").map((ip) => ip.trim());
		return ips[ips.length - 1] || "unknown";
	}
	return request.headers.get("x-real-ip") || "unknown";
}

export function isRateLimited(ip: string, limitPerMinute = 60): boolean {
	const now = Date.now();
	const cutoff = now - 60_000;
	const timestamps = (rateLimitStore.get(ip) || []).filter((t) => t > cutoff);

	if (timestamps.length >= limitPerMinute) {
		return true;
	}

	timestamps.push(now);
	rateLimitStore.set(ip, timestamps);
	return false;
}
