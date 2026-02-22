import { Metadata } from "next";
import PricesClient from "./prices-client";

export const metadata: Metadata = {
	title: "Aktionspreise"
};

export default function Page() {
	return <PricesClient />;
}
