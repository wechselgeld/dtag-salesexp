import Link from 'next/link';
import {
	motion, AnimatePresence,
} from 'framer-motion';

export function SidebarLogo({
	collapsed,
	catColor,
}: {
	collapsed: boolean;
	catColor: string;
}) {
	return (
		<>
			{/* ───── Subtle gradient overlay at top ───── */}
			<div
				className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-0"
				style={{
					background: `linear-gradient(180deg, ${catColor}04 0%, transparent 100%)`,
				}}
			/>

			{/* ───── Logo Area ───── */}
			<div className="relative z-10 px-4 pt-6 pb-4 overflow-hidden">
				<Link href="/" className="block no-underline group shrink-0">
					<div className="relative h-12 flex items-center justify-start overflow-hidden">
						<AnimatePresence mode="wait" initial={false}>
							{collapsed ? (
								<motion.img
									key="collapsed-logo"
									src="/Deutsche_Telekom.svg"
									alt="Telekom"
									initial={{
										opacity: 0,
										scale: 0.8,
									}}
									animate={{
										opacity: 1,
										scale: 1,
									}}
									exit={{
										opacity: 0,
										scale: 0.8,
									}}
									transition={{
										duration: 0.2,
									}}
									className="w-8 h-8 select-none pointer-events-none group-hover:brightness-110 transition-all mx-auto"
								/>
							) : (
								<motion.img
									key="expanded-logo"
									src="/se-logo.svg"
									alt="Sales Experience"
									initial={{
										opacity: 0,
										x: 0,
									}}
									animate={{
										opacity: 1,
										x: 0,
									}}
									exit={{
										opacity: 0,
										x: -10,
									}}
									transition={{
										duration: 0.2,
									}}
									className="h-full w-auto max-w-none select-none pointer-events-none group-hover:brightness-110 transition-all"
								/>
							)}
						</AnimatePresence>
					</div>
				</Link>
			</div>
		</>
	);
}
