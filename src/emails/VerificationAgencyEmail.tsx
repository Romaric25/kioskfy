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
import AgencyHelpSection from "./components/AgencyHelpSection";

interface VerificationAgencyEmailProps {
    lastName: string;
    verificationUrl: string;
    appName?: string;
}

export const VerificationAgencyEmail = ({
    lastName,
    verificationUrl,
    appName = "kioskfy.com",
}: VerificationAgencyEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Confirmez votre adresse email - {appName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <EmailHeader appName={appName} />

                    <Section style={content}>
                        <Section style={welcomeSection}>
                            <Heading as="h2" style={heading}>Bienvenue {lastName} !</Heading>
                            <Text style={paragraph}>
                                Nous sommes ravis de vous accueillir sur {appName}. Votre agence est sur le point de rejoindre
                                la plus grande plateforme de distribution digitale de la presse africaine.
                            </Text>
                        </Section>

                        <Section style={buttonContainer}>
                            <Button href={verificationUrl} style={button}>
                                ✉️ Confirmer mon adresse email
                            </Button>
                        </Section>

                        <Section style={instructions}>
                            <Heading as="h4" style={instructionsHeading}>⚠️ Instructions importantes :</Heading>
                            <ul style={instructionsList}>
                                <li style={listItem}>Cliquez sur le bouton ci-dessus pour vérifier votre adresse email</li>
                                <li style={listItem}>Le lien de confirmation est valide pendant 24 heures</li>
                                <li style={listItem}>Après confirmation, vous pourrez accéder à votre espace partenaire et continuer l'inscription</li>
                                <li style={listItem}>Si vous n'avez pas demandé cette inscription, ignorez cet email</li>
                            </ul>
                        </Section>

                        <Section style={securityNote}>
                            <Text style={securityText}>
                                <strong>🔒 Note de sécurité :</strong> {appName} ne vous demandera jamais votre mot de passe
                                par email. Ne partagez jamais vos informations d'identification.
                            </Text>
                        </Section>

                        <Hr style={divider} />

                        <AgencyHelpSection appName={appName} />
                    </Section>

                    <EmailFooter appName={appName} />
                </Container>
            </Body>
        </Html>
    );
};

export default VerificationAgencyEmail;

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

const instructions = {
    background: "#fff3cd",
    border: "1px solid #ffeaa7",
    borderRadius: "8px",
    padding: "20px",
    margin: "20px 0",
};

const instructionsHeading = {
    color: "#856404",
    fontSize: "16px",
    marginBottom: "10px",
    margin: "0 0 10px",
};

const instructionsList = {
    color: "#856404",
    fontSize: "14px",
    marginLeft: "20px",
    paddingLeft: "0",
};

const listItem = {
    margin: "5px 0",
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
