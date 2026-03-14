import type {
	HTMLAttributes,
} from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({
	className = '', ...props
}: SkeletonProps) {
	return (
		<div
			className={`animate-skeleton-shimmer rounded-md ${className}`}
			{...props}
		/>
	);
}
