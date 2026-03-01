import { SVGProps } from "react";

export function TelekomLogo(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="-6 -4 102 96"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<g transform="translate(71.408, 28.262) scale(0.2857)">
				<path
					fill="currentColor"
					d="m-33.599 218.73v-22.192h-15.256c-26.315 0-38.393-15.643-38.393-38.665v-232.6h4.5246c49.283 0 80.582 32.707 80.582 80.797v4.3092h18.745v-107.3h-264.58v107.3h18.745v-4.3092c0-48.09 31.298-80.797 80.582-80.797h4.5246v232.6c0 23.022-12.078 38.665-38.393 38.665h-15.256v22.192z"
				/>
				<path fill="currentColor" d="m16.603 111.43h-62.914v-63.129h62.914z" />
				<path fill="currentColor" d="m-185.07 111.43h-62.914v-63.129h62.914z" />
			</g>
		</svg>
	);
}
