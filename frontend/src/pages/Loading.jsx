export default function Loading() {
	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0A1F44]">
			<div className="flex flex-col items-center gap-6">
				{/* Spinner */}
				<div className="w-12 h-12 border-4 border-[#C9973A]/30 border-t-[#C9973A] rounded-full animate-spin" />

				{/* Text */}
				<div className="font-mono text-[10px] tracking-[4px] uppercase text-[#E8B84B]">
					Loading
				</div>
			</div>
		</div>
	);
}
