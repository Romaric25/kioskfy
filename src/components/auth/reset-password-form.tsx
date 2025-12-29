"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

const resetPasswordSchema = z
    .object({
        password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
    });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: ResetPasswordValues) => {
        if (!token) {
            toast.error("Jeton de réinitialisation manquant ou invalide.");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await authClient.resetPassword({
                newPassword: data.password,
                token: token,
            });

            if (error) {
                toast.error(error.message || "Erreur lors de la réinitialisation");
            } else {
                setIsSuccess(true);
                toast.success("Mot de passe modifié avec succès !");
                setTimeout(() => router.push("/login"), 3000);
            }
        } catch (error) {
            console.error(error);
            toast.error("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    if (errorParam === "token_expired" || errorParam === "invalid_token") {
        return (
            <div className="text-center space-y-4">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    <p className="font-bold">Lien expiré ou invalide</p>
                    <p>Veuillez faire une nouvelle demande de mot de passe oublié.</p>
                </div>
                <Button asChild className="w-full">
                    <Link href="/forgot-password">Nouvelle demande</Link>
                </Button>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mot de passe modifié</h2>
                    <p className="text-gray-500 mt-2">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
                </div>
                <Button asChild className="w-full">
                    <Link href="/login">Se connecter</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Réinitialisation</h1>
                <p className="text-muted-foreground text-sm">
                    Choisissez votre nouveau mot de passe
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nouveau mot de passe</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirmer le mot de passe</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Changer le mot de passe
                    </Button>
                </form>
            </Form>
        </div>
    );
}
