"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrganizationSchema } from "@/server/models/organization.model";
import { useCountries, useCreateOrganization } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { z } from "zod";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Image from "next/image";
import { PhoneInput } from "@/components/ui/phone-input";
import { UploadFile } from "@/components/upload-file";
import { useAuth } from "@/hooks/use-auth.hook";
import toast from "react-hot-toast";
import { Textarea } from "../ui/textarea";

// Extend the schema to include specific metadata fields for the form
const formSchema = createOrganizationSchema
  .omit({ slug: true, logo: true })
  .extend({
    address: z.string().min(1, "L'adresse est requise"),
    phone: z.string().min(1, "Le téléphone est requis"),
    country: z.string().min(1, "Le pays est requis"),
    logoFile: z.array(z.any()).min(1, "Le logo est requis"), // For the base64 logo file
  });

type FormValues = z.infer<typeof formSchema>;

export function OrganizationForm() {
  const [open, setOpen] = useState(false);
  const {
    createOrganization,
    isCreatingOrganization,
    isCreatingOrganizationSuccess,
  } = useCreateOrganization();
  const { countries } = useCountries();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      email: user?.email || "",
      address: "",
      country: "",
      phone: "",
      description: "",
      logoFile: [],
      suspended: false,
    },
  });

  async function onSubmit(values: FormValues) {
    console.log(values);
    try {
      const { address, phone, country, logoFile, description, ...rest } =
        values;

      // Get the Upload ID from the uploaded file results (from presigned upload)
      const logoUploadId = logoFile && logoFile.length > 0 ? (logoFile[0] as any).id : undefined;
      // Only send file if NO upload ID (fallback)
      const fileToUpload = !logoUploadId && logoFile && logoFile.length > 0 ? logoFile[0].file as File : undefined;

      await createOrganization({
        ...rest,
        slug: "", // Backend generates slug, but type requires it
        logoFile: fileToUpload,
        logoUploadId: logoUploadId,
        country,
        phone,
        address,
        description,
        metadata: {
          isActive: true,
          allowComments: false,
          publishAuto: false,
        },
      });

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create organization:", error);
    }
  }

  useEffect(() => {
    if (isCreatingOrganizationSuccess) {
      form.reset();
      setOpen(false);
    }
  }, [isCreatingOrganizationSuccess]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Créer une organisation
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Créer une organisation</SheetTitle>
          <SheetDescription>Remplissez les informations ci-dessous pour créer votre nouvelle organisation.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">
                      Nom de l'agence <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Entrez le nom de l'agence"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Logo de l'agence</FormLabel>
                    <FormControl>
                      <UploadFile
                        fieldName="logoFile"
                        accept="image/*"
                        maxSizeMB={20}
                        maxFiles={1}
                        multiple={false}
                        convertToBase64={true}
                        presignedUpload={true}
                        labels={{
                          dropzone: "Glissez et déposez le logo ici",
                          uploadButton: "Sélectionner un logo",
                          addMoreButton: "Changer le logo",
                          filesUploaded: "Logo téléchargé",
                        }}
                        setValue={(fieldName: string, value: any) => {
                          form.setValue("logoFile", value);
                        }}
                        value={field.value}
                        error={form.formState.errors.logoFile?.message}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">
                      Pays <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un pays" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries?.data?.map((country) => (
                            <SelectItem key={country.id} value={country.name}>
                              <Image
                                className="mr-2"
                                src={country.flag}
                                alt={country.name}
                                width={20}
                                height={20}
                              />
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Entrez l'email de l'organisation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">
                      Adresse <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Entrez l'adresse" {...field} />
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
                    <FormLabel className="font-bold">
                      Téléphone <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="FR"
                        placeholder="Entrez votre numéro"
                        disabled={isCreatingOrganization}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">
                      Description <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Entrez une description..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        {/* Bouton fixe en bas du Sheet */}
        <div className="border-t bg-background p-4 mt-auto mb-4">
          <Button
            type="submit"
            disabled={isCreatingOrganization}
            onClick={form.handleSubmit(onSubmit)}
            className="w-full"
          >
            {isCreatingOrganization ? "Création..." : "Créer l'organisation"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
