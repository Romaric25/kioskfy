"use client";

import { useAdminOrganization } from "@/hooks/use-organizations.hook";
import { Loader2, Building2, Mail, Phone, MapPin, Globe, FileText, Calendar, ShieldCheck, Newspaper } from "lucide-react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminAccountingManagement } from "@/components/admin/admin-accounting-management";

export default function OrganizationDetailsPage() {
    const params = useParams();
    const id = params?.id as string;

    const { organization, isLoadingOrganization, errorOrganization } = useAdminOrganization(id);

    if (isLoadingOrganization) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (errorOrganization || !organization) {
        return (
            <div className="flex bg-destructive/10 p-4 rounded-md text-destructive">
                Erreur lors du chargement de l'organisation
            </div>
        );
    }

    // Parse metadata safely
    let metadata: any = {};
    try {
        metadata = typeof organization.metadata === 'string'
            ? JSON.parse(organization.metadata)
            : organization.metadata || {};
    } catch (e) {
        console.error("Failed to parse metadata", e);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border rounded-lg">
                        <AvatarImage src={organization.logo || ""} alt={organization.name} />
                        <AvatarFallback className="text-xl font-bold rounded-lg">{organization.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{organization.name}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-sm">ID: {organization.id}</span>
                            <Badge variant="outline" className="ml-2">
                                {metadata.type || "Organisation"}
                            </Badge>
                            {metadata.isActive && <Badge className="bg-green-600">Actif</Badge>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href={`/admin/organizations/${id}/newspapers`}>
                            <Newspaper className="mr-2 h-4 w-4" />
                            Voir les journaux
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="info" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="info">Informations</TabsTrigger>
                    <TabsTrigger value="accounting">Comptabilité</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Informations Générales
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-[auto,1fr] gap-4 items-center">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-sm">
                                        <p className="font-medium">Email</p>
                                        <p className="text-muted-foreground">{organization.email || "-"}</p>
                                    </div>

                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-sm">
                                        <p className="font-medium">Téléphone</p>
                                        <p className="text-muted-foreground">{organization.phone || "-"}</p>
                                    </div>

                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-sm">
                                        <p className="font-medium">Pays</p>
                                        <p className="text-muted-foreground">{organization.country || "-"}</p>
                                    </div>

                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-sm">
                                        <p className="font-medium">Adresse</p>
                                        <p className="text-muted-foreground">{organization.address || "-"}</p>
                                    </div>

                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-sm">
                                        <p className="font-medium">Créé le</p>
                                        <p className="text-muted-foreground">
                                            {new Date(organization.createdAt).toLocaleDateString("fr-FR", {
                                                dateStyle: "long",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5" />
                                    Configuration & Métadonnées
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Description</p>
                                    <p className="text-sm text-muted-foreground border p-3 rounded-md bg-muted/20">
                                        {organization.description || "Aucune description"}
                                    </p>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">Fréquence</p>
                                        <p className="text-sm">{metadata.frequency || "-"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">Langue</p>
                                        <p className="text-sm">{metadata.language || "-"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">Commentaires</p>
                                        <p className="text-sm">{metadata.allowComments ? "Activés" : "Désactivés"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">Publication Auto</p>
                                        <p className="text-sm">{metadata.publishAuto ? "Activée" : "Désactivée"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="accounting">
                    <AdminAccountingManagement organizationId={id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
