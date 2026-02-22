import { Metadata } from "next";
import AddonsClient from "./addons-client";

export const metadata: Metadata = {
	title: "Zubuchoptionen"
};

export default function Page() {
	return <AddonsClient />;
}
