"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, Save, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrganization, useUpdateNewspaper } from "@/hooks";
import { priceFormatter, getCurrencySymbol } from "@/lib/helpers";
import {
  Status,
  updateNewspaperSchema,
  type UpdateNewspaper,
  type NewspaperResponse,
} from "@/server/models/newspaper.model";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "react-hot-toast";
import { UploadFile } from "@/components/upload-file";
import { UploadPdf } from "./upload-pdf";
import Image from "next/image";
import { useGetCountryByName } from "@/hooks/use-get-country-by-name.hook";

interface EditNewspaperSheetProps {
  newspaper: NewspaperResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OrganizationWithPrice {
  id: string;
  slug: string;
  metadata?: unknown;
  country?: string;
  price?: string | number;
}

export function EditNewspaperSheet({
  newspaper,
  open,
  onOpenChange,
}: EditNewspaperSheetProps) {
  const { organization } = useOrganization();
  const activeOrganization = organization?.data as
    | OrganizationWithPrice
    | undefined;
  const orgCountry = activeOrganization?.country || "";
  const { country } = useGetCountryByName(orgCountry);
  const { updateNewspaper, isUpdatingNewspaper, isUpdatingNewspaperSuccess } =
    useUpdateNewspaper();

  // Calculs dérivés
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

  const form = useForm<UpdateNewspaper>({
    resolver: zodResolver(updateNewspaperSchema),
    defaultValues: {
      issueNumber: "",
      publishDate: "",
      autoPublish: false,
      coverImageFile: [],
      price: 0,
      status: Status.DRAFT,
      pdfFile: [],
      categoryIds: [],
    },
  });

  // Remplir le formulaire avec les données du journal
  useEffect(() => {
    if (newspaper && open) {
      // Map string status to Status enum (excluding PENDING for form schema)
      const getStatusEnum = (status: string): Status.PUBLISHED | Status.DRAFT | Status.ARCHIVED => {
        if (status === "published") return Status.PUBLISHED;
        if (status === "archived") return Status.ARCHIVED;
        return Status.DRAFT; // Default for draft, pending, or unknown
      };

      form.reset({
        issueNumber: newspaper.issueNumber || "",
        publishDate: newspaper.publishDate
          ? new Date(newspaper.publishDate).toISOString()
          : "",
        coverImageFile: [],
        price: Number(newspaper.price) || 0,
        status: getStatusEnum(newspaper.status),
        pdfFile: [],
        categoryIds: newspaper.categories?.map((c) => Number(c.id)) || [],
      });
    }
  }, [newspaper, open, form]);

  // Fermer le sheet après une mise à jour réussie
  useEffect(() => {
    if (isUpdatingNewspaperSuccess) {
      toast.success("Édition mise à jour avec succès");
      onOpenChange(false);
    }
  }, [isUpdatingNewspaperSuccess, onOpenChange]);

  const onSubmit = async (data: UpdateNewspaper) => {
    if (!newspaper) return;

    try {
      // Construire l'objet de mise à jour avec seulement les champs modifiés
      const updateData: UpdateNewspaper = {};

      if (data.issueNumber && data.issueNumber !== newspaper.issueNumber) {
        updateData.issueNumber = data.issueNumber;
      }
      if (data.publishDate) {
        updateData.publishDate = data.publishDate;
      }
      if (data.price !== undefined && data.price !== Number(newspaper.price)) {
        updateData.price = data.price;
      }
      // Compare status as strings since NewspaperResponse uses string literals
      if (data.status && data.status !== newspaper.status) {
        updateData.status = data.status;
      }
      if (data.coverImageFile && data.coverImageFile.length > 0) {
        updateData.coverImageFile = data.coverImageFile;
      }
      if (data.pdfFile && data.pdfFile.length > 0) {
        updateData.pdfFile = data.pdfFile;
      }

      await updateNewspaper({
        id: Number(newspaper.id),
        data: updateData,
      });
    } catch (error) {
      console.error("Error updating newspaper:", error);
      toast.error("Erreur lors de la mise à jour de l'édition");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col h-full">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Modifier l'édition
          </SheetTitle>
          <SheetDescription>Modifiez les informations de cette édition de votre journal</SheetDescription>
        </SheetHeader>

        {newspaper && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log("Form validation errors:", errors);
              })}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {/* Aperçu de la couverture actuelle */}
                {newspaper.coverImage && (
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Couverture actuelle
                    </p>
                    <div className="relative h-40 w-28 overflow-hidden rounded-md border">
                      <Image
                        src={newspaper.coverImage}
                        alt={`Cover ${newspaper.issueNumber}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
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
                      <FormMessage />
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
                                  locale: fr,
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
                            initialFocus
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image de couverture */}
                <FormField
                  control={form.control}
                  name="coverImageFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nouvelle image de couverture</FormLabel>
                      <FormDescription>Laisser vide pour conserver l'image actuelle</FormDescription>
                      <FormControl>
                        <UploadFile
                          fieldName="coverImageFile"
                          accept="image/*"
                          maxSizeMB={15}
                          maxFiles={1}
                          multiple={false}
                          convertToBase64={true}
                          labels={{
                            dropzone: "Cliquez ou glissez pour télécharger une image",
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
                      <FormLabel>Nouveau fichier PDF</FormLabel>
                      <FormDescription>Laisser vide pour conserver le PDF actuel</FormDescription>
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
                      <FormLabel>
                        Prix ({currencySymbol})
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Le prix de vente de cette édition ({priceFormatted})
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Publication automatique */}
                <FormField
                  control={form.control}
                  name="autoPublish"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Publication automatique</FormLabel>
                        <FormDescription>
                          Publier automatiquement à la date prévue
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Fixed Footer with Submit Button */}
              <SheetFooter className="px-6 py-4 border-t bg-background">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isUpdatingNewspaper}
                >
                  {isUpdatingNewspaper ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
