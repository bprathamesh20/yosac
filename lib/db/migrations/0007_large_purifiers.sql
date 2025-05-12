CREATE TABLE IF NOT EXISTS "StudentProfile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"targetMajor" varchar(64),
	"targetTerm" varchar(32),
	"college" varchar(128),
	"undergradMajor" varchar(64),
	"greQuantScore" integer,
	"greVerbalScore" integer,
	"greAwaScore" numeric,
	"cgpa" numeric,
	"toeflScore" integer,
	"ielts" varchar(16),
	"workExpMonths" integer,
	"publications" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
