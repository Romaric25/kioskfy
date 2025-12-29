"use client";

import { useAuth } from "@/hooks/use-auth.hook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Bell, Moon, Lock, Trash2, Shield, Languages, Sun, Monitor } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
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

export default function ParametresPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [newsletter, setNewsletter] = useState(true);
    const { theme, setTheme } = useTheme();

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
                        <div className="flex items-center justify-between">
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
                        <div className="flex items-center justify-between">
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
                            Personnalisez l'apparence de l'application
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
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
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Thème</Label>
                                <p className="text-sm text-muted-foreground">
                                    Choisissez votre thème préféré
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
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
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="flex items-center gap-2">
                                    <Languages className="h-4 w-4" />
                                    Langue
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Sélectionnez la langue de l'interface
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
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Mot de passe
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Modifiez votre mot de passe
                                </p>
                            </div>
                            <Button variant="outline" size="sm" disabled>
                                Modifier
                            </Button>
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
                        <div className="flex items-center justify-between">
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
