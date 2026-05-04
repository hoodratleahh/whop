import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";

export default async function Page() {
	try {
		// Verify user is logged in
		const { userId } = await whopsdk.verifyUserToken(await headers());

		// Check if they have access to Recon AI product
		const productId = "prod_wnUBQEF08WxYE";
		const access = await whopsdk.users.checkAccess(productId, { id: userId });

		if (!access.has_access) {
			return (
				<div className="flex min-h-screen items-center justify-center p-8">
					<div className="max-w-lg rounded-xl border border-gray-a4 bg-gray-a2 p-6">
						<h1 className="text-8 font-bold mb-2">Access Required</h1>
						<p className="text-4 text-gray-11 mb-6">
							You do not currently have access to Recon AI. Purchase access to get started.
						</p>
						<a
							href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
						>
							Purchase Recon AI
						</a>
					</div>
				</div>
			);
		}

		// Show the app
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
	} catch (error) {
		// User not authenticated, show access required
		return (
			<div className="flex min-h-screen items-center justify-center p-8">
				<div className="max-w-lg rounded-xl border border-gray-a4 bg-gray-a2 p-6">
					<h1 className="text-8 font-bold mb-2">Access Required</h1>
					<p className="text-4 text-gray-11 mb-6">
						You need to purchase access to Recon AI.
					</p>
					<a
						href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
					>
						Purchase Recon AI
					</a>
				</div>
			</div>
		);
	}
}
