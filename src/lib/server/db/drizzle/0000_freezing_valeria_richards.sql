CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text NOT NULL,
	"admin_email" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"entity_name" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_product_types" (
	"brand" text NOT NULL,
	"product_type" text NOT NULL,
	CONSTRAINT "brand_product_types_brand_product_type_pk" PRIMARY KEY("brand","product_type")
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"logo_path" text,
	"logo_file_id" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"banner_path" text,
	"banner_msg" text,
	"banner_file_id" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "colors" (
	"brand" text NOT NULL,
	"product_type" text NOT NULL,
	"hex" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "colors_brand_product_type_hex_pk" PRIMARY KEY("brand","product_type","hex")
);
--> statement-breakpoint
CREATE TABLE "location" (
	"id" text PRIMARY KEY NOT NULL,
	"store_name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"phone" text
);
--> statement-breakpoint
CREATE TABLE "page_section" (
	"id" text PRIMARY KEY NOT NULL,
	"page_name" text NOT NULL,
	"template_slug" text NOT NULL,
	"order" integer NOT NULL,
	"priority" text DEFAULT 'high',
	"data_source" text DEFAULT 'products',
	"config" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_availability" (
	"product_id" text NOT NULL,
	"location_id" text NOT NULL,
	"stock_count" integer DEFAULT 0 NOT NULL,
	"delivery_range_km" integer DEFAULT 100 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_types" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category_slug" text NOT NULL,
	"banner_path" text,
	"banner_msg" text,
	"banner_file_id" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"color_name" text NOT NULL,
	"hex" text NOT NULL,
	"main_image_path" text NOT NULL,
	"main_file_id" text,
	"gallery_paths" jsonb DEFAULT '[]'::jsonb,
	"gallery_file_ids" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"category_slug" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"description" text NOT NULL,
	"product_type" text NOT NULL,
	"price" integer NOT NULL,
	"discount_price" integer,
	"colors" jsonb DEFAULT '[]'::jsonb,
	"promotion_tag" text,
	"badge_tag" text,
	"stock_status" text DEFAULT 'in_stock' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_hero" boolean DEFAULT false NOT NULL,
	"main_image_path" text NOT NULL,
	"gallery_paths" jsonb,
	"hero_desktop_path" text,
	"hero_desktop_file_id" text,
	"hero_mobile_path" text,
	"hero_mobile_file_id" text,
	"specifications" jsonb NOT NULL,
	"in_the_box" jsonb NOT NULL,
	"offers" jsonb,
	"whatsapp_msg" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "section_template" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"schema_definition" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"value" text NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "tags_value_unique" UNIQUE("value")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_product_types" ADD CONSTRAINT "brand_product_types_brand_brands_slug_fk" FOREIGN KEY ("brand") REFERENCES "public"."brands"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "brand_product_types" ADD CONSTRAINT "brand_product_types_product_type_product_types_slug_fk" FOREIGN KEY ("product_type") REFERENCES "public"."product_types"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "colors" ADD CONSTRAINT "colors_brand_brands_slug_fk" FOREIGN KEY ("brand") REFERENCES "public"."brands"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "colors" ADD CONSTRAINT "colors_product_type_product_types_slug_fk" FOREIGN KEY ("product_type") REFERENCES "public"."product_types"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "page_section" ADD CONSTRAINT "page_section_template_slug_section_template_slug_fk" FOREIGN KEY ("template_slug") REFERENCES "public"."section_template"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_availability" ADD CONSTRAINT "product_availability_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_availability" ADD CONSTRAINT "product_availability_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_types" ADD CONSTRAINT "product_types_category_slug_categories_slug_fk" FOREIGN KEY ("category_slug") REFERENCES "public"."categories"("slug") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_slug_categories_slug_fk" FOREIGN KEY ("category_slug") REFERENCES "public"."categories"("slug") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_brand_brands_slug_fk" FOREIGN KEY ("brand") REFERENCES "public"."brands"("slug") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_product_type_product_types_slug_fk" FOREIGN KEY ("product_type") REFERENCES "public"."product_types"("slug") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_admin_idx" ON "audit_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "colors_name_idx" ON "colors" USING btree ("brand","product_type","name");--> statement-breakpoint
CREATE INDEX "availability_product_idx" ON "product_availability" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "availability_location_idx" ON "product_availability" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "product_slug_idx" ON "product" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_listing_filter_idx" ON "product" USING btree ("category_slug","product_type","brand","price","created_at");--> statement-breakpoint
CREATE INDEX "product_promo_idx" ON "product" USING btree ("promotion_tag","is_published");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");