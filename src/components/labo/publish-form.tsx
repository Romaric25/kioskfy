"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";
import {
  CalendarIcon,
  Upload,
  FileText,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useOrganization,
  useIsCompletedOrganization,
} from "@/hooks/use-organizations.hook";
import { useCreateNewspaper } from "@/hooks";
import { useAuth } from "@/hooks/use-auth.hook";
import { priceFormatter, getCurrencySymbol } from "@/lib/helpers";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { UploadFile } from "@/components/upload-file";
import { parseMetadata } from "@/lib/parse-metadata";
import { PublishFormSkeleton } from "./skeleton/publish-form-skeleton";
import { useRouter } from "next/navigation";
import { IncompleteOrganizationCard } from "./IncompleteOrganizationCard";
import { useCanPublish } from "@/hooks";
import { UploadPdf } from "./upload-pdf";
import { CreateNewspaper, createNewspaperSchema, Status } from "@/server/models/newspaper.model";
import { useGetCountryByName } from "@/hooks/use-get-country-by-name.hook";

interface OrganizationWithPrice {
  id: string;
  slug: string;
  metadata?: unknown;
  country?: string;
  price?: string | number;
}




export function PublishForm() {
  const { user } = useAuth();
  const dateLocale = fr;
  const router = useRouter();

  // Hooks de données

  // Hooks de données
  const { organization, isLoadingOrganization } = useOrganization();
  const activeOrganization = organization?.data as OrganizationWithPrice | undefined;
  const orgCountry = activeOrganization?.country || "";
  const { country, isLoading: isLoadingCountry } = useGetCountryByName(orgCountry);
  const { createNewspaper, isCreatingNewspaper, isCreatingNewspaperSuccess } = useCreateNewspaper();
  const { isCompleted: isOrganizationCompleted, isLoading: isLoadingCompleted } = useIsCompletedOrganization();

  // Calculs dérivés avec valeurs par défaut sécurisées
  const metadata = useMemo(
    () => parseMetadata(activeOrganization?.metadata as string | Record<string, unknown> | null | undefined),
    [activeOrganization?.metadata]
  );
  const categories = useMemo(
    () => (metadata?.categories as number[]) || [],
    [metadata]
  );
  const code = country?.code ?? "fr-FR";
  const currency = country?.currency ?? "EUR";
  const orgPrice = Number(activeOrganization?.price) || 0;
  const priceFormatted = useMemo(
    () => priceFormatter(orgPrice, currency, code),
    [orgPrice, currency, code]
  );
  const currencySymbol = useMemo(
    () => getCurrencySymbol(currency, code),
    [currency, code]
  );

  // Permission check
  const { hasPermission, isLoadingPermission } = useCanPublish();
  console.log(hasPermission);
  // Form hook - DOIT être avant tout early return
  const form = useForm<CreateNewspaper>({
    resolver: zodResolver(createNewspaperSchema),
    defaultValues: {
      issueNumber: "",
      publishDate: new Date().toISOString(),
      coverImageFile: [],
      price: 0,
      status: Status.DRAFT,
      pdfFile: [],
      categoryIds: [],
      organizationId: "",
      country: "",
    },
  });

  // Effect pour mettre à jour le formulaire quand les données sont chargées
  useEffect(() => {
    if (activeOrganization) {
      form.reset({
        issueNumber: "",
        publishDate: new Date().toISOString(),
        coverImageFile: [],
        price: orgPrice,
        status: Status.DRAFT,
        pdfFile: [],
        categoryIds: categories,
        organizationId: activeOrganization.id,
        country: country?.name || "",
      });
    }
  }, [activeOrganization, categories, country?.name, orgPrice, form]);

  // Effect pour gérer le succès de la création
  useEffect(() => {
    if (isCreatingNewspaperSuccess) {
      toast.success("Édition publiée avec succès");
      form.reset();
      router.push("/organization/dashboard/newspapers");
    }
  }, [isCreatingNewspaperSuccess, router, form]);

  const onSubmit = async (data: CreateNewspaper) => {
    console.log("Publishing newspaper:", data);
    try {
      await createNewspaper(data);
    } catch (error) {
      console.error("Error publishing:", error);
      //toast.error("Erreur lors de la publication de l'édition");
    }
  };

  // Early return APRÈS tous les hooks
  if (isLoadingOrganization || isLoadingCountry || isLoadingCompleted || !activeOrganization) {
    return <PublishFormSkeleton />;
  }

  // Si l'organisation n'est pas complète, afficher un message
  if (!isOrganizationCompleted) {
    return <IncompleteOrganizationCard />;
  }

  // Si l'organisation n'est pas active, afficher un message
  const isOrganizationActive = metadata?.isActive === true;
  if (!isOrganizationActive) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <FileText className="h-5 w-5" />
            Organisation inactive
          </CardTitle>
          <CardDescription>
            Votre organisation n'est pas encore active. Veuillez activer votre organisation dans les paramètres pour pouvoir publier des éditions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <a href="/organization/dashboard/settings">
              Accéder aux paramètres
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Publier une édition
        </CardTitle>
        <CardDescription>Remplissez les informations pour publier une nouvelle édition de votre journal</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(
            onSubmit,
            (errors) => {
              console.log("Form validation errors:", errors);
              console.log("Current form values:", form.getValues());
            }
          )} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Numéro d'édition */}
              <FormField
                control={form.control}
                name="issueNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro d'édition</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex : N°1234"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Le numéro unique de cette édition
                    </FormDescription>
                    <FormMessage>
                      {form.formState.errors.issueNumber?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              {/* Date de publication */}
              <FormField
                control={form.control}
                name="publishDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de publication</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP", {
                                locale: dateLocale,
                              })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date?.toISOString() || "")
                          }
                          disabled={(date) => date < new Date()}
                          autoFocus
                          locale={dateLocale}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      La date à laquelle l'édition sera disponible
                    </FormDescription>
                    <FormMessage>
                      {form.formState.errors.publishDate?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>
            {/* Image de couverture */}
            <FormField
              control={form.control}
              name="coverImageFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image de couverture</FormLabel>
                  <FormControl>
                    <UploadFile
                      fieldName="coverImageFile"
                      accept="image/*"
                      maxSizeMB={15}
                      maxFiles={1}
                      multiple={false}
                      convertToBase64={true}
                      labels={{
                        dropzone: "Cliquez ou glissez pour télécharger une couverture",
                        uploadButton: "Sélectionner une image",
                        addMoreButton: "Changer l'image",
                        filesUploaded: "Image téléchargée",
                      }}
                      setValue={(fieldName: string, value: unknown) => {
                        form.setValue("coverImageFile", value as unknown[]);
                      }}
                      value={field.value}
                      error={form.formState.errors.coverImageFile?.message}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* PDF */}
            <FormField
              control={form.control}
              name="pdfFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fichier PDF</FormLabel>
                  <FormControl>
                    <UploadPdf
                      fieldName="pdfFile"
                      maxSizeMB={250}
                      labels={{
                        dropzone: "Cliquez ou glissez pour télécharger le PDF",
                        uploadButton: "Sélectionner un PDF",
                        addMoreButton: "Changer le PDF",
                        filesUploaded: "PDF téléchargé",
                      }}
                      setValue={(fieldName: string, value: unknown) => {
                        form.setValue("pdfFile", value as unknown[]);
                      }}
                      value={field.value}
                      error={form.formState.errors.pdfFile?.message}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Prix */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix ({currencySymbol})</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Le prix de vente de cette édition ({priceFormatted}) </FormDescription>
                  <FormMessage>
                    {form.formState.errors.price?.message}
                  </FormMessage>
                </FormItem>
              )}
            />


            {/* Info publication automatique */}
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <p className="font-medium">Publication automatique</p>
              <p className="mt-1 text-blue-700 dark:text-blue-300">Cette édition sera automatiquement publiée à la date prévue à 4h00 si elle n'est pas archivée.</p>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isCreatingNewspaper}>
              {isCreatingNewspaper ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publication en cours...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Publier l'édition
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
