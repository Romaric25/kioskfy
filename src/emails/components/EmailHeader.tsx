import { Img, Section } from "@react-email/components";
import * as React from "react";

export const EmailHeader = ({ appName = "kioskfy.com" }: { appName?: string }) => (
    <Section style={{ backgroundColor: "#ffffff", padding: "20px", textAlign: "center", borderRadius: "8px 8px 0 0" }}>
        <Img
            src="https://media.dealafrique.com/__kioskfy-logo.png"
            alt={appName}
            width="200"
            height="80"
            style={{ margin: "0 auto", display: "block" }}
        />
    </Section>
);

export default EmailHeader;
