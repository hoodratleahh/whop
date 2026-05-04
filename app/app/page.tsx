"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AppContent() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const [isValid, setIsValid] = useState<boolean | null>(null);
	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		const validateAndAuthenticate = async () => {
			if (!token) {
				setIsValid(false);
				return;
			}

			try {
				const response = await fetch("/api/validate-token", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token }),
				});

				const data = await response.json();

				if (data.valid && data.userId) {
					setUserId(data.userId);
					setIsValid(true);
				} else {
					setIsValid(false);
				}
			} catch (error) {
				console.error("Token validation error:", error);
				setIsValid(false);
			}
		};

		validateAndAuthenticate();
	}, [token]);

	if (isValid === null) {
		return (
			<div
				className="w-screen h-screen flex items-center justify-center"
				style={{ background: "#0b0b0f" }}
			>
				<div style={{ color: "#edeef2", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
					Authenticating...
				</div>
			</div>
		);
	}

	if (!isValid || !userId) {
		return (
			<div
				className="w-screen h-screen flex items-center justify-center"
				style={{ background: "#0b0b0f" }}
			>
				<div
					className="w-full max-w-md rounded-[10px] border p-8 text-center"
					style={{
						background: "#17171e",
						border: "1px solid #25252f",
					}}
				>
					<h1
						style={{
							fontSize: "18px",
							fontWeight: 700,
							color: "#edeef2",
							marginBottom: "12px",
							fontFamily: "'Plus Jakarta Sans', sans-serif",
						}}
					>
						Invalid or Expired Token
					</h1>
					<p
						style={{
							fontSize: "13px",
							color: "#888898",
							fontFamily: "'Plus Jakarta Sans', sans-serif",
							marginBottom: "20px",
						}}
					>
						Please go back and try again.
					</p>
					<a
						href="/"
						style={{
							display: "inline-block",
							padding: "10px 20px",
							background: "#f0a020",
							color: "#0b0b0f",
							borderRadius: "6px",
							textDecoration: "none",
							fontFamily: "'Plus Jakarta Sans', sans-serif",
							fontSize: "13px",
							fontWeight: 600,
						}}
					>
						Back Home
					</a>
				</div>
			</div>
		);
	}

	// Show the authenticated app
	return (
		<div className="w-screen h-screen overflow-hidden">
			<iframe
				title="Recon Lead Tool"
				src={`/lead-tool.html?uid=${userId}`}
				className="w-full h-full border-0"
				allow="clipboard-read; clipboard-write"
			/>
		</div>
	);
}

export default function AppPage() {
	return (
		<Suspense
			fallback={
				<div
					className="w-screen h-screen flex items-center justify-center"
					style={{ background: "#0b0b0f" }}
				>
					<div style={{ color: "#edeef2", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
						Loading...
					</div>
				</div>
			}
		>
			<AppContent />
		</Suspense>
	);
}
