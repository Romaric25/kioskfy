import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { ac, admin, editor, member, owner, superadmin, user as userRole } from "@/lib/permissions";
import { emailOTP, openAPI, organization, admin as adminPlugin } from "better-auth/plugins";
import { users as userTable } from "@/db/auth-schema";
import { eq } from "drizzle-orm";
import { nextCookies } from "better-auth/next-js";
import { hashPassword, verifyPassword } from "./argon2";
import { sendEmail } from "./email";
import WelcomeAgencyEmail from "@/emails/WelcomeAgencyEmail";
import { render } from "@react-email/components";
import VerificationAgencyEmail from "@/emails/VerificationAgencyEmail";
import VerificationClientEmail from "@/emails/VerificationClientEmail";

const isProduction = process.env.NODE_ENV === 'production';
export const auth = betterAuth({
    baseURL: isProduction ? process.env.NEXT_PUBLIC_APP_URL : "http://localhost:3000",
    basePath: '/api/auth',
    database: drizzleAdapter(db, {
        provider: "mysql",
    }),
    rateLimit: {
        enabled: true,
        storage: 'database',
        window: 10, // time window in seconds
        max: 50, // max requests in the window
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }) => {
            const extendedUser = user as typeof userTable.$inferSelect;
            const isAgency = extendedUser.typeUser === 'agency';
            const agencyVerificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/organization/subscription/verify-email?token=${token}`;
            const clientVerificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
            const emailHtml = await render(
                isAgency ?
                    VerificationAgencyEmail({
                        lastName: extendedUser.lastName,
                        verificationUrl: agencyVerificationUrl,
                    }) :
                    VerificationClientEmail({
                        lastName: extendedUser.lastName,
                        verificationUrl: clientVerificationUrl,
                    })
            );
            void sendEmail({
                to: user.email,
                subject: "Veuillez vérifier votre adresse email",
                html: emailHtml,
            })
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        //requireEmailVerification: true,
        password: {
            hash: hashPassword,
            verify: verifyPassword,
        },
    },
    user: {
        modelName: 'users',
        additionalFields: {
            phone: {
                type: 'string',
                required: true,
                unique: true,
                input: true,
            },
            lastName: {
                type: 'string',
                required: true,
                input: true,
            },
            role: {
                type: 'string',
                required: false,
                input: true,
            },
            isActive: {
                type: 'boolean',
                required: false,
                defaultValue: false,
            },
            typeUser: {
                type: 'string',
                required: false,
                defaultValue: 'client',
                input: true,
            },
            address: {
                type: 'string',
                required: false,
            },

        },
        changeEmail: {
            enabled: true,
        },
    },
    session: {
        modelName: 'sessions',
    },
    account: {
        modelName: 'accounts',
        accountLinking: {
            enabled: true,
            trustedProviders: ['facebook', 'google'],
        },
    },
    verification: {
        modelName: 'verifications',
    },
    // Add any additional Better Auth configuration here
    // plugins: [],
    plugins: [
        openAPI(),
        nextCookies(),
        organization({
            teams: {
                enabled: true,
            },
            ac,
            roles: {
                owner,
                admin,
                member,
                editor,
            },
            schema: {
                organization: {
                    modelName: 'organizations',
                    additionalFields: {
                        email: {
                            type: 'string',
                            required: false,
                            unique: true,
                            input: true,
                        },
                        phone: {
                            type: 'string',
                            required: true,
                            unique: true,
                            input: true,
                        },
                        country: {
                            type: 'string',
                            required: true,
                            input: true,
                        },
                        price: {
                            type: 'number',
                            required: false,
                            input: true,
                        },
                        address: {
                            type: 'string',
                            required: true,
                            input: true,
                        },
                        description: {
                            type: 'string',
                            required: true,
                            input: true,
                        },
                        logoUploadId: {
                            type: 'number',
                            required: false,
                            input: true,
                        },
                    },
                },
                team: {
                    modelName: 'teams',
                },
                teamMember: {
                    modelName: 'team_members',
                },
                member: {
                    modelName: 'members',
                },
                invitation: {
                    modelName: 'invitations',
                },
            },
            organizationHooks: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                beforeCreateOrganization: async ({ organization }) => {
                    /* return {
                      data: {
                        ...organization,
                        metadata: {
                          //customField: "value",
                        },
                      },
                    }*/
                },
            },
            allowUserToCreateOrganization: async (authUser) => {
                const [fullUser] = await db
                    .select()
                    .from(userTable)
                    .where(eq(userTable.id, authUser.id))
                    .limit(1);

                if (!fullUser) {
                    return false;
                }

                if (!fullUser.isActive) {
                    return false;
                }

                return fullUser.typeUser === 'agency';
            },
            dynamicAccessControl: {
                enabled: true,
            },
            requireEmailVerificationOnInvitation: true,
        }),
        adminPlugin({
            adminRoles: ['admin', 'superadmin'],
            defaultRole: 'user',
            defaultBanReason: 'Spamming',
            bannedUserMessage: 'Vous avez été banni pour de cette application',
            ac,
            roles: {
                admin,
                user: userRole,
                superadmin,
                owner,
                member,
            },
        }),
        emailOTP({
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
            async sendVerificationOTP({ email, otp, type }) {
                if (type === 'sign-in') {
                    // Send the OTP for sign in
                    // TODO: Implement email sending logic using email and otp
                } else if (type === 'email-verification') {
                    // Send the OTP for email verification
                    // TODO: Implement email sending logic using email and otp
                } else {
                    // Send the OTP for password reset
                    // TODO: Implement email sending logic using email and otp
                }
            },
        }),
    ],
});

// Type exports for use in other parts of the application
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;