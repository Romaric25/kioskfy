"use client"

import { useEffect, useState } from "react"
import { useSettings } from "@/hooks/use-settings.hook"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, RotateCcw } from "lucide-react"
import { SiteBreadcrumb } from "@/components/site-breadcrumb"
import { toast } from "react-hot-toast"

export default function SettingsPage() {
    const { settings, isLoading, updateSettings, isUpdating, seedSettings, isSeeding } = useSettings()
    const [formData, setFormData] = useState<Record<string, any>>({})

    // Mettre à jour le state local quand les settings sont chargés
    useEffect(() => {
        if (settings) {
            const initialData = Object.entries(settings).reduce((acc, [key, item]) => {
                acc[key] = item.value
                return acc
            }, {} as Record<string, any>)
            setFormData(initialData)
        }
    }, [settings])

    const handleInputChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        try {
            await updateSettings(formData)
            toast.success("Paramètres enregistrés avec succès")
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement")
        }
    }

    const handleSeed = async () => {
        try {
            await seedSettings()
            toast.success("Paramètres initialisés")
        } catch (error) {
            toast.error("Erreur d'initialisation")
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Grouper les settings par 'group'
    const groups: Record<string, any[]> = {}
    if (settings) {
        Object.values(settings).forEach((setting) => {
            if (!groups[setting.group]) groups[setting.group] = []
            groups[setting.group].push(setting)
        })
    }

    const hasSettings = settings && Object.keys(settings).length > 0

    return (
        <div className="flex flex-col gap-6">
            <SiteBreadcrumb />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Paramètres du site</h1>
                    <p className="text-muted-foreground">
                        Gérez la configuration globale de votre application.
                    </p>
                </div>
                <div className="flex gap-2">
                    {!hasSettings && (
                        <Button variant="outline" onClick={handleSeed} disabled={isSeeding}>
                            {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Initialiser par défaut
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={isUpdating || !hasSettings}>
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Enregistrer les modifications
                    </Button>
                </div>
            </div>

            {!hasSettings ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="mb-4 text-muted-foreground">Aucun paramètre trouvé. Initialisez la configuration par défaut.</p>
                        <Button onClick={handleSeed} disabled={isSeeding}>
                            Initialiser maintenant
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="w-full justify-start overflow-x-auto">
                        <TabsTrigger value="general">Général</TabsTrigger>
                        <TabsTrigger value="seo">SEO & Métadonnées</TabsTrigger>
                        <TabsTrigger value="social">Réseaux Sociaux</TabsTrigger>
                        <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                        {Object.keys(groups).filter(g => !['general', 'seo', 'social', 'maintenance'].includes(g)).map(group => (
                            <TabsTrigger key={group} value={group} className="capitalize">{group}</TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Contenu des onglets */}
                    {Object.entries(groups).map(([groupName, groupSettings]) => (
                        <TabsContent key={groupName} value={groupName}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="capitalize">{groupName === 'seo' ? 'SEO' : groupName === 'social' ? 'Réseaux Sociaux' : groupName}</CardTitle>
                                    <CardDescription>
                                        Configuration des paramètres {groupName}.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {groupSettings.map((setting) => (
                                        <div key={setting.key} className="grid w-full items-center gap-1.5">
                                            {setting.type === 'boolean' ? (
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id={setting.key}
                                                        checked={formData[setting.key] ?? false}
                                                        onCheckedChange={(checked) => handleInputChange(setting.key, checked)}
                                                    />
                                                    <div className="grid gap-1.5 leading-none">
                                                        <Label htmlFor={setting.key}>
                                                            {setting.label || setting.key}
                                                        </Label>
                                                        {setting.description && (
                                                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Label htmlFor={setting.key}>{setting.label || setting.key}</Label>
                                                    <Input
                                                        id={setting.key}
                                                        value={formData[setting.key] ?? ""}
                                                        onChange={(e) => handleInputChange(setting.key, e.target.value)}
                                                        placeholder={`Entrez ${setting.label?.toLowerCase()}`}
                                                    />
                                                    {setting.description && (
                                                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}

                    {/* Fallbacks pour les onglets vides si le seed n'a pas tout rempli */}
                    {!groups['general'] && <TabsContent value="general"><div className="p-4 text-muted-foreground">Aucun paramètre général.</div></TabsContent>}
                    {!groups['seo'] && <TabsContent value="seo"><div className="p-4 text-muted-foreground">Aucun paramètre SEO.</div></TabsContent>}
                    {!groups['social'] && <TabsContent value="social"><div className="p-4 text-muted-foreground">Aucun paramètre social.</div></TabsContent>}
                </Tabs>
            )}
        </div>
    )
}
