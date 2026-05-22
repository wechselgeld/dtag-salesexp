'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				ease: [0.16, 1, 0.3, 1], // Custom premium ease-out curve (cubic-bezier)
				duration: 0.28,          // Relatively short and smooth (280ms)
			}}
			className="w-full h-full"
		>
			{children}
		</motion.div>
	);
}
