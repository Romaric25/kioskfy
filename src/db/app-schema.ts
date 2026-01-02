import { relations } from "drizzle-orm";
import {
    mysqlTable,
    text,
    timestamp,
    int,
    varchar,
    decimal,
    boolean,
    mysqlEnum,
    primaryKey,
    index,
    uniqueIndex,
    bigint,
    json,
} from "drizzle-orm/mysql-core";
import { users, organizations, teams } from "./auth-schema";

// ============================================
// Categories Table
// ============================================
export const categories = mysqlTable("categories", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    icon: varchar("icon", { length: 255 }).notNull(),
    color: varchar("color", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// ============================================
// Countries Table
// ============================================
export const countries = mysqlTable(
    "countries",
    {
        id: int("id").primaryKey().autoincrement(),
        name: varchar("name", { length: 255 }).notNull(),
        slug: varchar("slug", { length: 255 }).notNull().unique(),
        flag: varchar("flag", { length: 255 }).notNull(),
        currency: varchar("currency", { length: 255 }).notNull(),
        code: varchar("code", { length: 255 }).notNull().unique(),
        host: varchar("host", { length: 255 }),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        uniqueIndex("countries_slug_idx").on(table.slug),
        uniqueIndex("countries_code_idx").on(table.code),
    ]
);

// ============================================
// Uploads Table
// ============================================
export const uploads = mysqlTable(
    "uploads",
    {
        id: int("id").primaryKey().autoincrement(),
        filename: varchar("filename", { length: 255 }).notNull(),
        thumbnailS3Key: text("thumbnailS3Key").notNull(),
        thumbnailUrl: text("thumbnailUrl").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    }
);

// ============================================
// Newspapers Table
// ============================================
export const newspaperStatusEnum = mysqlEnum("status", [
    "published",
    "draft",
    "pending",
    "archived",
]);

export const newspapers = mysqlTable(
    "newspapers",
    {
        id: varchar("id", { length: 36 }).primaryKey(),
        coverImage: text("coverImage").notNull(),
        price: decimal("price", { precision: 10, scale: 2 }).notNull(),
        autoPublish: boolean("autoPublish").default(false).notNull(),
        organizationId: varchar("organizationId", { length: 36 }).references(
            () => organizations.id
        ),
        publishDate: timestamp("publishDate").notNull(),
        countryId: int("countryId").references(() => countries.id),
        pdf: text("pdf").notNull(),
        issueNumber: varchar("issueNumber", { length: 255 }).notNull(),
        coverImageUploadId: int("coverImageUploadId").references(() => uploads.id),
        pdfUploadId: int("pdfUploadId").references(() => uploads.id),
        status: newspaperStatusEnum.default("draft").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("newspapers_organizationId_idx").on(table.organizationId),
        index("newspapers_countryId_idx").on(table.countryId),
    ]
);

// ============================================
// Newspapers Categories Junction Table
// ============================================
export const newspapersCategories = mysqlTable(
    "newspapers_categories_categories",
    {
        newspapersId: varchar("newspapersId", { length: 36 })
            .notNull()
            .references(() => newspapers.id, { onDelete: "cascade", onUpdate: "cascade" }),
        categoriesId: int("categoriesId")
            .notNull()
            .references(() => categories.id),
    },
    (table) => [
        primaryKey({ columns: [table.newspapersId, table.categoriesId] }),
        index("newspapers_categories_newspapersId_idx").on(table.newspapersId),
        index("newspapers_categories_categoriesId_idx").on(table.categoriesId),
    ]
);

// ============================================
// Orders Table
// ============================================
export const orderStatusEnum = mysqlEnum("status", [
    "pending",
    "completed",
    "failed",
    "refunded",
]);

export const orders = mysqlTable(
    "orders",
    {
        id: varchar("id", { length: 36 }).primaryKey(),
        userId: varchar("userId", { length: 255 }).references(() => users.id),
        newspaperId: varchar("newspaperId", { length: 255 })
            .notNull()
            .references(() => newspapers.id),
        price: decimal("price", { precision: 10, scale: 2 }).notNull(),
        status: orderStatusEnum.default("pending").notNull(),
        paymentId: varchar("paymentId", { length: 255 }),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("orders_userId_idx").on(table.userId),
        index("orders_newspaperId_idx").on(table.newspaperId),
    ]
);

// ============================================
// Revenue Shares Table
// Gère la répartition des revenus entre plateforme et organisations
// Plateforme: 25% | Organisation: 75%
// ============================================
export const revenueShareStatusEnum = mysqlEnum("revenue_share_status", [
    "pending",      // En attente de traitement
    "processed",    // Traité et comptabilisé
    "paid_out",     // Versé à l'organisation
    "cancelled",    // Annulé (remboursement)
]);

export const revenueShares = mysqlTable(
    "revenue_shares",
    {
        id: int("id").primaryKey().autoincrement(),
        orderId: varchar("orderId", { length: 36 })
            .notNull()
            .references(() => orders.id, { onDelete: "cascade" }),
        organizationId: varchar("organizationId", { length: 36 })
            .notNull()
            .references(() => organizations.id),

        // Montants
        totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
        platformAmount: decimal("platformAmount", { precision: 10, scale: 2 }).notNull(),
        organizationAmount: decimal("organizationAmount", { precision: 10, scale: 2 }).notNull(),

        // Pourcentages (stockés pour historique en cas de changement de taux)
        platformPercentage: decimal("platformPercentage", { precision: 5, scale: 2 }).default("25.00").notNull(),
        organizationPercentage: decimal("organizationPercentage", { precision: 5, scale: 2 }).default("75.00").notNull(),

        // Devise
        currency: varchar("currency", { length: 10 }).default("XAF").notNull(),

        // Statut
        status: revenueShareStatusEnum.default("pending").notNull(),

        // Dates
        processedAt: timestamp("processedAt"),
        paidOutAt: timestamp("paidOutAt"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("revenue_shares_orderId_idx").on(table.orderId),
        index("revenue_shares_organizationId_idx").on(table.organizationId),
        index("revenue_shares_status_idx").on(table.status),
    ]
);

// ============================================
// Organization Balances Table
// Stocke les soldes cumulés pour chaque organisation
// ============================================
export const organizationBalances = mysqlTable(
    "organization_balances",
    {
        id: int("id").primaryKey().autoincrement(),
        organizationId: varchar("organizationId", { length: 36 })
            .notNull()
            .unique()
            .references(() => organizations.id),

        // Soldes cumulés
        organizationAmount: decimal("organizationAmount", { precision: 10, scale: 2 }).default("0.00").notNull(),
        platformAmount: decimal("platformAmount", { precision: 10, scale: 2 }).default("0.00").notNull(),

        // Compteurs
        totalSales: int("totalSales").default(0).notNull(),
        totalWithdrawals: int("totalWithdrawals").default(0).notNull(),

        // Montant déjà retiré
        withdrawnAmount: decimal("withdrawnAmount", { precision: 10, scale: 2 }).default("0.00").notNull(),

        // Devise
        currency: varchar("currency", { length: 10 }).default("XAF").notNull(),

        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("organization_balances_organizationId_idx").on(table.organizationId),
    ]
);

// ============================================
// Withdrawals Table
// Historique des demandes de retrait
// ============================================
export const withdrawalStatusEnum = mysqlEnum("withdrawal_status", [
    "pending",      // En attente de traitement
    "processing",   // En cours de traitement
    "completed",    // Retrait effectué
    "failed",       // Échec du retrait
    "cancelled",    // Annulé
]);

export const withdrawals = mysqlTable(
    "withdrawals",
    {
        id: int("id").primaryKey().autoincrement(),
        organizationId: varchar("organizationId", { length: 36 })
            .notNull()
            .references(() => organizations.id),

        userId: varchar("userId", { length: 255 }).references(() => users.id),

        // Montant
        amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
        currency: varchar("currency", { length: 10 }).default("XAF").notNull(),

        // Statut
        status: withdrawalStatusEnum.default("pending").notNull(),

        // Informations de paiement
        paymentMethod: varchar("paymentMethod", { length: 50 }), // mobile_money, bank_transfer, etc.
        paymentDetails: text("paymentDetails"), // JSON avec les détails (numéro, banque, etc.)

        // Référence externe (ID du paiement Moneroo, etc.)
        externalReference: varchar("externalReference", { length: 255 }),

        // Notes
        notes: text("notes"),

        // Dates
        requestedAt: timestamp("requestedAt").defaultNow().notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("withdrawals_organizationId_idx").on(table.organizationId),
        index("withdrawals_status_idx").on(table.status),
        index("withdrawals_requestedAt_idx").on(table.requestedAt),
    ]
);

// ============================================
// Rate Limit Table
// ============================================
export const rateLimit = mysqlTable("rateLimit", {
    id: varchar("id", { length: 36 }).primaryKey(),
    key: text("key").notNull(),
    count: int("count").notNull(),
    lastRequest: bigint("lastRequest", { mode: "number" }).notNull(),
});

// ============================================
// Relations
// ============================================

// Categories relations
export const categoriesRelations = relations(categories, ({ many }) => ({
    newspapers: many(newspapersCategories),
}));

// Countries relations
export const countriesRelations = relations(countries, ({ many }) => ({
    newspapers: many(newspapers),
}));

// Newspapers relations
export const newspapersRelations = relations(newspapers, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [newspapers.organizationId],
        references: [organizations.id],
    }),
    country: one(countries, {
        fields: [newspapers.countryId],
        references: [countries.id],
    }),
    coverImageUpload: one(uploads, {
        fields: [newspapers.coverImageUploadId],
        references: [uploads.id],
    }),
    pdfUpload: one(uploads, {
        fields: [newspapers.pdfUploadId],
        references: [uploads.id],
    }),
    categories: many(newspapersCategories),
    orders: many(orders),
}));

// Newspapers Categories junction relations
export const newspapersCategoriesRelations = relations(
    newspapersCategories,
    ({ one }) => ({
        newspaper: one(newspapers, {
            fields: [newspapersCategories.newspapersId],
            references: [newspapers.id],
        }),
        category: one(categories, {
            fields: [newspapersCategories.categoriesId],
            references: [categories.id],
        }),
    })
);

// Orders relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    newspaper: one(newspapers, {
        fields: [orders.newspaperId],
        references: [newspapers.id],
    }),
    revenueShare: one(revenueShares, {
        fields: [orders.id],
        references: [revenueShares.orderId],
    }),
}));

// Revenue Shares relations
export const revenueSharesRelations = relations(revenueShares, ({ one }) => ({
    order: one(orders, {
        fields: [revenueShares.orderId],
        references: [orders.id],
    }),
    organization: one(organizations, {
        fields: [revenueShares.organizationId],
        references: [organizations.id],
    }),
}));

// Organization Balances relations
export const organizationBalancesRelations = relations(organizationBalances, ({ one }) => ({
    organization: one(organizations, {
        fields: [organizationBalances.organizationId],
        references: [organizations.id],
    }),
}));

// Withdrawals relations
export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
    organization: one(organizations, {
        fields: [withdrawals.organizationId],
        references: [organizations.id],
    }),
    user: one(users, {
        fields: [withdrawals.userId],
        references: [users.id],
    }),
}));

// ============================================
// Favorites Table
// ============================================
export const favorites = mysqlTable(
    "favorites",
    {
        id: int("id").primaryKey().autoincrement(),
        userId: varchar("userId", { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        newspaperId: varchar("newspaperId", { length: 36 })
            .notNull()
            .references(() => newspapers.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
    },
    (table) => [
        index("favorites_userId_idx").on(table.userId),
        index("favorites_newspaperId_idx").on(table.newspaperId),
        uniqueIndex("favorites_user_newspaper_idx").on(table.userId, table.newspaperId),
    ]
);

// Favorites relations
export const favoritesRelations = relations(favorites, ({ one }) => ({
    user: one(users, {
        fields: [favorites.userId],
        references: [users.id],
    }),
    newspaper: one(newspapers, {
        fields: [favorites.newspaperId],
        references: [newspapers.id],
    }),
}));

// ============================================
// User Favorite Countries Table
// ============================================
export const userFavoriteCountries = mysqlTable(
    "user_favorite_countries",
    {
        id: int("id").primaryKey().autoincrement(),
        userId: varchar("userId", { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        countryId: int("countryId")
            .notNull()
            .references(() => countries.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
    },
    (table) => [
        index("ufc_userId_idx").on(table.userId),
        index("ufc_countryId_idx").on(table.countryId),
        uniqueIndex("ufc_user_country_idx").on(table.userId, table.countryId),
    ]
);

// User Favorite Countries relations
export const userFavoriteCountriesRelations = relations(userFavoriteCountries, ({ one }) => ({
    user: one(users, {
        fields: [userFavoriteCountries.userId],
        references: [users.id],
    }),
    country: one(countries, {
        fields: [userFavoriteCountries.countryId],
        references: [countries.id],
    }),
}));
