"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";

import * as z from "zod";

import toast from "react-hot-toast";
import { loginSchema, LoginUser } from "@/server/models/user.model";
import { authClient, getErrorMessage } from "@/lib/auth-client";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSocialAuth } from "@/hooks/use-auth.hook";


export function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const redirect = useSearchParams().get("redirect");

    const {
        handleGoogleSignIn,
        handleFacebookSignIn,
        isGoogleLoading,
        isFacebookLoading,
        socialAuthError,
    } = useSocialAuth({
        redirectUrl: redirect ?? "/",
        onError: (error) => setLoginError(error),
    });


    const form = useForm<LoginUser>({
        resolver: async (data) => {
            try {
                await loginSchema.parseAsync(data);

                return { values: data, errors: {} };
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const errors: Record<string, { message: string }> = {};
                    error.issues.forEach((err) => {
                        const path = err.path.join(".");
                        let message = err.message;

                        if (message === "ValidationErrors.invalidEmail") {
                            message = "Adresse email invalide";
                        } else if (message === "ValidationErrors.passwordRequired") {
                            message = "Le mot de passe est requis";
                        }

                        errors[path] = { message };
                    });
                    return { values: {}, errors };
                }
                return { values: {}, errors: {} };
            }
        },
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = async (data: LoginUser) => {
        setIsLoading(true);
        setLoginError(null);

        await authClient.signIn.email(
            {
                email: data.email,
                password: data.password,
                callbackURL: redirect ?? "/",
            },
            {
                onError: (ctx) => {
                    const translatedError = getErrorMessage(ctx.error.code ?? "", "fr");
                    const error = translatedError || ctx.error.message || "Une erreur est survenue lors de la connexion.";
                    setLoginError(error);
                    setIsLoading(false);
                },
                onSuccess: () => {
                    router.push(redirect ?? "/");
                    setIsLoading(false);
                    toast.success("Connexion réussie");
                },
            }
        );
    };



    return (
        <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Connexion</h1>
                <p className="text-muted-foreground">
                    Connectez-vous à votre compte kioskfy.com
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {loginError && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                            {loginError}
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="email"
                                            placeholder="votreemail@exemple.com"
                                            className="pl-10"
                                            autoComplete="email"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mot de passe</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10"
                                            autoComplete="current-password"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center justify-between">
                        <FormField
                            control={form.control}
                            name="rememberMe"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-normal text-muted-foreground cursor-pointer">
                                            Se souvenir de moi
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <Link
                            href="/forgot-password"
                            className="text-sm text-primary hover:underline"
                        >
                            Mot de passe oublié ?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Connexion en cours...
                            </>
                        ) : (
                            "Se connecter"
                        )}
                    </Button>
                </form>
            </Form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Ou continuer avec
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button type="button" onClick={handleGoogleSignIn} variant="outline" disabled={isGoogleLoading}>
                    {isGoogleLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                    )}
                    Google
                </Button>
                <Button type="button" onClick={handleFacebookSignIn} variant="outline" disabled={isFacebookLoading}>
                    {isFacebookLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    )}
                    Facebook
                </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
                Vous n'avez pas de compte ?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                    S'inscrire
                </Link>
            </p>
        </div>
    );
}
