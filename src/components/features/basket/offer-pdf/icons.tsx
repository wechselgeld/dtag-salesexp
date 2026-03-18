import React from 'react';
import {
	Svg,
	Path,
	Circle,
	Rect,
} from '@react-pdf/renderer';
import {
	T,
} from './tokens';

export const CheckIcon = ({
	color = T.success,
	size = 8,
}: {
	color?: string;
	size?: number;
}) => (
	<Svg width={size} height={size} viewBox="0 0 24 24">
		<Path
			d="M20 6L9 17L4 12"
			stroke={color}
			strokeWidth={3}
			strokeLinecap="round"
			strokeLinejoin="round"
			fill="none"
		/>
	</Svg>
);

export const ShieldIcon = ({
	size = 9,
	color = T.gray400,
}: {
	size?: number;
	color?: string;
}) => (
	<Svg width={size} height={size} viewBox="0 0 24 24">
		<Path
			d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
			stroke={color}
			strokeWidth={2.5}
			fill="none"
		/>
		<Path
			d="M9 12l2 2 4-4"
			stroke={color}
			strokeWidth={2.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			fill="none"
		/>
	</Svg>
);

export const StarIcon = ({
	size = 9,
}: {
	size?: number;
}) => (
	<Svg width={size} height={size} viewBox="0 0 24 24">
		<Path
			d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
			fill="#FBBF24"
			stroke="#F59E0B"
			strokeWidth={1}
		/>
	</Svg>
);

export const ClockIcon = ({
	size = 9,
}: {
	size?: number;
}) => (
	<Svg width={size} height={size} viewBox="0 0 24 24">
		<Circle cx="12" cy="12" r="10" stroke="#92400E" strokeWidth={2} fill="none" />
		<Path d="M12 6v6l4 2" stroke="#92400E" strokeWidth={2} strokeLinecap="round" fill="none" />
	</Svg>
);

export const MailIcon = ({
	size = 9,
	color = T.white,
}: {
	size?: number;
	color?: string;
}) => (
	<Svg width={size} height={size} viewBox="0 0 24 24">
		<Rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke={color} strokeWidth={2} />
		<Path d="M22 7l-10 7L2 7" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
	</Svg>
);

export const SparkleIcon = ({
	size = 9,
	color = T.magenta,
}: {
	size?: number;
	color?: string;
}) => (
	<Svg width={size} height={size} viewBox="0 0 24 24">
		<Path
			d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"
			fill={color}
			stroke={color}
			strokeWidth={0.5}
		/>
	</Svg>
);

export const WifiIcon = ({
	size = 9,
	color = T.accent,
}: {
	size?: number;
	color?: string;
}) => (
	<Svg width={size} height={size} viewBox="0 0 24 24">
		<Path d="M5 12.55a11 11 0 0114.08 0" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
		<Path d="M1.42 9a16 16 0 0121.16 0" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
		<Path d="M8.53 16.11a6 6 0 016.95 0" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
		<Circle cx="12" cy="20" r="1.2" fill={color} />
	</Svg>
);

export const TagIcon = ({
	size = 8,
	color = T.success,
}: {
	size?: number;
	color?: string;
}) => (
	<Svg width={size} height={size} viewBox="0 0 24 24">
		<Path
			d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
			fill="none"
			stroke={color}
			strokeWidth={2.5}
		/>
		<Circle cx="7" cy="7" r="1.5" fill={color} />
	</Svg>
);
