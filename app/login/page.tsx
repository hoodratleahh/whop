'use client';

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");

	const errorMessages: Record<string, string> = {
		missing_params: "Missing authentication parameters. Please try again.",
		invalid_state: "Security validation failed. Please try again.",
		token_exchange_failed: "Failed to authenticate with Whop. Please try again.",
		no_token: "No authentication token received. Please try again.",
		no_userid: "Could not identify your account. Please try again.",
		auth_failed: "Authentication failed. Please try again.",
		access_denied: "Authentication was cancelled. Please try again.",
	};

	return (
		<div
			className="flex min-h-screen items-center justify-center p-4"
			style={{
				background: "linear-gradient(135deg, #0b0b0f 0%, #1a1a23 100%)",
			}}
		>
			<div
				className="w-full max-w-md rounded-[20px] border p-12 text-center backdrop-blur-xl"
				style={{
					background: "rgba(23, 23, 30, 0.8)",
					border: "1px solid #25252f",
					boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
				}}
			>
				{/* Logo/Title */}
				<h1
					className="text-4xl font-extrabold mb-2 tracking-tight"
					style={{
						fontFamily: "'Plus Jakarta Sans', sans-serif",
						color: "#edeef2",
						letterSpacing: "-0.5px",
					}}
				>
					Recon <span style={{ color: "#f0a020" }}>AI</span>
				</h1>

				{/* Subtitle */}
				<p
					className="text-lg mb-8"
					style={{
						color: "#888898",
						fontFamily: "'Plus Jakarta Sans', sans-serif",
						lineHeight: "1.6",
					}}
				>
					AI-Powered Lead Research & Cold Calling Scripts
				</p>

				{/* Error Message */}
				{error && (
					<div
						style={{
							background: "rgba(239, 68, 68, 0.1)",
							border: "1px solid rgba(239, 68, 68, 0.3)",
							borderRadius: "10px",
							padding: "12px 16px",
							marginBottom: "24px",
							textAlign: "left",
						}}
					>
						<p
							style={{
								color: "#ef4444",
								fontSize: "14px",
								fontFamily: "'Plus Jakarta Sans', sans-serif",
								margin: 0,
							}}
						>
							{errorMessages[error] || "An error occurred. Please try again."}
						</p>
					</div>
				)}

				{/* Sign In Button */}
				<div className="mb-8">
					<a
						href="/api/auth/whop"
						className="inline-block w-full px-8 py-4 rounded-lg font-semibold transition-all"
						style={{
							background: "#f0a020",
							color: "#0b0b0f",
							fontFamily: "'Plus Jakarta Sans', sans-serif",
							fontSize: "15px",
							fontWeight: 600,
							cursor: "pointer",
							textDecoration: "none",
							display: "block",
							textAlign: "center",
						}}
						onMouseEnter={(e) => (e.currentTarget.style.background = "#fbbf24")}
						onMouseLeave={(e) => (e.currentTarget.style.background = "#f0a020")}
					>
						Sign In with Whop
					</a>
				</div>

				{/* Description */}
				<div
					className="p-6 rounded-lg"
					style={{
						background: "rgba(240, 160, 32, 0.05)",
						border: "1px solid rgba(240, 160, 32, 0.2)",
					}}
				>
					<p
						style={{
							fontSize: "14px",
							color: "#aaaabc",
							fontFamily: "'Plus Jakarta Sans', sans-serif",
							lineHeight: "1.8",
							margin: 0,
						}}
					>
						Sign in with your Whop account to access Recon AI. If you don't have an account, you'll be able to create one or purchase access.
					</p>
				</div>

				{/* Links */}
				<div
					style={{
						marginTop: "24px",
						display: "flex",
						gap: "12px",
						justifyContent: "center",
						fontSize: "13px",
					}}
				>
					<a
						href="/"
						style={{
							color: "#888898",
							textDecoration: "none",
							transition: "color 0.2s",
						}}
						onMouseEnter={(e) => (e.currentTarget.style.color = "#edeef2")}
						onMouseLeave={(e) => (e.currentTarget.style.color = "#888898")}
					>
						Back Home
					</a>
					<span style={{ color: "#555566" }}>•</span>
					<a
						href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/"
						target="_blank"
						rel="noopener noreferrer"
						style={{
							color: "#f0a020",
							textDecoration: "none",
							fontWeight: 600,
						}}
					>
						View Product
					</a>
				</div>
			</div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={<div style={{ background: "#0b0b0f", height: "100vh" }} />}>
			<LoginContent />
		</Suspense>
	);
}
