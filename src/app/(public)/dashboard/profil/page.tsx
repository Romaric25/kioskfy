"use client";

import { useAuth } from "@/hooks/use-auth.hook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar, Shield, Camera } from "lucide-react";
import { formatDate } from "@/lib/helpers";

export default function ProfilPage() {
    const { user } = useAuth();

    const userInitials = user?.name
        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

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
                            Votre photo est visible par les autres utilisateurs
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
                        <CardTitle>Informations personnelles</CardTitle>
                        <CardDescription>
                            Mettez à jour vos informations de profil
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Prénom</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="firstName"
                                        defaultValue={user?.name?.split(" ")[0] || ""}
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
                                        defaultValue={(user as any)?.lastName || user?.name?.split(" ").slice(1).join(" ") || ""}
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
                                    defaultValue={user?.email || ""}
                                    className="pl-10"
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    defaultValue={(user as any)?.phone || ""}
                                    className="pl-10"
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Membre depuis {formatDate(user?.createdAt || new Date(), "fr", "MMMM yyyy")}
                            </div>
                            <Button disabled>
                                Modifier le profil
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
