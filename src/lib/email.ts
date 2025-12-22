import nodemailer from "nodemailer";

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

const smtpOptions = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
};

export const transporter = nodemailer.createTransport({
    ...smtpOptions,
});

export const sendEmail = async (data: EmailPayload) => {
    const { to, subject, html } = data;

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.warn("SMTP_USER or SMTP_PASSWORD not set. Email will not be sent.");
        return;
    }

    return await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
        ...data,
    });
};
