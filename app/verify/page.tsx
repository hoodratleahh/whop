"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyPage() {
	const searchParams = useSearchParams();
	const email = searchParams.get("email") || "";
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleVerify = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch("/api/verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (data.success && data.token) {
				// Redirect to app with token
				window.location.href = `/app?token=${data.token}`;
			} else {
				setError(data.error || "Verification failed");
			}
		} catch (err) {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className="w-screen h-screen flex items-center justify-center"
			style={{ background: "#0b0b0f" }}
		>
			<div
				className="w-full max-w-md rounded-[10px] border p-8"
				style={{
					background: "#17171e",
					border: "1px solid #25252f",
				}}
			>
				<h1
					className="text-2xl font-extrabold mb-2"
					style={{
						fontFamily: "'Plus Jakarta Sans', sans-serif",
						color: "#edeef2",
					}}
				>
					Verify Your Account
				</h1>
				<p
					style={{
						fontSize: "13px",
						color: "#888898",
						fontFamily: "'Plus Jakarta Sans', sans-serif",
						marginBottom: "24px",
					}}
				>
					Enter your password to access Recon AI
				</p>

				<form onSubmit={handleVerify} className="space-y-4">
					<div>
						<label
							style={{
								display: "block",
								fontSize: "12px",
								fontWeight: 600,
								color: "#edeef2",
								marginBottom: "6px",
								fontFamily: "'Plus Jakarta Sans', sans-serif",
							}}
						>
							Email
						</label>
						<input
							type="email"
							value={email}
							disabled
							style={{
								width: "100%",
								padding: "10px 12px",
								background: "#1e1e27",
								border: "1px solid #25252f",
								borderRadius: "6px",
								color: "#55556a",
								fontFamily: "'Plus Jakarta Sans', sans-serif",
								fontSize: "13px",
							}}
						/>
					</div>

					<div>
						<label
							style={{
								display: "block",
								fontSize: "12px",
								fontWeight: 600,
								color: "#edeef2",
								marginBottom: "6px",
								fontFamily: "'Plus Jakarta Sans', sans-serif",
							}}
						>
							Password
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							style={{
								width: "100%",
								padding: "10px 12px",
								background: "#1e1e27",
								border: "1px solid #25252f",
								borderRadius: "6px",
								color: "#edeef2",
								fontFamily: "'Plus Jakarta Sans', sans-serif",
								fontSize: "13px",
							}}
						/>
					</div>

					{error && (
						<div
							style={{
								padding: "10px 12px",
								background: "rgba(239,68,68,.1)",
								border: "1px solid #ef4444",
								borderRadius: "6px",
								color: "#ef4444",
								fontSize: "12px",
								fontFamily: "'Plus Jakarta Sans', sans-serif",
							}}
						>
							{error}
						</div>
					)}

					<button
						type="submit"
						disabled={loading}
						style={{
							width: "100%",
							padding: "10px 12px",
							background: loading ? "#999999" : "#f0a020",
							color: "#0b0b0f",
							border: "none",
							borderRadius: "6px",
							fontFamily: "'Plus Jakarta Sans', sans-serif",
							fontSize: "13px",
							fontWeight: 600,
							cursor: loading ? "not-allowed" : "pointer",
							transition: "background 0.2s",
						}}
						onMouseEnter={(e) => {
							if (!loading) e.currentTarget.style.background = "#fbbf24";
						}}
						onMouseLeave={(e) => {
							if (!loading) e.currentTarget.style.background = "#f0a020";
						}}
					>
						{loading ? "Verifying..." : "Verify & Access Recon AI"}
					</button>
				</form>
			</div>
		</div>
	);
}
