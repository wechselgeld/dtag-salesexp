import { Metadata } from "next";
import ProductsClient from "./products-client";

export const metadata: Metadata = {
	title: "Produktauswahl"
};

export default function Page() {
	return <ProductsClient />;
}
