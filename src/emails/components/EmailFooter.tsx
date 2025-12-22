import { Section, Text } from "@react-email/components";
import * as React from "react";

export const EmailFooter = ({ appName = "kioskfy.com" }: { appName?: string }) => (
    <Section style={{ backgroundColor: "#f4f4f4", padding: "20px", textAlign: "center", borderRadius: "0 0 8px 8px" }}>
        <Text style={{ fontSize: "12px", color: "#666666", marginBottom: "10px" }}>
            © {new Date().getFullYear()} {appName}. Tous droits réservés.
        </Text>
        <Text style={{ fontSize: "12px", color: "#666666", marginBottom: "10px" }}>
            Vous recevez cet email car vous vous êtes inscrit sur notre plateforme.
        </Text>
    </Section>
);

export default EmailFooter;
