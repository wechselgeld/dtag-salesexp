"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";

interface AnimatedNumberProps {
	value: number;
	precision?: number;
	className?: string;
}

export function AnimatedNumber({
	value,
	precision = 2,
	className
}: AnimatedNumberProps) {
	const motionValue = useMotionValue(value);
	const springValue = useSpring(motionValue, {
		stiffness: 200,
		damping: 30,
		restDelta: 0.001
	});
	const ref = useRef<HTMLSpanElement>(null);

	const formatter = new Intl.NumberFormat("de-DE", {
		minimumFractionDigits: precision,
		maximumFractionDigits: precision
	});

	// Initial set
	useEffect(() => {
		if (ref.current) {
			ref.current.textContent = formatter.format(value);
		}
	}, []);

	useEffect(() => {
		motionValue.set(value);
	}, [value, motionValue]);

	useMotionValueEvent(springValue, "change", (latest) => {
		if (ref.current) {
			ref.current.textContent = formatter.format(latest);
		}
	});

	return <span ref={ref} className={className} />;
}
