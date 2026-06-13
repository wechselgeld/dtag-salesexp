import React from 'react';
import {
	Text,
} from '@react-pdf/renderer';
import {
	styles,
} from './styles';

export const Footer: React.FC = () => {
	return (
		<Text
			fixed
			style={styles.footerText}
			render={({
 pageNumber, totalPages,
}) => `${pageNumber} / ${totalPages}`}
		/>
	);
};
