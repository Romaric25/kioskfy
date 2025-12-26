import { auth } from "@/lib/auth";
import type { PartnershipRegisterUser } from "@/server/models/user.model";
import { db } from "@/lib/db";
import { users, verifications } from "@/db/auth-schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { generateRandomVerificationToken } from "@/lib/token-generate";
import { render } from "@react-email/components";
import VerificationAgencyEmail from "@/emails/VerificationAgencyEmail";
import { sendEmail } from "@/lib/email";

const isProduction = process.env.NODE_ENV === "production";
export class UsersController {
    /**
     * Create a new partnership user (Agency)
     */
    static async createPartnership(input: PartnershipRegisterUser) {
        try {
            const { email, password, name, lastName, phone } = input;

            const existingUserByEmail = await db.query.users.findFirst({
                where: eq(users.email, email)
            });

            if (existingUserByEmail) {
                console.log("User already exists with email:", email);
                return {
                    success: false,
                    status: 422,
                    error: "Un utilisateur avec cet email existe déjà.",
                };
            }

            // Vérification préalable si le téléphone existe
            if (phone) {
                const existingUserByPhone = await db.query.users.findFirst({
                    where: eq(users.phone, phone)
                });

                if (existingUserByPhone) {
                    console.log("User already exists with phone:", phone);
                    return {
                        success: false,
                        status: 422,
                        error: "Un utilisateur avec ce numéro de téléphone existe déjà.",
                    };
                }
            }

            console.log("Creating partnership user with:", { email, name, lastName, phone, typeUser: "agency" });

            const user = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name,
                    lastName,
                    phone,
                    typeUser: "agency",
                },
            });

            if (!user) {
                return {
                    success: false,
                    status: 400,
                    error: "Impossible de créer l'utilisateur",
                };
            }

            try {
                const { token, expiresAt } = generateRandomVerificationToken();

                // Supprimer les anciens tokens pour cet email
                await db.delete(verifications)
                    .where(eq(verifications.identifier, email));

                // Insérer le nouveau token
                await db.insert(verifications).values({
                    id: randomUUID(),
                    identifier: email,
                    value: token,
                    expiresAt: expiresAt,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                const appUrl = isProduction ? process.env.NEXT_PUBLIC_APP_URL : "http://localhost:3000";
                const agencyVerificationUrl = `${appUrl}/organization/subscription/verify-email?token=${token}`;

                const emailHtml = await render(
                    VerificationAgencyEmail({
                        lastName: lastName,
                        verificationUrl: agencyVerificationUrl,
                    })
                );

                await sendEmail({
                    to: email,
                    subject: "Veuillez vérifier votre adresse email",
                    html: emailHtml,
                });

                console.log("Manual verification email sent successfully");

            } catch (emailError) {
                console.error("Failed to send manual verification email:", emailError);
            }

            return {
                success: true,
                status: 201,
                data: user,
            };

        } catch (error) {
            console.error("Error creating partnership user:", error);
            const errorMessage = error instanceof Error ? error.message : "Erreur inconnue lors de la création du compte";

            return {
                success: false,
                status: 500,
                error: errorMessage,
            };
        }
    }

    /**
     * Verify user email
     */
    static async verifyEmail(token: string) {
        try {
            if (!token) {
                return {
                    success: false,
                    status: 400,
                    error: "TOKEN_IS_REQUIRED - DEBUG",
                };
            }

            // 1. Find the verification token first to get the email (identifier)
            const verificationRecord = await db.query.verifications.findFirst({
                where: eq(verifications.value, token),
            });

            if (!verificationRecord) {
                console.log("Token not found in database. Listing last 5 tokens to debug:");
                const lastTokens = await db.query.verifications.findMany({
                    limit: 5,
                    orderBy: (verifications, { desc }) => [desc(verifications.createdAt)],
                });
                console.log(JSON.stringify(lastTokens, null, 2));

                return {
                    success: false,
                    status: 400,
                    error: "Invalid or expired token",
                };
            }
            console.log("Token found for user:", verificationRecord.identifier);

            if (verificationRecord.expiresAt < new Date()) {
                console.log("Token expired");
                return {
                    success: false,
                    status: 400,
                    error: "Token has expired",
                };
            }

            // 2. Update the user manually (since we generated the token manually)
            await db.update(users)
                .set({
                    isActive: true,
                    emailVerified: true
                })
                .where(eq(users.email, verificationRecord.identifier));

            // 3. Delete the used token
            await db.delete(verifications)
                .where(eq(verifications.value, token));

            return {
                success: true,
                status: 200,
                message: "Email verified successfully"
            };

        } catch (error) {
            return {
                success: false,
                status: 400, // or 500
                message: error instanceof Error ? error.message : "Token validation failed"
            };
        }
    }

    /**
     * Resend verification token
     */
    static async resendToken(input: { token: string }) {
        const { token } = input;
        let email;
        
        try {
            if (!token) {
                return {
                    success: false,
                    status: 400,
                    error: "TOKEN_IS_REQUIRED"
                };
            }

            if (token) {
                // Find the verification token even if expired
                const verificationRecord = await db.query.verifications.findFirst({
                    where: eq(verifications.value, token),
                });

                if (!verificationRecord) {
                    return {
                        success: false,
                        status: 404,
                        error: "TOKEN_NOT_FOUND" // Cannot recover email from invalid token
                    };
                }
                email = verificationRecord.identifier;
            }

            if (!email) {
                return {
                    success: false,
                    status: 400,
                    error: "EMAIL_COULD_NOT_BE_RESOLVED"
                };
            }

            const existingUser = await db.query.users.findFirst({
                where: eq(users.email, email)
            });

            if (!existingUser) {
                return {
                    success: false,
                    status: 404,
                    error: "USER_NOT_FOUND"
                };
            }

            if (existingUser.emailVerified) {
                return {
                    success: false,
                    status: 400,
                    error: "USER_ALREADY_VERIFIED"
                };
            }

            // Generate manual token
            const { token: newToken, expiresAt } = generateRandomVerificationToken();

            // Clear old tokens
            await db.delete(verifications)
                .where(eq(verifications.identifier, email));

            // Insert new token
            await db.insert(verifications).values({
                id: randomUUID(),
                identifier: email,
                value: newToken,
                expiresAt: expiresAt,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const appUrl = isProduction ? process.env.NEXT_PUBLIC_APP_URL : "http://localhost:3000";
            const agencyVerificationUrl = `${appUrl}/organization/subscription/verify-email?token=${newToken}`;

            const emailHtml = await render(
                VerificationAgencyEmail({
                    lastName: existingUser.lastName,
                    verificationUrl: agencyVerificationUrl,
                })
            );

            await sendEmail({
                to: email,
                subject: "Veuillez vérifier votre adresse email",
                html: emailHtml,
            });

            return {
                success: true,
                status: 200,
                message: "Email verification token sent successfully",
                userId: existingUser.id,
                email: existingUser.email
            };

        } catch (error) {
            console.error("Resend token error:", error);
            return {
                success: false,
                status: 500,
                message: error instanceof Error ? error.message : "Unknown error"
            };
        }
    }

    /**
     * Get current user
     */
    static async getMe(headers: Headers) {
        try {
            const session = await auth.api.getSession({
                headers
            });

            if (!session) {
                return {
                    success: false,
                    status: 401,
                    error: "UNAUTHORIZED"
                };
            }

            return {
                success: true,
                status: 200,
                data: session.user
            };

        } catch (error) {
            console.error("Get user error:", error);
            return {
                success: false,
                status: 500,
                error: error instanceof Error ? error.message : "Internal Server Error"
            };
        }
    }

    /**
     * Get user by ID
     */
    static async getById(id: string) {
        try {
            if (!id) {
                return {
                    success: false,
                    status: 400,
                    error: "ID_IS_REQUIRED"
                };
            }

            const user = await db.query.users.findFirst({
                where: eq(users.id, id)
            });

            if (!user) {
                return {
                    success: false,
                    status: 404,
                    error: "USER_NOT_FOUND"
                };
            }

            return {
                success: true,
                status: 200,
                data: user
            };

        } catch (error) {
            console.error("Get user by id error:", error);
            return {
                success: false,
                status: 500,
                error: error instanceof Error ? error.message : "Internal Server Error"
            };
        }
    }
}
