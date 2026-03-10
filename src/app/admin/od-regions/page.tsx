import { Metadata } from "next";
import OdRegionsClient from "./od-regions-client";

export const metadata: Metadata = {
	title: "OD-Bereiche verwalten"
};

export default function Page() {
	return <OdRegionsClient />;
}
