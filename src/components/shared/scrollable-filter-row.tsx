'use client';

import React, {
 useRef, useState, useEffect,
} from 'react';
import {
 ChevronLeft, ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';

interface ScrollableFilterRowProps {
	children: React.ReactNode;
	className?: string;
	gradientFromClass?: string; // e.g. 'from-[#f7f8fa]' for admin pages, 'from-white' for other pages
}

export function ScrollableFilterRow({
	children,
	className,
	gradientFromClass = 'from-[#f7f8fa]',
}: ScrollableFilterRowProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [
 showLeftArrow,
setShowLeftArrow,
] = useState(false);
	const [
 showRightArrow,
setShowRightArrow,
] = useState(false);

	const checkScroll = () => {
		const container = containerRef.current;
		if (container) {
			const {
 scrollLeft, scrollWidth, clientWidth,
} = container;
			// Small tolerance of 2px for browser zoom and sub-pixel rendering rounding errors
			setShowLeftArrow(scrollLeft > 2);
			setShowRightArrow(scrollWidth - clientWidth - scrollLeft > 2);
		}
	};

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		checkScroll();

		// Add event listeners
		container.addEventListener('scroll', checkScroll);
		window.addEventListener('resize', checkScroll);

		// ResizeObserver to detect layout / content / children additions (e.g. dynamic locations loading)
		const resizeObserver = new ResizeObserver(() => {
			checkScroll();
		});
		resizeObserver.observe(container);

		// Set a brief fallback timeout for initial rendering
		const timer = setTimeout(checkScroll, 100);

		return () => {
			container.removeEventListener('scroll', checkScroll);
			window.removeEventListener('resize', checkScroll);
			resizeObserver.disconnect();
			clearTimeout(timer);
		};
	}, [
 children,
]);

	const scroll = (direction: 'left' | 'right') => {
		const container = containerRef.current;
		if (container) {
			const scrollAmount = Math.min(container.clientWidth * 0.75, 300);
			const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
			container.scrollTo({
				left: targetScroll,
				behavior: 'smooth',
			});
		}
	};

	return (
		<div className="relative w-full group">
			{/* Left Fade & Navigation Button */}
			<div
				className={clsx(
					'absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r via-80% to-transparent z-10 flex items-center justify-start pl-1 transition-all duration-300 pointer-events-none',
					gradientFromClass,
					showLeftArrow ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2',
				)}
			>
				<button
					type="button"
					onClick={() => scroll('left')}
					className="pointer-events-auto flex items-center justify-center w-8 h-8 rounded-full bg-white border border-[#eaedf0] shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-95 transition-all duration-200 text-gray-600 hover:text-[#e20074]"
					aria-label="Scroll links"
				>
					<ChevronLeft className="w-5 h-5 stroke-[2.5]" />
				</button>
			</div>

			{/* Center Scrollable Area */}
			<div
				ref={containerRef}
				className={clsx(
					'overflow-x-auto scrollbar-none flex gap-2 items-center py-1.5 px-0.5 scroll-smooth',
					className,
				)}
			>
				{children}
			</div>

			{/* Right Fade & Navigation Button */}
			<div
				className={clsx(
					'absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l via-80% to-transparent z-10 flex items-center justify-end pr-1 transition-all duration-300 pointer-events-none',
					gradientFromClass,
					showRightArrow ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2',
				)}
			>
				<button
					type="button"
					onClick={() => scroll('right')}
					className="pointer-events-auto flex items-center justify-center w-8 h-8 rounded-full bg-white border border-[#eaedf0] shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-95 transition-all duration-200 text-gray-600 hover:text-[#e20074]"
					aria-label="Scroll rechts"
				>
					<ChevronRight className="w-5 h-5 stroke-[2.5]" />
				</button>
			</div>
		</div>
	);
}
