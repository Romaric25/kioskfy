import { auth } from "@/lib/auth";
import type { PartnershipRegisterUser } from "@/server/models/user.model";
import { db } from "@/lib/db";
import { users, verifications } from "@/db/auth-schema";
import { eq } from "drizzle-orm";

export class UsersController {
    /**
     * Create a new partnership user (Agency)
     */
    static async createPartnership(input: PartnershipRegisterUser) {
        try {
            const { email, password, name, lastName, phone, typeUser } = input;

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
                    error: "TOKEN_IS_REQUIRED",
                };
            }

            // 1. Find the verification token first to get the email (identifier)
            const verificationRecord = await db.query.verifications.findFirst({
                where: eq(verifications.value, token),
            });

            if (!verificationRecord) {
                return {
                    success: false,
                    status: 400,
                    error: "Invalid or expired token",
                };
            }

            // 2. Verify the email using Better Auth (this consumes/deletes the token)
            const result = await auth.api.verifyEmail({
                query: {
                    token
                }
            });

            if (result && "status" in result && !result.status) {
                return {
                    success: false,
                    status: 400,
                    error: "Invalid or expired token",
                };
            }

            // 3. Update the user's isActive status
            // We use the identifier (email) from the token record we found before verification
            await db.update(users)
                .set({ isActive: true })
                .where(eq(users.email, verificationRecord.identifier));

            return {
                success: true,
                status: 200,
                message: "Email verified successfully"
            };

        } catch (error) {
            console.error("Email verification error:", error);
            // Better-auth returns specific errors usually thrown.
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
    static async resendToken(email: string) {
        try {
            if (!email) {
                return {
                    success: false,
                    status: 400,
                    error: "EMAIL_IS_REQUIRED"
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

            // Send verification email using better-auth
            await auth.api.sendVerificationEmail({
                body: {
                    email
                }
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
