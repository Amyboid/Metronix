import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, integer, jsonb, doublePrecision } from "drizzle-orm/pg-core";

// auth tables start
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
// auth tables ends

// --- 1. METADATA TABLES (For Banners) ---
export const categories = pgTable("categories", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  bannerPath: text("banner_path"),
  bannerMsg: text("banner_msg"),
});

export const productTypes = pgTable("product_types", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  bannerPath: text("banner_path"),
  bannerMsg: text("banner_msg"),
});

// --- 2. BRANDS TABLE ---

export const brands = pgTable("brands", {
  slug: text("slug").primaryKey(),          // e.g. "samsung", "lg"
  name: text("name").notNull(),             // e.g. "Samsung", "LG"
  logoPath: text("logo_path"),                  // e.g. "brand-logo/samsung"
});

// --- 3. MASTER PRODUCT TABLE ---

export const products = pgTable("product", {
  id: text("id").primaryKey(),
  categorySlug: text("category_slug")
    .notNull()
    .references(() => categories.slug, { onDelete: "restrict", onUpdate: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),

  // FK to brands.slug — normalised lowercase slug
  brand: text("brand")
    .notNull()
    .references(() => brands.slug, { onDelete: "restrict", onUpdate: "cascade" }),

  description: text("description").notNull(),
  productType: text("product_type")
    .notNull()
    .references(() => productTypes.slug, { onDelete: "restrict", onUpdate: "cascade" }),

  price: integer("price").notNull(),
  discountPrice: integer("discount_price"),

  // High-End UI Features
  colors: jsonb("colors").$type<{ name: string; hex: string }[]>().default([]),
  promotionTag: text("promotion_tag"),
  badgeTag: text("badge_tag"),
  stockStatus: text("stock_status").default("in_stock").notNull(),

  isPublished: boolean("is_published").default(false).notNull(),
  isHero: boolean("is_hero").default(false).notNull(),

  // Assets — synced from first variant on save
  mainImagePath: text("main_image_path").notNull(),
  galleryPaths: jsonb("gallery_paths").$type<string[]>(),
  heroDesktopPath: text("hero_desktop_path"),
  heroMobilePath: text("hero_mobile_path"),

  // Data Objects
  specifications: jsonb("specifications").$type<{ label: string; value: string }[]>().notNull(),
  inTheBox: jsonb("in_the_box").$type<string[]>().notNull(),
  offers: jsonb("offers").$type<string[]>(),

  whatsappMsg: text("whatsapp_msg"),
  createdAt: timestamp("created_at", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { precision: 3 }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("product_slug_idx").on(table.slug),
  index("product_listing_filter_idx").on(
    table.categorySlug,
    table.productType,
    table.brand,
    table.price,
    table.createdAt
  ),
  index("product_promo_idx").on(table.promotionTag, table.isPublished),
]);

// --- 4. PRODUCT VARIANTS ---

export const productVariants = pgTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  colorName: text("color_name").notNull(),
  hex: text("hex").notNull(),
  mainImagePath: text("main_image_path").notNull(),
  galleryPaths: jsonb("gallery_paths").$type<string[]>().default([]),
});

// --- 5. LOGISTICS TABLES ---

export const locations = pgTable("location", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  storeName: text("store_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  phone: text("phone"),
});

export const productAvailability = pgTable("product_availability", {
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  locationId: text("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  stockCount: integer("stock_count").default(0).notNull(),
  deliveryRangeKm: integer("delivery_range_km").default(100).notNull(),
}, (table) => [
  index("availability_product_idx").on(table.productId),
  index("availability_location_idx").on(table.locationId),
]);

// --- 6. CMS TABLES ---

export const sectionTemplates = pgTable("section_template", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  schemaDefinition: jsonb("schema_definition")
    .$type<{ field: string; type: string }[]>()
    .notNull(),
});

export const pageSections = pgTable("page_section", {
  id: text("id").primaryKey(),
  pageName: text("page_name").notNull(),
  templateSlug: text("template_slug")
    .notNull()
    .references(() => sectionTemplates.slug),
  order: integer("order").notNull(),
  priority: text("priority").$type<"high" | "low">().default("high"),
  dataSource: text("data_source").default("products"),
  config: jsonb("config")
    .$type<{
      heading?: string;
      categorySlug?: string;
      tag?: string;
      limit?: number;
      imagePath?: string;
      ctaLink?: string;
      ctaText?: string;
    }>()
    .notNull(),
});

// --- 7. AUDIT LOGS ---

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  // adminId references better-auth user table (text id)
  adminId: text("admin_id").notNull(),
  adminEmail: text("admin_email").notNull(), // denormalised for easy display
  action: text("action").notNull(),      // e.g. "updated", "created", "deleted"
  entityType: text("entity_type").notNull(), // "product" | "location" | "page_section" | "admin_user" | "settings" | "brand" | "category" | "product_type"
  entityId: text("entity_id").notNull(),   // id or slug of the affected entity
  entityName: text("entity_name").notNull(), // human-readable name for display
  createdAt: timestamp("created_at", { precision: 3 }).defaultNow().notNull(),
}, (table) => [
  index("audit_admin_idx").on(table.adminId),
  index("audit_entity_idx").on(table.entityType, table.entityId),
  index("audit_created_idx").on(table.createdAt),
]);

// --- 8. RELATIONSHIPS ---

export const brandRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productTypeRelations = relations(productTypes, ({ many }) => ({
  products: many(products),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categorySlug], references: [categories.slug] }),
  type: one(productTypes, { fields: [products.productType], references: [productTypes.slug] }),
  brand: one(brands, { fields: [products.brand], references: [brands.slug] }),
  availability: many(productAvailability),
  variants: many(productVariants),
}));

export const productVariantRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const locationRelations = relations(locations, ({ many }) => ({
  availabilities: many(productAvailability),
}));

export const availabilityRelations = relations(productAvailability, ({ one }) => ({
  product: one(products, {
    fields: [productAvailability.productId],
    references: [products.id],
  }),
  location: one(locations, {
    fields: [productAvailability.locationId],
    references: [locations.id],
  }),
}));

export const sectionTemplateRelations = relations(sectionTemplates, ({ many }) => ({
  instances: many(pageSections),
}));

export const pageSectionRelations = relations(pageSections, ({ one }) => ({
  template: one(sectionTemplates, {
    fields: [pageSections.templateSlug],
    references: [sectionTemplates.slug],
  }),
}));