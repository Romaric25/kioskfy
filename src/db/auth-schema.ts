import { relations } from "drizzle-orm";
import {
  mysqlTable,
  text,
  timestamp,
  boolean,
  int,
  index,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { uploads } from "./app-schema";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: varchar("role", { length: 50 }),
  banned: boolean("banned").default(false),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
  phone: varchar("phone", { length: 20 }).unique(),
  lastName: varchar("lastName", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(false),
  typeUser: varchar("typeUser", { length: 50 }).default("client"),
  address: text("address"),
});

export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    userId: varchar("userId", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    activeOrganizationId: varchar("activeOrganizationId", { length: 36 }),
    activeTeamId: varchar("activeTeamId", { length: 36 }),
    impersonatedBy: varchar("impersonatedBy", { length: 36 }),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)],
);

export const accounts = mysqlTable(
  "accounts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: varchar("accountId", { length: 255 }).notNull(),
    providerId: varchar("providerId", { length: 255 }).notNull(),
    userId: varchar("userId", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: varchar("scope", { length: 255 }),
    password: varchar("password", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("accounts_userId_idx").on(table.userId)],
);

export const verifications = mysqlTable(
  "verifications",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

export const organizations = mysqlTable(
  "organizations",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    logo: text("logo"),
    logoUploadId: int("logoUploadId"),
    metadata: text("metadata"),
    email: varchar("email", { length: 255 }).unique(),
    phone: varchar("phone", { length: 20 }).notNull().unique(),
    country: varchar("country", { length: 100 }).notNull(),
    price: int("price"),
    suspended: boolean("suspended").default(false),
    suspendedReason: text("suspendedReason"),
    suspendedUntil: timestamp("suspendedUntil"),
    address: text("address").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").$onUpdate(
      () => /* @__PURE__ */ new Date(),
    ),
  },
  (table) => [
    uniqueIndex("organizations_slug_uidx").on(table.slug),
    index("organizations_logoUploadId_idx").on(table.logoUploadId),
  ],
);

export const organizationRole = mysqlTable(
  "organization_role",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organizationId: varchar("organizationId", { length: 36 })
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).notNull(),
    permission: text("permission").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").$onUpdate(
      () => /* @__PURE__ */ new Date(),
    ),
  },
  (table) => [
    index("organizationRole_organizationId_idx").on(table.organizationId),
    index("organizationRole_role_idx").on(table.role),
  ],
);

export const teams = mysqlTable(
  "teams",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    organizationId: varchar("organizationId", { length: 36 })
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").$onUpdate(
      () => /* @__PURE__ */ new Date(),
    ),
  },
  (table) => [index("teams_organizationId_idx").on(table.organizationId)],
);

export const team_members = mysqlTable(
  "team_members",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    teamId: varchar("teamId", { length: 36 })
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: varchar("userId", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt"),
  },
  (table) => [
    index("team_members_teamId_idx").on(table.teamId),
    index("team_members_userId_idx").on(table.userId),
  ],
);

export const members = mysqlTable(
  "members",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organizationId: varchar("organizationId", { length: 36 })
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: varchar("userId", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).default("member").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => [
    index("members_organizationId_idx").on(table.organizationId),
    index("members_userId_idx").on(table.userId),
  ],
);

export const invitations = mysqlTable(
  "invitations",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organizationId: varchar("organizationId", { length: 36 })
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }),
    teamId: varchar("teamId", { length: 36 }),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    inviterId: varchar("inviterId", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invitations_organizationId_idx").on(table.organizationId),
    index("invitations_email_idx").on(table.email),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  sessionss: many(sessions),
  accountss: many(accounts),
  team_memberss: many(team_members),
  memberss: many(members),
  invitationss: many(invitations),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  users: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  users: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  logoUpload: one(uploads, {
    fields: [organizations.logoUploadId],
    references: [uploads.id],
  }),
  organizationRoles: many(organizationRole),
  teamss: many(teams),
  memberss: many(members),
  invitationss: many(invitations),
}));

export const organizationRoleRelations = relations(
  organizationRole,
  ({ one }) => ({
    organizations: one(organizations, {
      fields: [organizationRole.organizationId],
      references: [organizations.id],
    }),
  }),
);

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organizations: one(organizations, {
    fields: [teams.organizationId],
    references: [organizations.id],
  }),
  team_memberss: many(team_members),
}));

export const team_membersRelations = relations(team_members, ({ one }) => ({
  teams: one(teams, {
    fields: [team_members.teamId],
    references: [teams.id],
  }),
  users: one(users, {
    fields: [team_members.userId],
    references: [users.id],
  }),
}));

export const membersRelations = relations(members, ({ one }) => ({
  organizations: one(organizations, {
    fields: [members.organizationId],
    references: [organizations.id],
  }),
  users: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organizations: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
  }),
  users: one(users, {
    fields: [invitations.inviterId],
    references: [users.id],
  }),
}));
