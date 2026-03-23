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
	output: 'standalone',
	experimental: {
		optimizePackageImports: [
			'lucide-react',
		],
	},
	turbopack: {
		root: process.cwd(),
	},
};

export default nextConfig;
