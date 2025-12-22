import { Link, Section, Text, Heading } from "@react-email/components";
import * as React from "react";

export const AgencyHelpSection = ({ appName = "kioskfy.com" }: { appName?: string }) => (
    <Section style={{ backgroundColor: "#f9fafb", padding: "24px", borderRadius: "8px", margin: "20px 0", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        <Heading as="h2" style={{ fontSize: "20px", color: "#157023", fontWeight: "bold", marginBottom: "16px" }}>
            🚀 Prochaines étapes pour votre agence
        </Heading>
        <ol style={{ fontSize: "14px", color: "#666", lineHeight: "20px", marginLeft: "20px", marginBottom: "16px" }}>
            <li style={{ margin: "5px 0" }}>Confirmez votre adresse email avec le bouton ci-dessus</li>
            <li style={{ margin: "5px 0" }}>Accédez à votre espace partenaire</li>
            <li style={{ margin: "5px 0" }}>Complétez votre profil éditorial</li>
            <li style={{ margin: "5px 0" }}>Connectez vos publications via notre API</li>
            <li style={{ margin: "5px 0" }}>Commencez à toucher des millions de lecteurs africains</li>
        </ol>

        <Heading as="h3" style={{ fontSize: "18px", color: "#157023", fontWeight: "bold", marginBottom: "12px", marginTop: "20px" }}>
            💬 Besoin d'aide ?
        </Heading>
        <Text style={{ fontSize: "14px", color: "#666", lineHeight: "20px", marginBottom: "12px" }}>
            Si vous rencontrez des difficultés ou avez des questions, notre équipe est là pour vous :
        </Text>
        <Text style={{ fontSize: "14px", color: "#666", lineHeight: "20px", marginBottom: "8px" }}>
            📧 Email : <Link href="mailto:partners@epressafrique.com" style={{ color: "#157023", textDecoration: "underline" }}>partners@epressafrique.com</Link>
        </Text>
        <Text style={{ fontSize: "14px", color: "#666", lineHeight: "20px", marginBottom: "8px" }}>
            📱 Téléphone : <Link href="tel:+2252720000000" style={{ color: "#157023", textDecoration: "underline" }}>+225 27 20 00 00 00</Link>
        </Text>
        <Text style={{ fontSize: "14px", color: "#666", lineHeight: "20px", marginBottom: "0" }}>
            🌐 Site web : <Link href="https://epressafrique.com" style={{ color: "#157023", textDecoration: "underline" }}>epressafrique.com</Link>
        </Text>
    </Section>
);

export default AgencyHelpSection;
