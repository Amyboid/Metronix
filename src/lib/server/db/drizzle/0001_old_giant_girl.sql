CREATE TABLE "page_content" (
	"page_name" text NOT NULL,
	"field_key" text NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"field_type" text DEFAULT 'text' NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "page_content_page_name_field_key_pk" PRIMARY KEY("page_name","field_key")
);
--> statement-breakpoint
CREATE TABLE "page_draft" (
	"page_name" text NOT NULL,
	"field_key" text NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"field_type" text DEFAULT 'text' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "page_draft_page_name_field_key_pk" PRIMARY KEY("page_name","field_key")
);
--> statement-breakpoint
CREATE INDEX "page_content_page_idx" ON "page_content" USING btree ("page_name");--> statement-breakpoint
CREATE INDEX "page_draft_page_idx" ON "page_draft" USING btree ("page_name");