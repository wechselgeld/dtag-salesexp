import { Metadata } from "next";
import ImpressumClient from "./impressum-client";

export const metadata: Metadata = {
	title: "Impressum"
};

export default function Page() {
	return <ImpressumClient />;
}
