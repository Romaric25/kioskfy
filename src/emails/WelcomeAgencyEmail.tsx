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

interface WelcomeAgencyEmailProps {
    agenceName: string;
    laboUrl: string;
    appName?: string;
    lastName?: string;
}

export const WelcomeAgencyEmail = ({
    agenceName,
    laboUrl,
    appName = "kioskfy.com",
    lastName,
}: WelcomeAgencyEmailProps) => {
    const previewText = lastName ? `Bienvenue chez ${appName} - ${lastName}` : `Bienvenue chez ${appName}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <EmailHeader appName={appName} />

                    <Section style={content}>
                        <Section style={welcomeSection}>
                            <Heading as="h2" style={heading}>🎉 Bienvenue !</Heading>
                            <Text style={paragraph}>
                                Félicitations ! Votre agence <strong>{agenceName}</strong> a été créée avec succès sur <strong>{appName}</strong>.
                                Vous faites maintenant partie de la plus grande plateforme de distribution digitale de la presse
                                africaine.
                            </Text>
                        </Section>

                        <Section style={successBox}>
                            <Heading as="h3" style={successHeading}>✅ Votre compte est prêt !</Heading>
                            <Text style={successText}>
                                Votre espace partenaire est maintenant disponible et vous pouvez commencer à configurer votre agence.
                            </Text>
                        </Section>

                        <Section style={buttonContainer}>
                            <Button href={laboUrl} style={button}>
                                🚀 Accéder à mon tableau de bord
                            </Button>
                        </Section>

                        <Section style={featureList}>
                            <Heading as="h3" style={featureHeading}>🌟 Ce que vous pouvez faire avec {appName}</Heading>
                            <ul style={list}>
                                <li style={listItem}><strong>Gérer vos publications</strong> et les distribuer à des millions de lecteurs</li>
                                <li style={listItem}><strong>Accéder à des analytics</strong> détaillés sur vos performances</li>
                                <li style={listItem}><strong>Monétiser votre contenu</strong> avec nos solutions de paiement intégrées</li>
                                <li style={listItem}><strong>Bénéficier d'un support</strong> dédié et d'une assistance technique 24/7</li>
                            </ul>
                        </Section>

                        <Section style={nextSteps}>
                            <Heading as="h4" style={nextStepsHeading}>📋 Prochaines étapes recommandées :</Heading>
                            <ol style={list}>
                                <li style={listItem}>Connectez-vous à votre tableau de bord avec le bouton ci-dessus</li>
                                <li style={listItem}>Ajoutez vos publications et configurez vos abonnements</li>
                                <li style={listItem}>Invitez vos collaborateurs à rejoindre la plateforme</li>
                                <li style={listItem}>Explorez nos outils d'analyse et de reporting</li>
                            </ol>
                        </Section>

                        <Section style={securityNote}>
                            <Text style={securityText}>
                                <strong>🔒 Note de sécurité :</strong> {appName} ne vous demandera jamais votre mot de passe
                                par email. Ne partagez jamais vos informations d'identification.
                            </Text>
                        </Section>

                        <Hr style={divider} />

                        <Section>
                            <Text style={helpText}>
                                🌐 Site web : <Link href="https://epressafrique.com" style={link}>epressafrique.com</Link>
                            </Text>
                            <Text style={helpText}>
                                🌐 Accès au tableau de bord : <Link href={laboUrl} style={link}>{laboUrl}</Link>
                            </Text>
                        </Section>
                    </Section>

                    <EmailFooter appName={appName} />
                </Container>
            </Body>
        </Html>
    );
};

export default WelcomeAgencyEmail;

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
    marginTop: "0",
};

const paragraph = {
    color: "#666",
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "0",
};

const successBox = {
    background: "#d4edda",
    border: "1px solid #c3e6cb",
    borderRadius: "8px",
    padding: "20px",
    margin: "20px 0",
};

const successHeading = {
    color: "#155724",
    fontSize: "18px",
    marginBottom: "10px",
    marginTop: "0",
};

const successText = {
    color: "#155724",
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

const featureList = {
    background: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    margin: "20px 0",
    borderLeft: "4px solid #157023",
};

const featureHeading = {
    color: "#333",
    fontSize: "18px",
    marginBottom: "15px",
    marginTop: "0",
};

const list = {
    color: "#666",
    fontSize: "14px",
    marginLeft: "20px",
    marginTop: "0",
    marginBottom: "0",
    paddingLeft: "0",
};

const listItem = {
    margin: "8px 0",
};

const nextSteps = {
    background: "#fff3cd",
    border: "1px solid #ffeaa7",
    borderRadius: "8px",
    padding: "20px",
    margin: "20px 0",
};

const nextStepsHeading = {
    color: "#856404",
    fontSize: "16px",
    marginBottom: "10px",
    marginTop: "0",
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
    marginBottom: "0",
};

const link = {
    color: "#157023",
    textDecoration: "underline",
};
