import type {
	NextConfig,
} from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
			{
				protocol: 'http',
				hostname: '**',
			},
		],
	},
	experimental: {
		optimizePackageImports: [
			'lucide-react',
		],
	},
	turbopack: {
		root: '.',
	},
};

export default nextConfig;
