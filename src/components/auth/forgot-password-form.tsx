"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

const forgotPasswordSchema = z.object({
    email: z.string().email("Adresse email invalide"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordValues) => {
        setIsLoading(true);
        try {
            const { error } = await authClient.requestPasswordReset({
                email: data.email,
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                throw new Error(error.message);
            }

            setIsSubmitted(true);
            toast.success("Si un compte existe, un email a été envoyé.");
        } catch (error: any) {
            console.error(error);
            toast.error("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Email envoyé !</h1>
                </div>
                <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 text-sm">
                    <p className="font-medium mb-1">Vérifiez votre boîte de réception</p>
                    <p>
                        Si un compte est associé à <strong>{form.getValues("email")}</strong>, vous recevrez un lien pour réinitialiser votre mot de passe.
                    </p>
                    <p className="mt-2 text-xs opacity-80">Pensez à vérifier vos spams.</p>
                </div>
                <Button variant="outline" asChild className="w-full">
                    <Link href="/login">Retour à la connexion</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Mot de passe oublié ?</h1>
                <p className="text-muted-foreground text-sm">
                    Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                            placeholder="votre@email.com"
                                            className="pl-10"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Envoyer le lien
                    </Button>
                </form>
            </Form>

            <div className="text-center">
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Retour à la connexion
                </Link>
            </div>
        </div>
    );
}
