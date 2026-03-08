import { Metadata } from "next";
import UsersClient from "./users-client";

export const metadata: Metadata = {
	title: "Admins verwalten"
};

export default function Page() {
	return <UsersClient />;
}
