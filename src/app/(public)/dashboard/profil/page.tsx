"use client";

import { useAuth } from "@/hooks/use-auth.hook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Shield, Camera, Loader2, Save, X } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { formatDate } from "@/lib/helpers";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { authClient, getErrorMessage } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { updateProfileSchema } from "@/server/models/user.model";

type ProfileFormValues = z.infer<typeof updateProfileSchema>;

export default function ProfilPage() {
    const { user, refetch } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userInitials = user?.name
        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            name: user?.name || "",
            lastName: (user as any)?.lastName || "",
            image: user?.image || "",
            phone: (user as any)?.phone || "",
            address: (user as any)?.address || "",
        },
    });

    // Réinitialiser le formulaire quand les données utilisateur changent
    const resetForm = () => {
        form.reset({
            name: user?.name || "",
            lastName: (user as any)?.lastName || "",
            image: user?.image || "",
            phone: (user as any)?.phone || "",
            address: (user as any)?.address || "",
        });
        setIsEditing(false);
    };

    const onSubmit = async (data: ProfileFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await authClient.updateUser({
                name: data.name,
                lastName: data.lastName,
                image: data.image || undefined,
                phone: data.phone || undefined,
                address: data.address || undefined,
            } as any);

            if (result.error) {
                const errorMessage = getErrorMessage(result.error.code ?? "", "fr") || result.error.message || "Une erreur est survenue";
                toast.error(errorMessage);
            } else {
                toast.success("Profil mis à jour avec succès");
                await refetch();
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil:", error);
            toast.error("Une erreur est survenue lors de la mise à jour");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <User className="h-8 w-8 text-primary" />
                    Mon profil
                </h1>
                <p className="text-muted-foreground mt-1">
                    Gérez vos informations personnelles
                </p>
            </div>

            <div className="grid gap-6">
                {/* Profile Picture Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Photo de profil</CardTitle>
                        <CardDescription>
                            Votre photo n&apos;est pas visible par les autres utilisateurs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
                                    <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                                        {userInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{user?.name}</h3>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    {user?.emailVerified ? (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                            <Shield className="h-3 w-3 mr-1" />
                                            Email vérifié
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                                            Email non vérifié
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Information Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Informations personnelles</CardTitle>
                                <CardDescription>
                                    Mettez à jour vos informations de profil
                                </CardDescription>
                            </div>
                            {!isEditing && (
                                <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    Modifier
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isEditing ? (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Prénom</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                {...field}
                                                                placeholder="Votre prénom"
                                                                className="pl-10"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nom</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                {...field}
                                                                value={field.value || ""} // Ensure controlled input
                                                                placeholder="Votre nom"
                                                                className="pl-10"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>



                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={user?.email || ""}
                                                className="pl-10 bg-muted"
                                                disabled
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            L&apos;adresse email ne peut pas être modifiée
                                        </p>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Téléphone</FormLabel>
                                                <FormControl>
                                                    <PhoneInput
                                                        {...field}
                                                        defaultCountry="FR"
                                                        placeholder="Entrez votre numéro"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            Membre depuis {formatDate(user?.createdAt || new Date(), "fr", "MMMM yyyy")}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={resetForm}
                                                disabled={isSubmitting}
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Annuler
                                            </Button>
                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Enregistrement...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Enregistrer
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </Form>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Prénom</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="firstName"
                                                value={user?.name?.split(" ")[0] || ""}
                                                className="pl-10"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Nom</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="lastName"
                                                value={(user as any)?.lastName || user?.name?.split(" ").slice(1).join(" ") || ""}
                                                className="pl-10"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={user?.email || ""}
                                            className="pl-10"
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Téléphone</Label>
                                    <PhoneInput
                                        id="phone"
                                        value={(user as any)?.phone || ""}
                                        disabled
                                        defaultCountry="FR"
                                        placeholder="Non renseigné"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        Membre depuis {formatDate(user?.createdAt || new Date(), "fr", "MMMM yyyy")}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
