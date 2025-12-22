import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Hr,
} from "@react-email/components";
import * as React from "react";
import EmailHeader from "./components/EmailHeader";
import EmailFooter from "./components/EmailFooter";
import HelpSection from "./components/HelpSection";

interface VerificationClientEmailProps {
    lastName: string;
    verificationUrl: string;
    appName?: string;
}

export const VerificationClientEmail = ({
    lastName,
    verificationUrl,
    appName = "kioskfy.com",
}: VerificationClientEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Vérification de votre email - {appName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <EmailHeader appName={appName} />

                    <Section style={content}>
                        <Heading as="h1" style={title}>Bonjour {lastName} !</Heading>

                        <Text style={text}>
                            Merci de vous être inscrit sur <strong>{appName}</strong>. Pour activer votre compte et commencer à utiliser
                            nos services, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
                        </Text>

                        <Section style={buttonContainer}>
                            <Button href={verificationUrl} style={button}>
                                Vérifier mon email
                            </Button>
                        </Section>

                        <Section style={alert}>
                            <Text style={alertText}>
                                <strong>⏰ Important :</strong> Ce lien expirera dans 24 heures.
                            </Text>
                            <Text style={{ ...alertText, marginBottom: "0" }}>
                                <strong>🔒 Sécurité :</strong> Si vous n'avez pas créé de compte sur {appName}, vous pouvez ignorer cet
                                email en toute sécurité.
                            </Text>
                        </Section>

                        <Hr style={divider} />

                        <HelpSection />
                    </Section>

                    <EmailFooter appName={appName} />
                </Container>
            </Body>
        </Html>
    );
};

export default VerificationClientEmail;

const main = {
    backgroundColor: "#f4f4f4",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    maxWidth: "600px",
};

const content = {
    padding: "40px 20px",
};

const title = {
    fontSize: "28px",
    color: "#157023",
    fontWeight: "bold",
    textAlign: "center" as const,
    marginBottom: "20px",
    margin: "0 0 20px",
};

const text = {
    fontSize: "16px",
    color: "#333333",
    lineHeight: "24px",
    marginBottom: "20px",
};

const buttonContainer = {
    textAlign: "center" as const,
    margin: "32px 0",
};

const button = {
    display: "inline-block",
    padding: "14px 28px",
    backgroundColor: "#157023",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    textAlign: "center" as const,
};

const alert = {
    backgroundColor: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "20px",
    margin: "32px 0",
};

const alertText = {
    fontSize: "14px",
    color: "#991b1b",
    lineHeight: "20px",
    marginBottom: "10px",
    marginTop: "0",
};

const divider = {
    borderTop: "1px solid #e5e7eb",
    margin: "32px 0",
};
