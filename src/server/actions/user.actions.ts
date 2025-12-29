"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { accounts } from "@/db/auth-schema";
import { eq, and } from "drizzle-orm";
import { hashPassword } from "@/lib/argon2";
import { headers } from "next/headers";

export async function setUserPassword(password: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Non autorisé");
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    const hashedPassword = await hashPassword(password);

    // Check if credential account exists
    const [existingAccount] = await db
        .select()
        .from(accounts)
        .where(
            and(
                eq(accounts.userId, userId),
                eq(accounts.providerId, "credential")
            )
        )
        .limit(1);

    if (existingAccount) {
        // Update existing
        await db
            .update(accounts)
            .set({
                password: hashedPassword,
                updatedAt: new Date()
            })
            .where(eq(accounts.id, existingAccount.id));
    } else {
        // Create new
        await db.insert(accounts).values({
            id: crypto.randomUUID(),
            userId: userId,
            accountId: userEmail,
            providerId: "credential",
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    return { success: true };
}
