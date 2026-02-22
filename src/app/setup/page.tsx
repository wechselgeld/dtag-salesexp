import { Metadata } from "next";
import SetupClient from "./setup-client";

export const metadata: Metadata = {
	title: "Sitzung einrichten"
};

export default function Page() {
	return <SetupClient />;
}
