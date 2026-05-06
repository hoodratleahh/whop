"use client";

import { WhopApp } from "@whop/react/components";

export function LayoutClient({ children }: { children: React.ReactNode }) {
	return <WhopApp>{children}</WhopApp>;
}
