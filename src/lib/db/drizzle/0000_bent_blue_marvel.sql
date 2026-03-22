CREATE TABLE "demo_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Anonymous' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
