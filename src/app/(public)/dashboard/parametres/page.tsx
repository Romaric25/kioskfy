"use client";

import { useAuth } from "@/hooks/use-auth.hook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Bell, Moon, Lock, Trash2, Shield, Languages, Sun, Monitor, Loader2, Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient, getErrorMessage } from "@/lib/auth-client";
import { setUserPassword } from "@/server/actions/user.actions";
import toast from "react-hot-toast";

const getPasswordSchema = (hasPassword: boolean) => z.object({
    currentPassword: hasPassword
        ? z.string().min(1, "Le mot de passe actuel est requis")
        : z.string().optional(),
    newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<ReturnType<typeof getPasswordSchema>>;

export default function ParametresPage() {
    const { user, isLoading } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [newsletter, setNewsletter] = useState(true);
    const { theme, setTheme } = useTheme();
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Check if user has a password (property usually available in better-auth v1.+)
    const [hasPassword, setHasPassword] = useState(true);

    useEffect(() => {
        const checkPassword = async () => {
            try {
                const accounts = await authClient.listAccounts();
                const hasCreds = accounts.data?.some((acc: any) => acc.providerId === "credential" || acc.provider === "credential");
                setHasPassword(!!hasCreds);
            } catch (error) {
                console.error("Failed to check password status", error);
            }
        };
        if (user) {
            checkPassword();
        }
    }, [user]);
    // Password Form
    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(getPasswordSchema(hasPassword)),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const isPasswordSubmitting = passwordForm.formState.isSubmitting;

    // Reset form when dialog opens or user state changes
    useEffect(() => {
        if (isPasswordDialogOpen) {
            passwordForm.reset({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
    }, [isPasswordDialogOpen, passwordForm]);

    const onPasswordSubmit = async (data: PasswordFormValues) => {
        try {
            let result;

            if (hasPassword) {
                // Change existing password
                result = await authClient.changePassword({
                    newPassword: data.newPassword,
                    currentPassword: data.currentPassword!,
                    revokeOtherSessions: true,
                });
            } else {
                // Set password for the first time via Server Action
                // This creates the credential account directly in DB
                await setUserPassword(data.newPassword);
                result = { error: null };
            }

            if (result.error) {
                const errorMessage = getErrorMessage(result.error.code ?? "", "fr") || result.error.message || "Une erreur est survenue";
                toast.error(errorMessage);
            } else {
                toast.success(hasPassword ? "Mot de passe modifié avec succès" : "Mot de passe défini avec succès");
                setIsPasswordDialogOpen(false);
                passwordForm.reset();
            }
        } catch (error) {
            console.error("Erreur lors du changement de mot de passe:", error);
            toast.error("Une erreur est survenue");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Settings className="h-8 w-8 text-primary" />
                    Paramètres
                </h1>
                <p className="text-muted-foreground mt-1">
                    Gérez les paramètres de votre compte
                </p>
            </div>

            <div className="grid gap-6">
                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>
                            Configurez vos préférences de notification
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="notifications">Notifications push</Label>
                                <p className="text-sm text-muted-foreground">
                                    Recevez des notifications pour les nouveaux journaux
                                </p>
                            </div>
                            <Switch
                                id="notifications"
                                checked={notifications}
                                onCheckedChange={setNotifications}
                            />
                        </div>
                        <Separator />
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="newsletter">Newsletter</Label>
                                <p className="text-sm text-muted-foreground">
                                    Recevez notre newsletter hebdomadaire
                                </p>
                            </div>
                            <Switch
                                id="newsletter"
                                checked={newsletter}
                                onCheckedChange={setNewsletter}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Moon className="h-5 w-5" />
                            Apparence
                        </CardTitle>
                        <CardDescription>
                            Personnalisez l&apos;apparence de l&apos;application
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="darkMode">Mode sombre</Label>
                                <p className="text-sm text-muted-foreground">
                                    Basculez entre le mode clair et sombre
                                </p>
                            </div>
                            <Switch
                                id="darkMode"
                                checked={theme === "dark"}
                                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                            />
                        </div>
                        <Separator />
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-0.5">
                                <Label>Thème</Label>
                                <p className="text-sm text-muted-foreground">
                                    Choisissez votre thème préféré
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant={theme === "light" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTheme("light")}
                                    className="gap-1.5"
                                >
                                    <Sun className="h-4 w-4" />
                                    Clair
                                </Button>
                                <Button
                                    variant={theme === "dark" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTheme("dark")}
                                    className="gap-1.5"
                                >
                                    <Moon className="h-4 w-4" />
                                    Sombre
                                </Button>
                                <Button
                                    variant={theme === "system" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTheme("system")}
                                    className="gap-1.5"
                                >
                                    <Monitor className="h-4 w-4" />
                                    Système
                                </Button>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-0.5">
                                <Label className="flex items-center gap-2">
                                    <Languages className="h-4 w-4" />
                                    Langue
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Sélectionnez la langue de l&apos;interface
                                </p>
                            </div>
                            <Button variant="outline" size="sm" disabled>
                                Français
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Sécurité
                        </CardTitle>
                        <CardDescription>
                            Gérez la sécurité de votre compte
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-0.5">
                                <Label className="flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Mot de passe
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {hasPassword ? "Modifiez votre mot de passe" : "Définissez un mot de passe"}
                                </p>
                            </div>

                            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={isLoading}>
                                        {hasPassword ? "Modifier" : "Définir"}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{hasPassword ? "Modifier le mot de passe" : "Définir le mot de passe"}</DialogTitle>
                                        <DialogDescription>
                                            {hasPassword
                                                ? "Entrez votre mot de passe actuel et le nouveau mot de passe."
                                                : "Entrez un nouveau mot de passe pour sécuriser votre compte."}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <Form {...passwordForm}>
                                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                            {hasPassword && (
                                                <FormField
                                                    control={passwordForm.control}
                                                    name="currentPassword"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Mot de passe actuel</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        type={showCurrentPassword ? "text" : "password"}
                                                                        {...field}
                                                                        className="pr-10"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                                                                    >
                                                                        {showCurrentPassword ? (
                                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                                        ) : (
                                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                            <FormField
                                                control={passwordForm.control}
                                                name="newPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nouveau mot de passe</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type={showNewPassword ? "text" : "password"}
                                                                    {...field}
                                                                    className="pr-10"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                    onClick={() => setShowNewPassword((prev) => !prev)}
                                                                >
                                                                    {showNewPassword ? (
                                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                                    ) : (
                                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={passwordForm.control}
                                                name="confirmPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type={showConfirmPassword ? "text" : "password"}
                                                                    {...field}
                                                                    className="pr-10"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                                >
                                                                    {showConfirmPassword ? (
                                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                                    ) : (
                                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <DialogFooter className="pt-4">
                                                <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                                                    Annuler
                                                </Button>
                                                <Button type="submit" disabled={isPasswordSubmitting}>
                                                    {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Enregistrer
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Zone de danger
                        </CardTitle>
                        <CardDescription>
                            Actions irréversibles sur votre compte
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-destructive">Supprimer le compte</Label>
                                <p className="text-sm text-muted-foreground">
                                    Supprimez définitivement votre compte et toutes vos données
                                </p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        Supprimer
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Cette action est irréversible. Votre compte et toutes vos données
                                            seront supprimés définitivement.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                                            Supprimer mon compte
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
