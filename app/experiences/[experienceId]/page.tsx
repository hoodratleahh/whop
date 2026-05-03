import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;
	// Localhost fallback: allow preview without Whop token.
	if (experienceId === "test") {
		return (
			<div className="w-screen h-screen overflow-hidden">
				<iframe
					title="Recon Lead Tool"
					src="/lead-tool.html"
					className="w-full h-full border-0"
					allow="clipboard-read; clipboard-write"
				/>
			</div>
		);
	}

	// Ensure the user is logged in on Whop.
	const { userId } = await whopsdk.verifyUserToken(await headers());

	// Verify entitlement for this experience.
	const access = await whopsdk.users.checkAccess(experienceId, { id: userId });
	if (!access.has_access) {
		return (
			<div className="flex min-h-screen items-center justify-center p-8">
				<div className="max-w-lg rounded-xl border border-gray-a4 bg-gray-a2 p-6">
					<h1 className="text-8 font-bold mb-2">Access Required</h1>
					<p className="text-4 text-gray-11">
						You do not currently have access to this tool. Please purchase the required plan in Whop.
					</p>
				</div>
			</div>
		);
	}

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
