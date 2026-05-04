import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { whopsdk } from "@/lib/whop-sdk";

export default async function CheckoutSuccessPage() {
	try {
		// Verify user has valid Whop session
		const { userId } = await whopsdk.verifyUserToken(await headers());

		// Verify they actually purchased the product
		const productId = process.env.NEXT_PUBLIC_WHOP_PRODUCT_ID || "prod_wnUBQEF08WxYE";
		const access = await whopsdk.users.checkAccess(productId, { id: userId });

		// If they don't have access, they didn't actually buy
		if (!access.has_access) {
			return (
				<div className="flex min-h-screen items-center justify-center p-8" style={{ background: "#0b0b0f" }}>
					<div className="max-w-lg rounded-xl border p-8" style={{ background: "#17171e", border: "1px solid #25252f" }}>
						<h1 className="text-2xl font-bold mb-4" style={{ color: "#edeef2" }}>
							Payment Issue
						</h1>
						<p style={{ color: "#888898", marginBottom: "24px" }}>
							We couldn't verify your purchase. Please try again or contact support.
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
							onMouseEnter={(e) => (e.currentTarget.style.background = "#fbbf24")}
							onMouseLeave={(e) => (e.currentTarget.style.background = "#f0a020")}
						>
							Return to Product
						</a>
					</div>
				</div>
			);
		}

		// User purchased successfully - show welcome and redirect to app
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
						Welcome to Recon{" "}
						<span style={{ color: "#f0a020" }}>AI</span>
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

					{/* Auto-redirect info */}
					<p
						style={{
							fontSize: "12px",
							color: "#555567",
							fontFamily: "'Plus Jakarta Sans', sans-serif",
						}}
					>
						Redirecting in 5 seconds...
					</p>

					{/* Auto-redirect script */}
					<script
						dangerouslySetInnerHTML={{
							__html: `
								setTimeout(() => {
									window.location.href = '/experiences/recon-ai';
								}, 5000);
							`,
						}}
					/>

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
	} catch (error) {
		console.error("[checkout-success] Error:", error);
		// Redirect to home on auth failure
		redirect("/");
	}
}
