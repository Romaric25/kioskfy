"use client"

import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Shield,
    CheckCircle,
    XCircle,
    Loader2,
    User as UserIcon,
    Monitor,
    Smartphone,
    Globe,
    Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useUser, useUserSessions, useRevokeUserSession, useGeoIP } from "@/hooks/use-users.hook"
import toast from "react-hot-toast"
import { useMemo } from "react"

export default function UserProfilePage() {
    const params = useParams()
    const router = useRouter()
    const userId = params.id as string

    const { user, isLoading, error } = useUser(userId)
    const { sessions, isLoading: isLoadingSessions, refetch: refetchSessions } = useUserSessions(userId)
    const { revokeSession, isRevokingSession } = useRevokeUserSession({
        onSuccess: () => {
            toast.success("Session révoquée avec succès")
            refetchSessions()
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    // Extraire les IPs uniques pour la géolocalisation
    const uniqueIPs = useMemo(() => {
        if (!sessions) return []
        return [...new Set(sessions.map(s => s.ipAddress).filter((ip): ip is string => !!ip))]
    }, [sessions])

    const { geoData } = useGeoIP(uniqueIPs)

    // Helper function to parse user agent
    const parseUserAgent = (userAgent?: string | null) => {
        if (!userAgent) return { device: "Inconnu", browser: "Inconnu" }

        const isMobile = /mobile|android|iphone|ipad/i.test(userAgent)
        const isTablet = /tablet|ipad/i.test(userAgent)

        let browser = "Navigateur"
        if (userAgent.includes("Chrome")) browser = "Chrome"
        else if (userAgent.includes("Firefox")) browser = "Firefox"
        else if (userAgent.includes("Safari")) browser = "Safari"
        else if (userAgent.includes("Edge")) browser = "Edge"

        let device = "Ordinateur"
        if (isMobile && !isTablet) device = "Mobile"
        else if (isTablet) device = "Tablette"

        return { device, browser }
    }

    // Helper to get device icon
    const getDeviceIcon = (userAgent?: string | null) => {
        if (!userAgent) return <Monitor className="h-4 w-4" />
        if (/mobile|android|iphone/i.test(userAgent)) return <Smartphone className="h-4 w-4" />
        return <Monitor className="h-4 w-4" />
    }

    const getRoleBadgeVariant = (role?: string | null) => {
        switch (role) {
            case "superadmin":
                return "destructive"
            case "admin":
                return "default"
            case "moderator":
                return "secondary"
            default:
                return "outline"
        }
    }

    const getRoleLabel = (role?: string | null) => {
        switch (role) {
            case "superadmin":
                return "Super Admin"
            case "admin":
                return "Administrateur"
            case "moderator":
                return "Modérateur"
            default:
                return "Utilisateur"
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">Utilisateur non trouvé</p>
                        <p className="text-sm text-muted-foreground">
                            L'utilisateur demandé n'existe pas ou a été supprimé.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Profil utilisateur</h2>
                    <p className="text-muted-foreground">
                        Détails et informations de l'utilisateur
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="md:col-span-1">
                    <CardHeader className="text-center">
                        <Avatar className="h-24 w-24 mx-auto mb-4">
                            <AvatarImage src={user.image || ""} alt={user.name} />
                            <AvatarFallback className="text-2xl">
                                {(user.name?.slice(0, 1) || "") + (user.lastName?.slice(0, 1) || "").toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-xl">
                            {user.name} {user.lastName}
                        </CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                        <div className="flex justify-center gap-2 mt-2">
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                                <Shield className="mr-1 h-3 w-3" />
                                {getRoleLabel(user.role)}
                            </Badge>
                            {user.typeUser && (
                                <Badge variant="outline">
                                    <UserIcon className="mr-1 h-3 w-3" />
                                    {user.typeUser}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center gap-2">
                            {user.emailVerified ? (
                                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Email vérifié
                                </Badge>
                            ) : (
                                <Badge variant="destructive">
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Email non vérifié
                                </Badge>
                            )}
                            {user.isActive !== undefined && (
                                user.isActive ? (
                                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                        Actif
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        Inactif
                                    </Badge>
                                )
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Details Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Informations détaillées</CardTitle>
                        <CardDescription>
                            Toutes les informations disponibles sur cet utilisateur
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Contact Information */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                Coordonnées
                            </h4>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Mail className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Phone className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Téléphone</p>
                                        <p className="font-medium">{user.phone || "Non renseigné"}</p>
                                    </div>
                                </div>
                                {user.address && (
                                    <div className="flex items-center gap-3 sm:col-span-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <MapPin className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Adresse</p>
                                            <p className="font-medium">{user.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Dates */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                Historique
                            </h4>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date d'inscription</p>
                                        <p className="font-medium">
                                            {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Dernière mise à jour</p>
                                        <p className="font-medium">
                                            {new Date(user.updatedAt).toLocaleDateString("fr-FR", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* ID */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                Identifiant
                            </h4>
                            <code className="relative rounded bg-muted px-3 py-2 font-mono text-sm">
                                {user.id}
                            </code>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sessions Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Sessions actives
                    </CardTitle>
                    <CardDescription>
                        Liste des sessions actuellement actives pour cet utilisateur
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingSessions ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : sessions && sessions.length > 0 ? (
                        <div className="space-y-4">
                            {sessions.map((session) => {
                                const { device, browser } = parseUserAgent(session.userAgent)
                                const isExpired = new Date(session.expiresAt) < new Date()

                                return (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                {getDeviceIcon(session.userAgent)}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{device}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {browser}
                                                    </Badge>
                                                    {isExpired && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            Expirée
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    {session.ipAddress && (
                                                        <span className="flex items-center gap-1">
                                                            {geoData?.[session.ipAddress] ? (
                                                                <>
                                                                    <span className="text-base">{geoData[session.ipAddress]?.flag}</span>
                                                                    <span>{geoData[session.ipAddress]?.country || session.ipAddress}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Globe className="h-3 w-3" />
                                                                    {session.ipAddress}
                                                                </>
                                                            )}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Expire le {new Date(session.expiresAt).toLocaleDateString("fr-FR", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric"
                                                        })}
                                                    </span>
                                                    {session.updatedAt && (
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground/70" title="Dernière interaction">
                                                            (Actif {new Date(session.updatedAt).toLocaleDateString("fr-FR", {
                                                                day: "numeric",
                                                                month: "short",
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => revokeSession(session.token)}
                                            disabled={isRevokingSession}
                                        >
                                            {isRevokingSession ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Globe className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-sm text-muted-foreground">
                                Aucune session active pour cet utilisateur
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
