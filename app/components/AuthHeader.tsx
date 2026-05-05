"use client";

import { useEffect, useState } from "react";

interface UserInfo {
	userId: string;
	hasAccess: boolean;
}

export function AuthHeader() {
	const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch("/api/check-access");
				const data = await response.json();
				setUserInfo(data);
			} catch (error) {
				console.error("Auth check failed:", error);
			} finally {
				setLoading(false);
			}
		};
		checkAuth();
	}, []);

	if (loading || !userInfo?.hasAccess) return null;

	return (
		<div
			style={{
				background: "linear-gradient(90deg, rgba(240, 160, 32, 0.1) 0%, rgba(240, 160, 32, 0.05) 100%)",
				borderBottom: "1px solid rgba(240, 160, 32, 0.2)",
				padding: "12px 20px",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
				<div
					style={{
						width: "8px",
						height: "8px",
						borderRadius: "50%",
						background: "#f0a020",
						animation: "pulse 2s infinite",
					}}
				/>
				<span
					style={{
						color: "#f0a020",
						fontSize: "13px",
						fontWeight: 600,
						fontFamily: "'Plus Jakarta Sans', sans-serif",
					}}
				>
					✓ Authenticated • Premium Access Active
				</span>
			</div>
			<span
				style={{
					fontSize: "12px",
					color: "#888898",
					fontFamily: "'Plus Jakarta Sans', sans-serif",
				}}
			>
				ID: {userInfo.userId.slice(0, 8)}...
			</span>

			<style>{`
				@keyframes pulse {
					0%, 100% { opacity: 1; }
					50% { opacity: 0.5; }
				}
			`}</style>
		</div>
	);
}
