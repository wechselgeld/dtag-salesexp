import { Metadata } from "next";
import ProductDetailClient from "./product-detail-client";
import { prisma } from "@/lib/prisma";

type Props = {
	params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const id = (await params).id;
	const product = await prisma.product.findUnique({
		where: { id },
		select: { name: true }
	});

	return {
		title: product?.name || "Produktdetails"
	};
}

export default async function Page({ params }: Props) {
	return <ProductDetailClient />;
}
