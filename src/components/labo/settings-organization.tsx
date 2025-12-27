"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { mapCategoriesToIds } from "@/lib/helpers";
import { parseMetadata } from "@/lib/parse-metadata";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { PhoneInput } from "@/components/ui/phone-input";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Building2,
  Users,
  Bell,
  Shield,
  CreditCard,
  Save,
  Trash2,
  AlertTriangle,
  X,
  Check,
  ChevronsUpDown,
} from "lucide-react";

import { useCountries } from "@/hooks/use-countries.hook";
import { useCategories } from "@/hooks/use-categories.hook";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn, getCategoryIcon } from "@/lib/utils";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Teams } from "./teams";
import {
  organizationSettingsSchema,
  type OrganizationSettings,
  PublicationFrequency,
  PublicationLanguage,
  PublicationType,
} from "@/server/models/organization.model";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { priceFormatter, getCurrencySymbol } from "@/lib/helpers";
import { SettingsOrganizationSkeleton } from "./skeleton/settings-organization-skeleton";
import { useDeleteOrganization, useOrganization, useUpdateOrganization } from "@/hooks/use-organizations.hook";
import { useSelectedOrganizationStore } from "@/stores/use-selected-organization.store";
import { useGetCountryByName } from "@/hooks/use-get-country-by-name.hook";
import { UploadFile } from "@/components/upload-file";

export const SettingsOrganization = () => {
  const { slug } = useParams();
  const { selectedOrganizationId, clearSelectedOrganization } =
    useSelectedOrganizationStore();
  const {
    deleteOrganization,
    isDeletingOrganization,
    isDeletingOrganizationSuccess,
  } = useDeleteOrganization();
  const { updateOrganization, isUpdatingOrganization } = useUpdateOrganization();
  const [activeTab, setActiveTab] = useState("general");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [logoFiles, setLogoFiles] = useState<any[]>([]);
  const { organization, isLoadingOrganization } = useOrganization();
  const { countries, countriesLoading } = useCountries();
  const { categories: availableCategories, categoriesLoading } =
    useCategories();
  const router = useRouter();


  const activeOrganization = organization?.data;
  const orgCountry = (activeOrganization as { country?: string })?.country || "";
  const { country } = useGetCountryByName(orgCountry);
  const code = country?.code;
  const currency = country?.currency;
  const metadata = useMemo(
    () => parseMetadata(activeOrganization?.metadata),
    [activeOrganization?.metadata]
  );
  const currencySymbol = useMemo(
    () => currency ? getCurrencySymbol(currency, code || 'fr-FR') : 'XOF',
    [currency, code]
  );

  const isLogoDirty = useMemo(() => {
    const hasInitialLogo = !!activeOrganization?.logo;
    const hasCurrentLogo = logoFiles.length > 0;

    // If mismatch in presence
    if (hasInitialLogo !== hasCurrentLogo) return true;

    // If both have logo, check if it's the same 'current' one
    if (hasCurrentLogo && logoFiles[0].id !== 'current') return true;

    return false;
  }, [logoFiles, activeOrganization]);

  const form = useForm<OrganizationSettings>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(organizationSettingsSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      price: undefined,
      country: "",
      categories: [],
      frequency: undefined,
      language: undefined,
      type: undefined,
      isActive: false,
      allowComments: false,
      publishAuto: true,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
  });

  useEffect(() => {
    if (
      activeOrganization &&
      countries &&
      countries?.data?.length > 0 &&
      availableCategories
    ) {
      const rawCategories = (metadata?.categories as (string | number)[]) || [];
      const categories = mapCategoriesToIds(rawCategories, availableCategories);

      form.reset({
        name: activeOrganization.name || "",
        description:
          (activeOrganization as { description?: string }).description || "",
        email: (activeOrganization as { email?: string }).email || "",
        phone: (activeOrganization as { phone?: string }).phone || "",
        address: (activeOrganization as { address?: string }).address || "",
        price: (activeOrganization as { price?: number }).price ?? undefined,
        country: (activeOrganization as { country?: string }).country || "",
        categories: categories,
        frequency: (metadata?.frequency as PublicationFrequency) || undefined,
        language: (metadata?.language as PublicationLanguage) || undefined,
        type: (metadata?.type as PublicationType) || undefined,
        isActive: (metadata?.isActive as boolean) ?? false,
        allowComments: (metadata?.allowComments as boolean) || false,
        publishAuto: (metadata?.publishAuto as boolean) ?? true,
        emailNotifications: (metadata?.emailNotifications as boolean) ?? true,
        smsNotifications: (metadata?.smsNotifications as boolean) || false,
        pushNotifications: (metadata?.pushNotifications as boolean) ?? true,
      });

      // Init logo
      if (activeOrganization.logo) {
        setLogoFiles([{
          id: 'current',
          preview: activeOrganization?.logo,
          file: { name: 'Logo actuel', type: 'image/*' }
        }]);
      }
    }
  }, [activeOrganization, metadata, countries, availableCategories, form]);

  useEffect(() => {
    if (isDeletingOrganizationSuccess) {
      clearSelectedOrganization();
      setIsDeleteDialogOpen(false);
      setDeleteConfirmation("");
      router.push("/dashboard");
    }
  }, [isDeletingOrganizationSuccess, clearSelectedOrganization, router]);

  // Removed custom handlers handleLogoChange and handleRemoveLogo as UploadFile handles this

  const onSubmit = async (values: OrganizationSettings): Promise<void> => {
    try {
      const organizationData = {
        name: values.name,
        description: values.description,
        email: values.email,
        phone: values.phone,
        address: values.address,
        price: values.price,
        country: values.country,
        // Logo handling
        ...((logoFiles.length > 0 && typeof logoFiles[0].id === 'number') ? { logoUploadId: logoFiles[0].id } : {}),
        metadata: {
          categories: values.categories,
          frequency: values.frequency,
          language: values.language,
          type: values.type,
          isActive: values.isActive,
          allowComments: values.allowComments,
          publishAuto: values.publishAuto,
          emailNotifications: values.emailNotifications,
          smsNotifications: values.smsNotifications,
          pushNotifications: values.pushNotifications,
        },
      };
      await updateOrganization({
        id: activeOrganization?.id as string,
        data: organizationData,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erreur lors de l'enregistrement des paramètres");
    }
  };

  // Conditional return AFTER all hooks have been called
  if (!selectedOrganizationId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucune agence sélectionnée</h3>
          <p className="text-muted-foreground">Veuillez sélectionner une agence pour gérer ses paramètres.</p>
        </div>
      </div>
    );
  }

  // Loading state with skeleton
  if (isLoadingOrganization || countriesLoading) {
    return <SettingsOrganizationSkeleton />;
  }

  const handleDeleteOrganization = async () => {
    if (deleteConfirmation !== activeOrganization?.name) {
      return;
    }
    try {
      // TODO: Implémenter la suppression de l'organisation
      deleteOrganization({ id: activeOrganization?.id });
    } catch (error) {
      console.error("Error deleting organization:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Paramètres de l'agence
            </h2>
            <p className="text-muted-foreground">Gérer les paramètres et préférences de l'agence</p>
          </div>
          <div className="flex items-center space-x-2">
            {(form.formState.isDirty || isLogoDirty) && (
              <Badge
                variant="outline"
                className="text-orange-600 border-orange-600"
              >
                Modifications non enregistrées
              </Badge>
            )}
            <Button
              type="submit"
              disabled={
                (!form.formState.isDirty && !isLogoDirty) ||
                isUpdatingOrganization
              }
              className="min-w-[100px]"
            >
              {isUpdatingOrganization ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab || "general"}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Général
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Équipe
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Facturation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres généraux</CardTitle>
                <CardDescription>Informations de l'agence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Identity Section */}
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0">
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Logo</Label>
                      <div className="w-64">
                        <UploadFile
                          fieldName="logo"
                          value={logoFiles}
                          onChange={setLogoFiles}
                          maxFiles={1}
                          maxSizeMB={10}
                          presignedUpload={true}
                          labels={{
                            dropzone: "Déposer",
                            uploadButton: "Sélectionner",
                            addMoreButton: "Changer",
                            filesUploaded: "Aperçu",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="grid gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de l'agence <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex : E-Press Afrique"
                                className="h-10"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Le nom public qui apparaîtra sur votre profil
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Décrivez votre activité, votre ligne éditoriale..."
                                className="min-h-[140px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Description de l'agence
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Coordonnées
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email professionnel <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="contact@agence.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <PhoneInput
                              placeholder="+228 00 00 00 00"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Rue Exemple, Quartier, Ville"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Localization & Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Localisation & Offre</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }: { field: ControllerRenderProps<OrganizationSettings, "country"> }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Pays d'origine <span className="text-red-500">*</span></FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    <div className="flex items-center gap-2">
                                      {countries?.data?.find(
                                        (c) => c.name === field.value
                                      )?.flag && (
                                          <Image
                                            src={
                                              countries?.data?.find(
                                                (c) => c.name === field.value
                                              )!.flag
                                            }
                                            alt={field.value}
                                            width={20}
                                            height={15}
                                            className="rounded-sm shadow-sm"
                                          />
                                        )}
                                      <span className="truncate">
                                        {field.value}
                                      </span>
                                    </div>
                                  ) : (
                                    "Sélectionner un pays"
                                  )}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[300px] p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Rechercher un pays..."
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    Aucun pays trouvé.
                                  </CommandEmpty>
                                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                                    {countries?.data?.map((countryItem) => (
                                      <CommandItem
                                        key={countryItem.id}
                                        value={countryItem.name}
                                        onSelect={() => {
                                          field.onChange(countryItem.name);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value === countryItem.name
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        <Image
                                          src={countryItem.flag}
                                          alt={countryItem.name}
                                          width={20}
                                          height={15}
                                          className="mr-2 rounded-sm"
                                        />
                                        {countryItem.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix unitaire (FCFA) <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                className="pr-12"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                              <div className="absolute right-3 top-2.5 text-sm text-muted-foreground font-medium">
                                {currencySymbol}
                              </div>
                            </div>
                          </FormControl>
                          {field.value && currency && code && (
                            <FormDescription>
                              Affichage :{" "}
                              {priceFormatter(
                                Number(field.value),
                                currency,
                                code
                              )}
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="categories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catégories couvertes <span className="text-red-500">*</span></FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between min-h-[44px] h-auto",
                                    !field.value?.length &&
                                    "text-muted-foreground"
                                  )}
                                >
                                  {field.value?.length &&
                                    field.value.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 py-1">
                                      {field.value.map((val) => {
                                        const category =
                                          availableCategories?.find(
                                            (c) => c.id === val
                                          );
                                        return category ? (
                                          <Badge
                                            variant="secondary"
                                            className="mr-1"
                                            key={val}
                                          >
                                            {category.name}
                                          </Badge>
                                        ) : null;
                                      })}
                                    </div>
                                  ) : (
                                    "Sélectionner des catégories"
                                  )}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[400px] p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Rechercher une catégorie..."
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    Aucune catégorie trouvée.
                                  </CommandEmpty>
                                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                                    {availableCategories?.map((category) => (
                                      <CommandItem
                                        key={category.id}
                                        value={category.name}
                                        onSelect={() => {
                                          const currentValue =
                                            field.value || [];
                                          const isSelected =
                                            currentValue.includes(category.id);
                                          if (isSelected) {
                                            field.onChange(
                                              currentValue.filter(
                                                (v) => v !== category.id
                                              )
                                            );
                                          } else {
                                            field.onChange([
                                              ...currentValue,
                                              category.id,
                                            ]);
                                          }
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value?.includes(category.id)
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {category.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {field.value &&
                              field.value.length > 0 &&
                              field.value.map((categoryId) => {
                                const category = availableCategories?.find(
                                  (c) => c.id === categoryId
                                );
                                if (!category) return null;
                                return (
                                  <Badge
                                    key={categoryId}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-secondary hover:text-secondary-foreground transition-colors pl-2 pr-1 py-1"
                                    onClick={() => {
                                      field.onChange(
                                        field.value?.filter(
                                          (v) => v !== categoryId
                                        ) || []
                                      );
                                    }}
                                  >
                                    {category.name}
                                    <X className="ml-1 h-3 w-3" />
                                  </Badge>
                                );
                              })}
                          </div>
                          <FormDescription>
                            Ces catégories aideront les lecteurs à trouver vos publications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fréquence de publication <span className="text-red-500">*</span></FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? [
                                      {
                                        value: PublicationFrequency.DAILY,
                                        label: "Quotidien",
                                      },
                                      {
                                        value: PublicationFrequency.WEEKLY,
                                        label: "Hebdomadaire",
                                      },
                                      {
                                        value: PublicationFrequency.BI_WEEKLY,
                                        label: "Bi-hebdomadaire",
                                      },
                                      {
                                        value:
                                          PublicationFrequency.THREE_WEEKLY,
                                        label: "Tri-hebdomadaire",
                                      },
                                      {
                                        value: PublicationFrequency.MONTHLY,
                                        label: "Mensuel",
                                      },
                                      {
                                        value: PublicationFrequency.QUARTERLY,
                                        label: "Trimestriel",
                                      },
                                      {
                                        value: PublicationFrequency.YEARLY,
                                        label: "Annuel",
                                      },
                                    ].find((f) => f.value === field.value)
                                      ?.label
                                    : "Sélectionner une fréquence"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[300px] p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Rechercher une fréquence..."
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    Aucune fréquence trouvée.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {[
                                      {
                                        value: PublicationFrequency.DAILY,
                                        label: "Quotidien",
                                      },
                                      {
                                        value: PublicationFrequency.WEEKLY,
                                        label: "Hebdomadaire",
                                      },
                                      {
                                        value: PublicationFrequency.BI_WEEKLY,
                                        label: "Bi-hebdomadaire",
                                      },
                                      {
                                        value: PublicationFrequency.MONTHLY,
                                        label: "Mensuel",
                                      },
                                      {
                                        value: PublicationFrequency.QUARTERLY,
                                        label: "Trimestriel",
                                      },
                                      {
                                        value: PublicationFrequency.YEARLY,
                                        label: "Annuel",
                                      },
                                    ].map((freq) => (
                                      <CommandItem
                                        key={freq.value}
                                        value={freq.label}
                                        onSelect={() => {
                                          field.onChange(freq.value);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value === freq.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {freq.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            À quelle fréquence publiez-vous du contenu ?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Langue de publication <span className="text-red-500">*</span></FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? Object.values(PublicationLanguage).find(
                                      (l) => l === field.value
                                    )
                                    : "Sélectionner une langue"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[300px] p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Rechercher une langue..."
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    Aucune langue trouvée.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {Object.values(PublicationLanguage).map(
                                      (lang) => (
                                        <CommandItem
                                          key={lang}
                                          value={lang}
                                          onSelect={() => {
                                            field.onChange(lang);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === lang
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {lang}
                                        </CommandItem>
                                      )
                                    )}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Langue principale de vos publications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Type de publication <span className="text-red-500">*</span></FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? Object.values(PublicationType).find(
                                      (t) => t === field.value
                                    )
                                    : "Sélectionner un type"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[300px] p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput placeholder="Rechercher un type..." />
                                <CommandList>
                                  <CommandEmpty>
                                    Aucun type trouvé.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {Object.values(PublicationType).map(
                                      (type) => (
                                        <CommandItem
                                          key={type}
                                          value={type}
                                          onSelect={() => {
                                            field.onChange(type);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === type
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {type}
                                        </CommandItem>
                                      )
                                    )}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Format principal de vos publications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres de l'agence</CardTitle>
                <CardDescription>Gérer les paramètres et préférences de l'agence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Organisation active
                        </FormLabel>
                        <FormDescription>
                          Activer ou désactiver votre organisation
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Separator />
                <FormField
                  control={form.control}
                  name="allowComments"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Autoriser les commentaires
                        </FormLabel>
                        <FormDescription>
                          Autoriser les lecteurs à commenter vos publications
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Separator />
                <FormField
                  control={form.control}
                  name="publishAuto"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Publication automatique
                        </FormLabel>
                        <FormDescription>
                          Les publications sont publiées directement sans validation
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gestion de l'équipe</CardTitle>
                <CardDescription>Gérer les membres de l'équipe, les rôles et les permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Teams />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion de l'équipe</CardTitle>
                <CardDescription>Gérer les membres de l'équipe, les rôles et les permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Teams />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de notification</CardTitle>
                <CardDescription>Configurer la réception des notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Notifications par email
                        </FormLabel>
                        <FormDescription>
                          Recevoir des notifications par email pour les mises à jour importantes
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Separator />
                <FormField
                  control={form.control}
                  name="smsNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Notifications par SMS
                        </FormLabel>
                        <FormDescription>
                          Recevoir des notifications par SMS pour les sujets urgents
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Separator />
                <FormField
                  control={form.control}
                  name="pushNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Notifications push
                        </FormLabel>
                        <FormDescription>
                          Recevoir des notifications push dans votre navigateur
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de sécurité</CardTitle>
                <CardDescription>Configurer les options de sécurité pour votre agence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Authentification à deux facteurs</Label>
                    <FormDescription>Ajoutez une couche de sécurité supplémentaire à votre compte</FormDescription>
                  </div>
                  <Switch disabled />
                </div>
              </CardContent>
            </Card>

            {/* Zone de danger */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Zone de danger
                </CardTitle>
                <CardDescription>Actions irréversibles pour votre agence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-destructive">
                      Supprimer l'agence
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Cette action est irréversible. Cela supprimera définitivement l'organisation et toutes les données associées.
                    </p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside mt-2">
                      <li>Toutes les publications seront supprimées</li>
                      <li>Tous les abonnements seront annulés</li>
                      <li>Tous les membres perdront leur accès</li>
                      <li>Les données ne peuvent pas être récupérées</li>
                    </ul>
                  </div>
                  <Dialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer l'agence
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="h-5 w-5" />
                          Supprimer l'agence
                        </DialogTitle>
                        <DialogDescription>
                          Ceci supprimera définitivement toutes les données de l'agence.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Pour confirmer, tapez le nom de l'agence :
                          </p>
                          <p className="text-lg font-bold text-destructive">
                            {activeOrganization?.name}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="delete-confirmation">
                            Nom de l'agence
                          </Label>
                          <Input
                            id="delete-confirmation"
                            value={deleteConfirmation}
                            onChange={(e) =>
                              setDeleteConfirmation(e.target.value)
                            }
                            placeholder={activeOrganization?.name}
                            className="border-destructive/20 focus:border-destructive"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsDeleteDialogOpen(false);
                            setDeleteConfirmation("");
                          }}
                          disabled={isDeletingOrganization}
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteOrganization}
                          disabled={
                            deleteConfirmation !== activeOrganization?.name ||
                            isDeletingOrganization
                          }
                        >
                          {isDeletingOrganization ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Suppression...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer définitivement
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de facturation</CardTitle>
                <CardDescription>Gestion de la facturation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">
                    Paramètres de facturation
                  </h3>
                  <p className="text-muted-foreground">
                    La gestion de la facturation sera bientôt disponible
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
