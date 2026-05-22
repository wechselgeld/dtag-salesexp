'use client';

import {
	useEffect, useRef, useState,
} from 'react';
import {
	useMotionValue, useSpring, useMotionValueEvent,
} from 'framer-motion';
import {
	useSettingsStore,
} from '@/hooks/use-settings-store';

interface AnimatedNumberProps {
	value: number;
	precision?: number;
	className?: string;
}

export function AnimatedNumber({
	value,
	precision = 2,
	className,
}: AnimatedNumberProps) {
	const reduceAnimations = useSettingsStore((state) => state.reduceAnimations);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setHydrated(true);
	}, []);

	const motionValue = useMotionValue(value);
	const springValue = useSpring(motionValue, {
		stiffness: 200,
		damping: 30,
		restDelta: 0.001,
	});
	const ref = useRef<HTMLSpanElement>(null);

	const formatter = new Intl.NumberFormat('de-DE', {
		minimumFractionDigits: precision,
		maximumFractionDigits: precision,
	});

	// Use spring animation unless the user has requested reduced motion (and the client is hydrated)
	const shouldReduceMotion = hydrated && reduceAnimations;
	const activeValue = shouldReduceMotion ? motionValue : springValue;

	// Initial set
	useEffect(() => {
		if (ref.current) {
			ref.current.textContent = formatter.format(value);
		}
	}, [
	]);

	useEffect(() => {
		motionValue.set(value);
	}, [
		value,
		motionValue,
	]);

	useMotionValueEvent(activeValue, 'change', (latest) => {
		if (ref.current) {
			ref.current.textContent = formatter.format(latest);
		}
	});

	return <span ref={ref} className={className} />;
}
