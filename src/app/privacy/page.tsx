import { Metadata } from "next";
import PrivacyClient from "./privacy-client";

export const metadata: Metadata = {
	title: "Datenschutz"
};

export default function Page() {
	return <PrivacyClient />;
}
