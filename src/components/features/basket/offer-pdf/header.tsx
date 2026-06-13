import React from 'react';
import {
	View, Text, Svg, G, Path,
} from '@react-pdf/renderer';
import {
	styles,
} from './styles';

interface HeaderProps {
	title: string;
	dateStr?: string;
}

export const Header: React.FC<HeaderProps> = ({
	title,
	dateStr = new Date().toLocaleDateString('de-DE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	}),
}) => {
	return (
		<View style={styles.headerContainer}>
			<View style={{
 flexDirection: 'column',
}}>
				<View style={styles.logoContainer}>
					<Svg viewBox="0 0 76.728 91.282" style={{
 width: 28,
height: 33.3,
}}>
						<G transform="matrix(.2857 0 0 .2857 71.408 28.262)" fill="#e20074">
							<Path d="m-33.599 218.73v-22.192h-15.256c-26.315 0-38.393-15.643-38.393-38.665v-232.6h4.5246c49.283 0 80.582 32.707 80.582 80.797v4.3092h18.745v-107.3h-264.58v107.3h18.745v-4.3092c0-48.09 31.298-80.797 80.582-80.797h4.5246v232.6c0 23.022-12.078 38.665-38.393 38.665h-15.256v22.192z" />
							<Path d="m16.603 111.43h-62.914v-63.129h62.914z" />
							<Path d="m-185.07 111.43h-62.914v-63.129h62.914z" />
						</G>
					</Svg>
				</View>
				<View style={{
 marginTop: 15,
}}>
					<Text style={styles.pageTitle}>{title}</Text>
				</View>
			</View>
			<Text style={styles.dateText}>Datum: {dateStr}</Text>
		</View>
	);
};
