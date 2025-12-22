import { z } from "zod";

// ============================================================================
// BASE SCHEMAS - No refinements to keep them composable with .omit(), .pick()
// ============================================================================

/**
 * Base user data schema (without password fields)
 * This represents the core user entity stored in the database
 */
const baseUserDataSchema = z.object({
  id: z.string(),
  emailVerified: z.boolean(),
  name: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional(),
  image: z.string().nullable().optional(),
  typeUser: z.string().optional(),

  // Custom fields from better-auth
  role: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Password validation schema
 * Reusable for registration, password change, etc.
 */
const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial"),
});

/**
 * Password with confirmation schema
 */
const passwordWithConfirmSchema = passwordSchema.extend({
  confirmPassword: z
    .string()
    .min(1, "La confirmation du mot de passe est requise"),
});

// ============================================================================
// COMPOSED SCHEMAS WITH REFINEMENTS
// ============================================================================

/**
 * Complete user schema (for existing users in database)
 * Includes password field but typically password is hashed
 */
export const userSchema = baseUserDataSchema.extend(passwordSchema.shape);

export type User = z.infer<typeof userSchema>;

/**
 * Schema for creating a new user (backend)
 * Omits auto-generated fields and confirmation password
 */
export const createUserSchema = baseUserDataSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    emailVerified: true,
    isActive: true,
  })
  .extend(passwordSchema.shape);

export type CreateUser = z.infer<typeof createUserSchema>;

/**
 * Schema for user registration (frontend)
 * Includes password confirmation with validation
 */
const baseRegisterSchema = baseUserDataSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    emailVerified: true,
    isActive: true,
  })
  .extend(passwordWithConfirmSchema.shape);

/**
 * Schema for user login
 * Simpler validation as user is already registered
 */
export const loginSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est obligatoire"),
  rememberMe: z.boolean().optional(),
});

export type LoginUser = z.infer<typeof loginSchema>;

/**
 * Schema for creating a new user (backend)
 * Omits auto-generated fields and confirmation password
 */
export const updateProfileSchema = baseUserDataSchema
  .pick({
    name: true,
    lastName: true,
    phone: true,
    address: true,
  })
  .extend({
    image: z.string().nullable().optional(),
  });

/**
 * Schema for user registration (frontend)
 * Includes password confirmation with validation
 */
export const registerSchema = baseUserDataSchema
  .pick({
    name: true,
    lastName: true,
    email: true,
    phone: true,
    typeUser: true,
  })
  .extend(passwordWithConfirmSchema.shape)
  .extend({
    termsAcceptance: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions générales",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type RegisterUser = z.infer<typeof registerSchema>;

/**
 * Schema for partnership registration (frontend)
 * Reuses registerSchema but makes phone mandatory and validates it
 */
export const partnershipRegisterSchema = baseUserDataSchema
  .pick({
    name: true,
    lastName: true,
    email: true,
    typeUser: true,
  })
  .extend({
    phone: z.string().min(1, "Le numéro de téléphone est obligatoire"),
  })
  .extend(passwordWithConfirmSchema.shape)
  .extend({
    termsAcceptance: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions générales",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type PartnershipRegisterUser = z.infer<typeof partnershipRegisterSchema>;
