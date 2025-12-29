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

interface ResetPasswordEmailProps {
    url: string;
    name?: string;
    appName?: string;
}

export const ResetPasswordEmail = ({
    url,
    name = "Utilisateur",
    appName = "Kioskfy",
}: ResetPasswordEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Réinitialisation de votre mot de passe - {appName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <EmailHeader appName={appName} />

                    <Section style={content}>
                        <Section style={welcomeSection}>
                            <Heading as="h2" style={heading}>Bonjour {name},</Heading>
                            <Text style={paragraph}>
                                Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte sur <strong>{appName}</strong>.
                            </Text>
                            <Text style={paragraph}>
                                Si vous êtes à l'origine de cette demande, vous pouvez réinitialiser votre mot de passe en cliquant sur le bouton ci-dessous :
                            </Text>
                        </Section>

                        <Section style={buttonContainer}>
                            <Button href={url} style={button}>
                                🔄 Réinitialiser mon mot de passe
                            </Button>
                        </Section>

                        <Section style={securityNote}>
                            <Text style={securityText}>
                                <strong>⚠️ Note de sécurité :</strong> Ce lien est valide pour une durée limitée. Si vous n'avez pas demandé de réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel restera inchangé.
                            </Text>
                        </Section>

                        <Hr style={divider} />
                    </Section>

                    <EmailFooter appName={appName} />
                </Container>
            </Body>
        </Html>
    );
};

export default ResetPasswordEmail;

const main = {
    backgroundColor: "#f4f4f4",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    maxWidth: "600px",
    overflow: "hidden" as const,
};

const content = {
    padding: "40px 30px",
};

const welcomeSection = {
    marginBottom: "30px",
};

const heading = {
    color: "#333",
    fontSize: "24px",
    marginBottom: "15px",
};

const paragraph = {
    color: "#666",
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "15px",
};

const buttonContainer = {
    textAlign: "center" as const,
    margin: "30px 0",
};

const button = {
    backgroundColor: "#157023",
    color: "white",
    padding: "15px 30px",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
};

const securityNote = {
    background: "#d1ecf1",
    border: "1px solid #bee5eb",
    borderRadius: "8px",
    padding: "15px",
    margin: "20px 0",
};

const securityText = {
    fontSize: "13px",
    color: "#0c5460",
    margin: "0",
    lineHeight: "1.4",
};

const divider = {
    borderTop: "1px solid #e5e7eb",
    margin: "32px 0",
};