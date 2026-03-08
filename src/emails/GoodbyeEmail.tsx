import {
	Html,
	Head,
	Preview,
	Body,
	Container,
	Section,
	Text,
	Hr,
	Img
} from "@react-email/components";

interface GoodbyeEmailProps {
	email: string;
	appUrl: string;
}

const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif'
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "40px 20px",
	marginBottom: "64px",
	borderRadius: "12px",
	boxShadow: "0 4px 14px rgba(0, 0, 0, 0.05)",
	maxWidth: "580px"
};

const logoContainer = {
	textAlign: "left" as const,
	marginBottom: "32px"
};

const h1 = {
	color: "#e20074",
	fontSize: "24px",
	fontWeight: "700",
	lineHeight: "1.2",
	margin: "0 0 24px",
	textAlign: "left" as const
};

const text = {
	color: "#333",
	fontSize: "16px",
	lineHeight: "26px",
	margin: "0 0 20px"
};

const hr = {
	borderColor: "#eaedf0",
	margin: "32px 0 24px"
};

const footer = {
	color: "#8898aa",
	fontSize: "13px",
	lineHeight: "20px",
	margin: "0",
	textAlign: "center" as const
};

export const GoodbyeEmail = ({ email, appUrl }: GoodbyeEmailProps) => {
	return (
		<Html>
			<Head />
			<Preview>Dein Konto für die Sales Experience wurde gelöscht.</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={logoContainer}>
						<Img
							src={`${appUrl}/se-logo.svg`}
							alt="Sales Experience Logo"
							width="180"
						/>
					</Section>

					<Text style={h1}>Dein Konto wurde gelöscht</Text>

					<Text style={text}>Guten Tag,</Text>
					<Text style={text}>
						dein Zugang zur Verwaltung der Sales Experience für die E-Mail{" "}
						<span style={{ fontWeight: "600" }}>{email}</span> wurde soeben
						gelöscht.
					</Text>

					<Text style={text}>
						Du hast nun keinen Zugriff mehr auf das Dashboard. Falls dies ein
						Fehler war oder du Fragen hast, wende dich bitte an einen
						zuständigen Administrator.
					</Text>

					<Hr style={hr} />

					<Text style={footer}>
						Diese E-Mail wurde automatisch generiert. Bitte antworte nicht
						darauf.
					</Text>
					<Text style={{ ...footer, marginTop: "8px" }}>
						&copy; {new Date().getFullYear()} Felix Kinze für Deutsche Telekom
						Service GmbH |{" "}
						<span style={{ color: "#e20074", fontWeight: "600" }}>
							Sales Experience
						</span>{" "}
						v2.3
					</Text>
				</Container>
			</Body>
		</Html>
	);
};

export default GoodbyeEmail;
