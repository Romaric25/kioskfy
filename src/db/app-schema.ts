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
export const orderStatusEnum = mysqlEnum("order_status", [
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
export const ordersRelations = relations(orders, ({ one }) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    newspaper: one(newspapers, {
        fields: [orders.newspaperId],
        references: [newspapers.id],
    }),
}));
