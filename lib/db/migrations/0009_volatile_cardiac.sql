CREATE TABLE IF NOT EXISTS "Program" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"programName" text NOT NULL,
	"universityName" text NOT NULL,
	"overview" text NOT NULL,
	"gpaRequirement" text,
	"greRequirement" text,
	"toeflRequirement" text,
	"ieltsRequirement" text,
	"requirementsSummary" text,
	"deadlineHint" text NOT NULL,
	"duration" text NOT NULL,
	"costHint" text NOT NULL,
	"highlight1" text NOT NULL,
	"highlight2" text NOT NULL,
	"highlight3" text,
	"officialLink" text,
	"imageUrls" json NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "SavedProgram" ADD COLUMN "matchScore" integer;--> statement-breakpoint
ALTER TABLE "SavedProgram" ADD COLUMN "choiceType" text;