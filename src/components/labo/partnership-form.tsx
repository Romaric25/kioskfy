"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { partnershipRegisterSchema, type PartnershipRegisterUser } from "@/server/models/user.model";
import { useErrorStore } from "@/stores/use-error.store";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo } from "@/components/ui/logo";
import { useCreatePartnership } from "@/hooks/use-partnership.hook";

export const PartnershipForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { createPartnership, isCreatingPartnership, isCreatingPartnershipError, errorCreatingPartnership } =
    useCreatePartnership();
  const { addError, errors } = useErrorStore();

  const form = useForm<PartnershipRegisterUser & { acceptTerms: boolean }>({
    // Cast to any due to Zod version mismatch between workspace packages
    resolver: async (data) => {
      try {
        // Validate with the partnership schema (phone required)
        await partnershipRegisterSchema.parseAsync(data);

        // Validate acceptTerms
        if (!data.acceptTerms) {
          return {
            values: {},
            errors: {
              acceptTerms: { message: "Vous devez accepter les conditions d'utilisation et de vente pour continuer" },
            },
          };
        }

        return { values: data, errors: {} };
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, { message: string }> = {};
          error.issues.forEach((err) => {
            const path = err.path.join(".");
            errors[path] = { message: err.message };
          });

          // Also check acceptTerms validation
          if (!data.acceptTerms) {
            errors.acceptTerms = { message: "Vous devez accepter les conditions d'utilisation et de vente pour continuer" };
          }

          return { values: {}, errors };
        }
        return { values: {}, errors: {} };
      }
    },
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: PartnershipRegisterUser) => {
    try {
      await createPartnership({
        email: data.email,
        password: data.password,
        name: data.name,
        lastName: data.lastName,
        typeUser: "agency",
        phone: data.phone,
        termsAcceptance: true,
        confirmPassword: data.confirmPassword,
      });

      setShowSuccessDialog(true);
      form.reset();
    } catch (error: any) {
      console.error("Error detected:", error);
      const errorMessage = error?.message || "Erreur lors de l'inscription";
      addError({
        title: "Erreur lors de l'inscription",
        message: errorMessage,
      });
    }
  };

  return (
    <div className="w-full mx-auto max-w-md space-y-6 border rounded-lg p-6 shadow-lg bg-background">
      <div className="flex flex-col items-center text-center space-y-2">
        <Logo />
        <p className="text-muted-foreground">Créez votre compte pro ePress Afrika</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {errors.length > 0 &&
            errors.map((error) => (
              <Alert key={error.id} variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{error.title}</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            ))}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Prénom <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Jean"
                        className="pl-10"
                        autoComplete="given-name"
                        disabled={isCreatingPartnership}
                        {...field}
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
                  <FormLabel>
                    Nom <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Dupont"
                        className="pl-10"
                        autoComplete="family-name"
                        disabled={isCreatingPartnership}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="votreemail@exemple.com"
                      className="pl-10"
                      autoComplete="email"
                      disabled={isCreatingPartnership}
                      {...field}
                    />
                  </div>
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
                <FormLabel>
                  Téléphone <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <PhoneInput
                    defaultCountry="FR"
                    placeholder="Entrez votre numéro"
                    disabled={isCreatingPartnership}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Mot de passe <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      autoComplete="new-password"
                      disabled={isCreatingPartnership}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Confirmer le mot de passe <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      autoComplete="new-password"
                      disabled={isCreatingPartnership}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isCreatingPartnership}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start space-x-3">
                  <FormControl>
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isCreatingPartnership}
                    />
                  </FormControl>
                  <label
                    htmlFor="acceptTerms"
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    J'accepte les{" "}
                    <Link
                      href="/cgu"
                      target="_blank"
                      className="text-primary hover:underline font-medium"
                    >
                      Conditions d'utilisation
                    </Link>{" "}
                    et les{" "}
                    <Link
                      href="/cgc"
                      target="_blank"
                      className="text-primary hover:underline font-medium"
                    >
                      Conditions générales de vente
                    </Link>
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isCreatingPartnership}
          >
            {isCreatingPartnership ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inscription en cours...
              </>
            ) : (
              "Créer un compte"
            )}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Vous avez déjà un compte ?{" "}
        <Link href="/organization/login" className="text-primary hover:underline font-medium">
          Se connecter
        </Link>
      </p>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500" />
            </div>
            <DialogTitle className="text-center">
              Inscription réussie !
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-3 text-sm text-muted-foreground">
            <div>Votre compte a été créé avec succès. Veuillez vérifier votre email pour activer votre compte.</div>
            <div>
              Un email de confirmation vous a été envoyé à l'adresse{" "}
              <span className="font-medium text-foreground">
                {form.getValues("email")}
              </span>
            </div>
            <div className="text-xs">
              Veuillez vérifier votre boîte de réception et cliquer sur le lien
              de confirmation pour activer votre compte.
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                router.push("/organization/login");
              }}
              className="w-full"
            >
              Aller à la page de connexion
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
