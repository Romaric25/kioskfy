import { Link, Section, Text, Heading } from "@react-email/components";
import * as React from "react";

export const HelpSection = () => (
    <Section style={{ backgroundColor: "#f9fafb", padding: "24px", borderRadius: "8px", margin: "20px 0" }}>
        <Heading as="h2" style={{ fontSize: "20px", color: "#157023", fontWeight: "bold", marginBottom: "16px" }}>
            💬 Besoin d'aide ?
        </Heading>
        <Text style={{ fontSize: "16px", color: "#333333", lineHeight: "24px", marginBottom: "16px" }}>
            Si vous rencontrez des difficultés ou avez des questions, n'hésitez pas à nous contacter :
        </Text>
        <Text style={{ fontSize: "16px", color: "#333333", lineHeight: "24px", marginBottom: "16px" }}>
            📧 Email : <Link href="mailto:support@dealafrique.com" style={{ color: "#950025", textDecoration: "underline" }}>support@dealafrique.com</Link>
        </Text>
        <Text style={{ fontSize: "16px", color: "#333333", lineHeight: "24px", marginBottom: "16px" }}>
            🌐 Site web : <Link href="https://dealafrique.com" style={{ color: "#950025", textDecoration: "underline" }}>dealafrique.com</Link>
        </Text>
    </Section>
);

export default HelpSection;
