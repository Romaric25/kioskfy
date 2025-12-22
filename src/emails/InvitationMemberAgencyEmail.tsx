import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Hr,
} from "@react-email/components";
import * as React from "react";
import EmailHeader from "./components/EmailHeader";
import EmailFooter from "./components/EmailFooter";

interface InvitationMemberAgencyEmailProps {
    invitedByUsername: string;
    teamName: string;
    inviteLink: string;
    appName?: string;
}

export const InvitationMemberAgencyEmail = ({
    invitedByUsername,
    teamName,
    inviteLink,
    appName = "kioskfy.com",
}: InvitationMemberAgencyEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Invitation à rejoindre {teamName} sur {appName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <EmailHeader appName={appName} />

                    <Section style={content}>
                        <Section style={invitationSection}>
                            <Heading as="h2" style={heading}>🎉 Vous avez été invité(e) !</Heading>
                            <Text style={paragraph}>Bonjour,</Text>
                            <Text style={paragraph}>
                                <strong>{invitedByUsername}</strong> vous invite à rejoindre l'équipe de l'agence{" "}
                                <strong>{teamName}</strong> sur {appName}, la plateforme de distribution
                                digitale de la presse africaine.
                            </Text>
                        </Section>

                        <Section style={infoBox}>
                            <Heading as="h3" style={infoHeading}>✉️ Votre invitation est prête</Heading>
                            <Text style={infoText}>
                                Cliquez sur le bouton ci-dessous pour accepter l'invitation et rejoindre l'équipe.
                            </Text>
                        </Section>

                        <Section style={buttonContainer}>
                            <Button href={inviteLink} style={button}>
                                ✅ Accepter l'invitation
                            </Button>
                        </Section>

                        <Section style={securityNote}>
                            <Text style={securityText}>
                                <strong>🔒 Note de sécurité :</strong> Cette invitation est personnelle et ne doit pas
                                être transférée. Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.
                            </Text>
                        </Section>

                        <Hr style={divider} />

                        <Section>
                            <Text style={helpText}>
                                💡 <strong>Besoin d'aide ?</strong> Contactez notre équipe support à{" "}
                                <Link href="mailto:support@epressafrique.com" style={link}>support@epressafrique.com</Link>
                            </Text>
                            <Text style={helpText}>
                                🌐 Site web : <Link href="https://epressafrique.com" style={link}>epressafrique.com</Link>
                            </Text>
                        </Section>
                    </Section>

                    <EmailFooter appName={appName} />
                </Container>
            </Body>
        </Html>
    );
};

export default InvitationMemberAgencyEmail;

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

const invitationSection = {
    marginBottom: "30px",
};

const heading = {
    color: "#333",
    fontSize: "24px",
    marginBottom: "15px",
    marginTop: "0",
};

const paragraph = {
    color: "#666",
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "10px",
};

const infoBox = {
    background: "#e3f2fd",
    border: "1px solid #90caf9",
    borderRadius: "8px",
    padding: "20px",
    margin: "20px 0",
};

const infoHeading = {
    color: "#1565c0",
    fontSize: "18px",
    marginBottom: "10px",
    marginTop: "0",
};

const infoText = {
    color: "#1565c0",
    fontSize: "14px",
    margin: "5px 0",
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
};

const divider = {
    borderTop: "1px solid #e5e7eb",
    margin: "32px 0",
};

const helpText = {
    fontSize: "14px",
    color: "#666",
    lineHeight: "20px",
    marginBottom: "10px",
    marginTop: "0",
};

const link = {
    color: "#157023",
    textDecoration: "underline",
};
