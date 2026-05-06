"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function CheckoutSuccessContent() {
	const searchParams = useSearchParams();
	const status = searchParams.get("status");
	const [licenseKey, setLicenseKey] = useState<string | null>(null);
	const [verifyEmail, setVerifyEmail] = useState("");
	const [verifyCode, setVerifyCode] = useState("");
	const [verifyStep, setVerifyStep] = useState<"email" | "code" | null>(null);
	const [verifyLoading, setVerifyLoading] = useState(false);
	const [verifyError, setVerifyError] = useState<string | null>(null);

	const handleSendVerificationCode = async () => {
		if (!verifyEmail) {
			setVerifyError("Please enter your email");
			return;
		}

		setVerifyLoading(true);
		setVerifyError(null);

		try {
			const response = await fetch("/api/verify-email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: verifyEmail }),
			});
			const data = await response.json();

			if (!response.ok) {
				setVerifyError(data.error || "Failed to send code");
				return;
			}

			setVerifyStep("code");
		} catch (err) {
			setVerifyError("Failed to send verification code");
		} finally {
			setVerifyLoading(false);
		}
	};

	const handleVerifyCode = async () => {
		if (!verifyCode) {
			setVerifyError("Please enter the code");
			return;
		}

		setVerifyLoading(true);
		setVerifyError(null);

		try {
			const response = await fetch("/api/verify-code", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: verifyEmail, code: verifyCode }),
			});
			const data = await response.json();

			if (!response.ok) {
				setVerifyError(data.error || "Invalid code");
				return;
			}

			setLicenseKey(data.licenseKey);
			setVerifyStep(null);
			setVerifyEmail("");
			setVerifyCode("");
		} catch (err) {
			setVerifyError("Failed to verify code");
		} finally {
			setVerifyLoading(false);
		}
	};


	if (status === "error") {
		return (
			<div className="flex min-h-screen items-center justify-center p-8" style={{ background: "#0b0b0f" }}>
				<div className="max-w-lg rounded-xl border p-8" style={{ background: "#17171e", border: "1px solid #25252f" }}>
					<h1 className="text-2xl font-bold mb-4" style={{ color: "#edeef2" }}>
						Payment Failed
					</h1>
					<p style={{ color: "#888898", marginBottom: "24px" }}>
						Your payment was declined. Please try again or contact support.
					</p>
					<a
						href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/"
						className="inline-block px-6 py-3 rounded-lg font-semibold"
						style={{
							background: "#f0a020",
							color: "#0b0b0f",
							textDecoration: "none",
							cursor: "pointer",
						}}
					>
						Try Again
					</a>
				</div>
			</div>
		);
	}

	return (
		<div
			className="flex min-h-screen items-center justify-center p-4"
			style={{
				background: "linear-gradient(135deg, #0b0b0f 0%, #1a1a23 100%)",
			}}
		>
			<div
				className="w-full max-w-2xl rounded-[20px] border p-12 text-center backdrop-blur-xl"
				style={{
					background: "rgba(23, 23, 30, 0.8)",
					border: "1px solid #25252f",
					boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
				}}
			>
				{/* Success Checkmark Animation */}
				<div
					style={{
						fontSize: "80px",
						marginBottom: "24px",
						animation: "pulse 1s ease-in-out",
					}}
				>
					✨
				</div>

				{/* Title */}
				<h1
					className="text-4xl font-extrabold mb-2 tracking-tight"
					style={{
						fontFamily: "'Plus Jakarta Sans', sans-serif",
						color: "#edeef2",
						letterSpacing: "-0.5px",
					}}
				>
					Welcome to Recon <span style={{ color: "#f0a020" }}>AI</span>
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
					Your purchase was successful! 🎉
				</p>

				{/* Description */}
				<div
					className="mb-10 p-6 rounded-lg"
					style={{
						background: "rgba(240, 160, 32, 0.05)",
						border: "1px solid rgba(240, 160, 32, 0.2)",
					}}
				>
					<p
						style={{
							fontSize: "15px",
							color: "#aaaabc",
							fontFamily: "'Plus Jakarta Sans', sans-serif",
							lineHeight: "1.8",
							margin: 0,
						}}
					>
						You now have full access to AI-powered lead research, personalized cold calling scripts, and advanced pipeline tracking. Let's find you some qualified leads.
					</p>
				</div>

				{/* Features Preview */}
				<div className="mb-10 space-y-3 text-left">
					{[
						"🔍 AI-Powered Lead Research",
						"📝 Personalized Cold Calling Scripts",
						"📊 Advanced Pipeline Tracking",
						"⚡ Real-Time Lead Insights",
					].map((feature, i) => (
						<div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
							<div
								style={{
									width: "8px",
									height: "8px",
									borderRadius: "50%",
									background: "#f0a020",
								}}
							/>
							<span
								style={{
									color: "#aaaabc",
									fontSize: "14px",
									fontFamily: "'Plus Jakarta Sans', sans-serif",
								}}
							>
								{feature}
							</span>
						</div>
					))}
				</div>

				{/* CTA Button */}
				<div className="mb-6">
					<a
						href="/experiences/recon-ai"
						className="inline-block px-8 py-4 rounded-lg font-semibold transition-all"
						style={{
							background: "#f0a020",
							color: "#0b0b0f",
							fontFamily: "'Plus Jakarta Sans', sans-serif",
							fontSize: "15px",
							fontWeight: 600,
							cursor: "pointer",
							textDecoration: "none",
							display: "inline-block",
						}}
						onMouseEnter={(e) => (e.currentTarget.style.background = "#fbbf24")}
						onMouseLeave={(e) => (e.currentTarget.style.background = "#f0a020")}
					>
						Launch Recon AI →
					</a>
				</div>

				{/* License Key Retrieval */}
				{!licenseKey ? (
					<div
						style={{
							marginTop: "20px",
							padding: "16px",
							background: "rgba(240, 160, 32, 0.1)",
							border: "1px solid rgba(240, 160, 32, 0.2)",
							borderRadius: "8px",
						}}
					>
						<p
							style={{
								fontSize: "11px",
								color: "#888898",
								fontFamily: "'Plus Jakarta Sans', sans-serif",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								marginBottom: "12px",
								fontWeight: 600,
							}}
						>
							🔑 Get Your License Key
						</p>
						<div style={{ marginBottom: "12px" }}>
							{verifyStep === "code" ? (
								<>
									<input
										type="text"
										placeholder="Enter 4-digit code"
										value={verifyCode}
										onChange={(e) => setVerifyCode(e.target.value)}
										maxLength={4}
										onKeyPress={(e) => {
											if (e.key === "Enter") handleVerifyCode();
										}}
										style={{
											width: "100%",
											padding: "10px",
											background: "#0b0b0f",
											border: "1px solid #25252f",
											borderRadius: "6px",
											color: "#edeef2",
											fontFamily: "'Plus Jakarta Sans', sans-serif",
											fontSize: "13px",
											boxSizing: "border-box",
											marginBottom: "8px",
										}}
									/>
									<button
										onClick={handleVerifyCode}
										disabled={verifyLoading}
										style={{
											width: "100%",
											padding: "10px",
											background: verifyLoading ? "#888898" : "#f0a020",
											color: "#0b0b0f",
											border: "none",
											borderRadius: "6px",
											fontWeight: 600,
											cursor: verifyLoading ? "not-allowed" : "pointer",
											fontFamily: "'Plus Jakarta Sans', sans-serif",
											fontSize: "13px",
										}}
									>
										{verifyLoading ? "Verifying..." : "Verify Code"}
									</button>
								</>
							) : (
								<>
									<input
										type="email"
										placeholder="Enter your email"
										value={verifyEmail}
										onChange={(e) => setVerifyEmail(e.target.value)}
										onKeyPress={(e) => {
											if (e.key === "Enter") handleSendVerificationCode();
										}}
										style={{
											width: "100%",
											padding: "10px",
											background: "#0b0b0f",
											border: "1px solid #25252f",
											borderRadius: "6px",
											color: "#edeef2",
											fontFamily: "'Plus Jakarta Sans', sans-serif",
											fontSize: "13px",
											boxSizing: "border-box",
											marginBottom: "8px",
										}}
									/>
									<button
										onClick={handleSendVerificationCode}
										disabled={verifyLoading}
										style={{
											width: "100%",
											padding: "10px",
											background: verifyLoading ? "#888898" : "#f0a020",
											color: "#0b0b0f",
											border: "none",
											borderRadius: "6px",
											fontWeight: 600,
											cursor: verifyLoading ? "not-allowed" : "pointer",
											fontFamily: "'Plus Jakarta Sans', sans-serif",
											fontSize: "13px",
										}}
									>
										{verifyLoading ? "Sending..." : "Send Code"}
									</button>
								</>
							)}
							{verifyError && (
								<p
									style={{
										fontSize: "12px",
										color: "#ef4444",
										fontFamily: "'Plus Jakarta Sans', sans-serif",
										marginTop: "8px",
									}}
								>
									{verifyError}
								</p>
							)}
						</div>
					</div>
				) : (
					<div
						style={{
							marginTop: "20px",
							padding: "16px",
							background: "rgba(34, 197, 94, 0.1)",
							border: "1px solid rgba(34, 197, 94, 0.3)",
							borderRadius: "8px",
						}}
					>
						<p
							style={{
								fontSize: "11px",
								color: "#22c55e",
								fontFamily: "'Plus Jakarta Sans', sans-serif",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								marginBottom: "10px",
								fontWeight: 600,
							}}
						>
							✓ Your License Key
						</p>
						<div
							style={{
								background: "#0b0b0f",
								border: "1px solid #25252f",
								borderRadius: "6px",
								padding: "12px",
								marginBottom: "12px",
							}}
						>
							<p
								style={{
									fontSize: "12px",
									color: "#888898",
									margin: "0 0 6px 0",
									fontFamily: "'Plus Jakarta Sans', sans-serif",
								}}
							>
								License Key (click to copy):
							</p>
							<p
								onClick={() => {
									navigator.clipboard.writeText(licenseKey);
								}}
								style={{
									fontSize: "16px",
									color: "#f0a020",
									fontFamily: "'DM Mono', monospace",
									margin: 0,
									padding: "8px",
									background: "rgba(240, 160, 32, 0.1)",
									borderRadius: "4px",
									cursor: "pointer",
									userSelect: "all",
									wordBreak: "break-all",
								}}
							>
								{licenseKey}
							</p>
						</div>
						<p
							style={{
								fontSize: "12px",
								color: "#aaaabc",
								fontFamily: "'Plus Jakarta Sans', sans-serif",
								margin: 0,
								lineHeight: "1.5",
							}}
						>
							Use this key to access Recon AI: <br />
							<code style={{ color: "#f0a020" }}>testol.wtf/experiences/recon-ai?license_key={licenseKey}</code>
						</p>
					</div>
				)}


				{/* Pulse animation */}
				<style>{`
					@keyframes pulse {
						0%, 100% { opacity: 1; transform: scale(1); }
						50% { opacity: 0.7; transform: scale(1.1); }
					}
				`}</style>
			</div>
		</div>
	);
}

export default function CheckoutSuccessPage() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen items-center justify-center" style={{ background: "#0b0b0f" }}>
				<div style={{ color: "#888898" }}>Loading...</div>
			</div>
		}>
			<CheckoutSuccessContent />
		</Suspense>
	);
}
