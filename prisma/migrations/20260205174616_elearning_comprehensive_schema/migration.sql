-- ============================================================================
-- E-Learning Platform Comprehensive Schema Migration
-- Generated: 2026-02-05
-- This migration transforms the simple blog into a full e-learning platform
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Category table (shared by courses and blogs)
-- ============================================================================

CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- ============================================================================
-- STEP 2: Update User table
-- ============================================================================

-- Add auth fields and timestamps
ALTER TABLE "User" ADD COLUMN "clerk_id" VARCHAR(255);
ALTER TABLE "User" ADD COLUMN "azure_oid" VARCHAR(255);
ALTER TABLE "User" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create unique indexes for auth
CREATE UNIQUE INDEX "User_clerk_id_key" ON "User"("clerk_id");
CREATE UNIQUE INDEX "User_azure_oid_key" ON "User"("azure_oid");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_clerk_id_idx" ON "User"("clerk_id");
CREATE INDEX "User_azure_oid_idx" ON "User"("azure_oid");

-- ============================================================================
-- STEP 3: Rename and transform Blog table to BlogPost
-- ============================================================================

-- Rename Blog to BlogPost
ALTER TABLE "Blog" RENAME TO "BlogPost";

-- Add new columns to BlogPost
ALTER TABLE "BlogPost" ADD COLUMN "summary" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "content" TEXT NOT NULL DEFAULT '';
ALTER TABLE "BlogPost" ADD COLUMN "category_id" INTEGER;
ALTER TABLE "BlogPost" ADD COLUMN "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "BlogPost" ADD COLUMN "repository_id" INTEGER;
ALTER TABLE "BlogPost" ADD COLUMN "github_path" VARCHAR(1000);
ALTER TABLE "BlogPost" ADD COLUMN "commit_sha" VARCHAR(40);
ALTER TABLE "BlogPost" ADD COLUMN "last_synced_at" TIMESTAMP(3);
ALTER TABLE "BlogPost" ADD COLUMN "is_published" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "BlogPost" ADD COLUMN "is_draft" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "BlogPost" ADD COLUMN "read_time_mins" INTEGER;
ALTER TABLE "BlogPost" ADD COLUMN "meta_description" VARCHAR(500);
ALTER TABLE "BlogPost" ADD COLUMN "meta_keywords" VARCHAR(500);
ALTER TABLE "BlogPost" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "BlogPost" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update column types
ALTER TABLE "BlogPost" ALTER COLUMN "slug" TYPE VARCHAR(255);
ALTER TABLE "BlogPost" ALTER COLUMN "title" TYPE VARCHAR(500);
ALTER TABLE "BlogPost" ALTER COLUMN "view_count" SET DEFAULT 0;

-- Drop old updateAt column (typo) and add updated_at (already added above)
ALTER TABLE "BlogPost" DROP COLUMN IF EXISTS "updateAt";

-- Create indexes for BlogPost
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");
CREATE INDEX "BlogPost_category_id_idx" ON "BlogPost"("category_id");
CREATE INDEX "BlogPost_repository_id_idx" ON "BlogPost"("repository_id");
CREATE INDEX "BlogPost_is_published_published_at_idx" ON "BlogPost"("is_published", "published_at");
CREATE INDEX "BlogPost_commit_sha_idx" ON "BlogPost"("commit_sha");

-- ============================================================================
-- STEP 4: Update Subscriber table
-- ============================================================================

-- Update Subscriber table
ALTER TABLE "Subscriber" ALTER COLUMN "email" TYPE VARCHAR(255);
ALTER TABLE "Subscriber" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Subscriber" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create unique index for email
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");
CREATE INDEX "Subscriber_email_idx" ON "Subscriber"("email");

-- ============================================================================
-- STEP 5: Create Blog Repository and Sync tables
-- ============================================================================

CREATE TABLE "BlogRepository" (
    "id" SERIAL NOT NULL,
    "repo_owner" VARCHAR(255) NOT NULL,
    "repo_name" VARCHAR(255) NOT NULL,
    "branch" VARCHAR(100) NOT NULL DEFAULT 'main',
    "content_path" VARCHAR(500) NOT NULL DEFAULT '/',
    "github_token" VARCHAR(500),
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "auto_sync" BOOLEAN NOT NULL DEFAULT true,
    "sync_interval_mins" INTEGER NOT NULL DEFAULT 60,
    "webhook_secret" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_synced_at" TIMESTAMP(3),
    "last_sync_status" VARCHAR(50),
    "last_sync_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogRepository_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlogRepository_repo_owner_repo_name_branch_key" ON "BlogRepository"("repo_owner", "repo_name", "branch");
CREATE INDEX "BlogRepository_is_active_auto_sync_idx" ON "BlogRepository"("is_active", "auto_sync");

CREATE TABLE "BlogSyncLog" (
    "id" SERIAL NOT NULL,
    "repository_id" INTEGER NOT NULL,
    "sync_type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "posts_created" INTEGER NOT NULL DEFAULT 0,
    "posts_updated" INTEGER NOT NULL DEFAULT 0,
    "posts_deleted" INTEGER NOT NULL DEFAULT 0,
    "posts_failed" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "duration_ms" INTEGER,
    "triggered_by" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogSyncLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BlogSyncLog_repository_id_created_at_idx" ON "BlogSyncLog"("repository_id", "created_at");
CREATE INDEX "BlogSyncLog_status_idx" ON "BlogSyncLog"("status");

-- ============================================================================
-- STEP 6: Create Instructor tables
-- ============================================================================

CREATE TABLE "Instructor" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "bio" TEXT,
    "title" VARCHAR(255),
    "profile_image" VARCHAR(500),
    "email" VARCHAR(255),
    "linkedin_url" VARCHAR(500),
    "twitter_url" VARCHAR(500),
    "website_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Instructor_slug_key" ON "Instructor"("slug");
CREATE INDEX "Instructor_slug_idx" ON "Instructor"("slug");

CREATE TABLE "CourseInstructor" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "instructor_id" INTEGER NOT NULL,
    "role" VARCHAR(100) NOT NULL,
    "sequence_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseInstructor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseInstructor_course_id_instructor_id_key" ON "CourseInstructor"("course_id", "instructor_id");
CREATE INDEX "CourseInstructor_course_id_idx" ON "CourseInstructor"("course_id");
CREATE INDEX "CourseInstructor_instructor_id_idx" ON "CourseInstructor"("instructor_id");

-- ============================================================================
-- STEP 7: Create Course tables
-- ============================================================================

CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "difficulty_level" VARCHAR(50) NOT NULL,
    "category_id" INTEGER,
    "icon_text" VARCHAR(10),
    "tailwind_color" VARCHAR(50) NOT NULL,
    "thumbnail_url" VARCHAR(500),
    "total_units" INTEGER NOT NULL DEFAULT 0,
    "total_lessons" INTEGER NOT NULL DEFAULT 0,
    "total_duration_mins" INTEGER NOT NULL DEFAULT 0,
    "student_count" INTEGER NOT NULL DEFAULT 0,
    "course_type" VARCHAR(50) NOT NULL DEFAULT 'video',
    "mkdocs_repo_owner" VARCHAR(255),
    "mkdocs_repo_name" VARCHAR(255),
    "mkdocs_branch" VARCHAR(100) DEFAULT 'main',
    "mkdocs_site_url" VARCHAR(1000),
    "mkdocs_github_token" VARCHAR(500),
    "mkdocs_last_synced" TIMESTAMP(3),
    "is_free" BOOLEAN NOT NULL DEFAULT true,
    "price" DECIMAL(10,2),
    "currency" VARCHAR(3),
    "max_enrollments" INTEGER,
    "avg_rating" DECIMAL(3,2),
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "sequence_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
CREATE INDEX "Course_slug_idx" ON "Course"("slug");
CREATE INDEX "Course_category_id_idx" ON "Course"("category_id");
CREATE INDEX "Course_is_published_sequence_order_idx" ON "Course"("is_published", "sequence_order");
CREATE INDEX "Course_course_type_idx" ON "Course"("course_type");

CREATE TABLE "CoursePrerequisite" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "prerequisite_text" VARCHAR(500) NOT NULL,
    "sequence_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CoursePrerequisite_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CoursePrerequisite_course_id_idx" ON "CoursePrerequisite"("course_id");

CREATE TABLE "CourseTargetRole" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "role_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "CourseTargetRole_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CourseTargetRole_course_id_idx" ON "CourseTargetRole"("course_id");

CREATE TABLE "CourseLearningObjective" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "objective_text" VARCHAR(500) NOT NULL,
    "sequence_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CourseLearningObjective_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CourseLearningObjective_course_id_idx" ON "CourseLearningObjective"("course_id");

-- ============================================================================
-- STEP 8: Create Unit tables
-- ============================================================================

CREATE TABLE "Unit" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "sequence_order" INTEGER NOT NULL DEFAULT 0,
    "total_lessons" INTEGER NOT NULL DEFAULT 0,
    "total_duration_mins" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Unit_course_id_slug_key" ON "Unit"("course_id", "slug");
CREATE INDEX "Unit_course_id_sequence_order_idx" ON "Unit"("course_id", "sequence_order");

CREATE TABLE "UnitObjective" (
    "id" SERIAL NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "objective_text" VARCHAR(500) NOT NULL,
    "sequence_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UnitObjective_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UnitObjective_unit_id_idx" ON "UnitObjective"("unit_id");

-- ============================================================================
-- STEP 9: Create Lesson tables
-- ============================================================================

CREATE TABLE "Lesson" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "sequence_order" INTEGER NOT NULL DEFAULT 0,
    "youtube_id" VARCHAR(100),
    "video_duration_mins" INTEGER DEFAULT 0,
    "chapter_url" VARCHAR(1000),
    "has_code_editor" BOOLEAN NOT NULL DEFAULT false,
    "editor_type" VARCHAR(50),
    "editor_content" TEXT,
    "mkdocs_content" TEXT,
    "mkdocs_file_path" VARCHAR(1000),
    "mkdocs_commit_sha" VARCHAR(40),
    "external_url" VARCHAR(1000),
    "iframe_allowed" BOOLEAN NOT NULL DEFAULT false,
    "is_preview" BOOLEAN NOT NULL DEFAULT false,
    "lesson_type" VARCHAR(50) NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Lesson_unit_id_slug_key" ON "Lesson"("unit_id", "slug");
CREATE INDEX "Lesson_course_id_idx" ON "Lesson"("course_id");
CREATE INDEX "Lesson_unit_id_sequence_order_idx" ON "Lesson"("unit_id", "sequence_order");
CREATE INDEX "Lesson_is_preview_idx" ON "Lesson"("is_preview");
CREATE INDEX "Lesson_lesson_type_idx" ON "Lesson"("lesson_type");

CREATE TABLE "LessonTakeaway" (
    "id" SERIAL NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "takeaway_text" VARCHAR(1000) NOT NULL,
    "sequence_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LessonTakeaway_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LessonTakeaway_lesson_id_idx" ON "LessonTakeaway"("lesson_id");

CREATE TABLE "LessonResource" (
    "id" SERIAL NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "resource_title" VARCHAR(255) NOT NULL,
    "resource_type" VARCHAR(50) NOT NULL,
    "file_url" VARCHAR(1000) NOT NULL,
    "file_size_kb" INTEGER,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonResource_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LessonResource_lesson_id_idx" ON "LessonResource"("lesson_id");

CREATE TABLE "CourseSyncLog" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "sync_type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "lessons_created" INTEGER NOT NULL DEFAULT 0,
    "lessons_updated" INTEGER NOT NULL DEFAULT 0,
    "lessons_deleted" INTEGER NOT NULL DEFAULT 0,
    "lessons_failed" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "duration_ms" INTEGER,
    "triggered_by" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseSyncLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CourseSyncLog_course_id_created_at_idx" ON "CourseSyncLog"("course_id", "created_at");
CREATE INDEX "CourseSyncLog_status_idx" ON "CourseSyncLog"("status");

-- ============================================================================
-- STEP 10: Create Quiz tables
-- ============================================================================

CREATE TABLE "Quiz" (
    "id" SERIAL NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "passing_score" INTEGER NOT NULL DEFAULT 70,
    "max_attempts" INTEGER,
    "time_limit_mins" INTEGER,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Quiz_lesson_id_idx" ON "Quiz"("lesson_id");

CREATE TABLE "QuizQuestion" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" VARCHAR(50) NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "sequence_order" INTEGER NOT NULL DEFAULT 0,
    "explanation" TEXT,
    "times_answered" INTEGER NOT NULL DEFAULT 0,
    "times_correct" INTEGER NOT NULL DEFAULT 0,
    "avg_time_secs" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "QuizQuestion_quiz_id_sequence_order_idx" ON "QuizQuestion"("quiz_id", "sequence_order");

CREATE TABLE "QuizOption" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "option_text" VARCHAR(1000) NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "sequence_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuizOption_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "QuizOption_question_id_idx" ON "QuizOption"("question_id");

-- ============================================================================
-- STEP 11: Create User Progress & Enrollment tables
-- ============================================================================

CREATE TABLE "Enrollment" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "enrollment_status" VARCHAR(50) NOT NULL,
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "last_accessed_at" TIMESTAMP(3),

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Enrollment_user_id_course_id_key" ON "Enrollment"("user_id", "course_id");
CREATE INDEX "Enrollment_user_id_idx" ON "Enrollment"("user_id");
CREATE INDEX "Enrollment_course_id_idx" ON "Enrollment"("course_id");

CREATE TABLE "LessonProgress" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "watch_duration_secs" INTEGER NOT NULL DEFAULT 0,
    "last_position_secs" INTEGER NOT NULL DEFAULT 0,
    "replay_count" INTEGER NOT NULL DEFAULT 0,
    "speed_preference" DECIMAL(3,2),
    "dropped_at_secs" INTEGER,
    "quiz_passed" BOOLEAN NOT NULL DEFAULT false,
    "quiz_attempts" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "last_accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LessonProgress_user_id_lesson_id_key" ON "LessonProgress"("user_id", "lesson_id");
CREATE INDEX "LessonProgress_user_id_idx" ON "LessonProgress"("user_id");
CREATE INDEX "LessonProgress_lesson_id_idx" ON "LessonProgress"("lesson_id");
CREATE INDEX "LessonProgress_is_completed_idx" ON "LessonProgress"("is_completed");

CREATE TABLE "QuizAttempt" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "score" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL,
    "percentage" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "time_taken_mins" INTEGER,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "QuizAttempt_user_id_quiz_id_idx" ON "QuizAttempt"("user_id", "quiz_id");
CREATE INDEX "QuizAttempt_quiz_id_idx" ON "QuizAttempt"("quiz_id");

CREATE TABLE "QuizAnswer" (
    "id" SERIAL NOT NULL,
    "attempt_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "selected_option_id" INTEGER,
    "answer_text" TEXT,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "QuizAnswer_attempt_id_question_id_key" ON "QuizAnswer"("attempt_id", "question_id");
CREATE INDEX "QuizAnswer_attempt_id_idx" ON "QuizAnswer"("attempt_id");

-- ============================================================================
-- STEP 12: Create Community & Engagement tables
-- ============================================================================

CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "author_name" VARCHAR(255) NOT NULL,
    "author_email" VARCHAR(255),
    "content" TEXT NOT NULL,
    "parent_comment_id" INTEGER,
    "video_timestamp_secs" INTEGER,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Comment_lesson_id_created_at_idx" ON "Comment"("lesson_id", "created_at");
CREATE INDEX "Comment_parent_comment_id_idx" ON "Comment"("parent_comment_id");
CREATE INDEX "Comment_user_id_idx" ON "Comment"("user_id");

CREATE TABLE "CourseReview" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "review_title" VARCHAR(255),
    "review_text" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseReview_user_id_course_id_key" ON "CourseReview"("user_id", "course_id");
CREATE INDEX "CourseReview_course_id_rating_idx" ON "CourseReview"("course_id", "rating");
CREATE INDEX "CourseReview_user_id_idx" ON "CourseReview"("user_id");

-- ============================================================================
-- STEP 13: Create Analytics tables
-- ============================================================================

CREATE TABLE "SearchQuery" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "query_text" VARCHAR(500) NOT NULL,
    "results_count" INTEGER NOT NULL DEFAULT 0,
    "search_type" VARCHAR(50) NOT NULL,
    "clicked_result_id" INTEGER,
    "clicked_result_type" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SearchQuery_query_text_idx" ON "SearchQuery"("query_text");
CREATE INDEX "SearchQuery_created_at_idx" ON "SearchQuery"("created_at");
CREATE INDEX "SearchQuery_user_id_idx" ON "SearchQuery"("user_id");

-- ============================================================================
-- STEP 14: Add Foreign Key Constraints
-- ============================================================================

-- BlogPost foreign keys
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_repository_id_fkey"
    FOREIGN KEY ("repository_id") REFERENCES "BlogRepository"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CourseInstructor foreign keys
ALTER TABLE "CourseInstructor" ADD CONSTRAINT "CourseInstructor_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseInstructor" ADD CONSTRAINT "CourseInstructor_instructor_id_fkey"
    FOREIGN KEY ("instructor_id") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Course foreign keys
ALTER TABLE "Course" ADD CONSTRAINT "Course_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseTargetRole" ADD CONSTRAINT "CourseTargetRole_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseLearningObjective" ADD CONSTRAINT "CourseLearningObjective_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Unit foreign keys
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UnitObjective" ADD CONSTRAINT "UnitObjective_unit_id_fkey"
    FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Lesson foreign keys
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_unit_id_fkey"
    FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LessonTakeaway" ADD CONSTRAINT "LessonTakeaway_lesson_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LessonResource" ADD CONSTRAINT "LessonResource_lesson_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Quiz foreign keys
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_lesson_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quiz_id_fkey"
    FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuizOption" ADD CONSTRAINT "QuizOption_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enrollment foreign keys
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- LessonProgress foreign keys
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lesson_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- QuizAttempt foreign keys
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quiz_id_fkey"
    FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_attempt_id_fkey"
    FOREIGN KEY ("attempt_id") REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Comment foreign keys
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_lesson_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parent_comment_id_fkey"
    FOREIGN KEY ("parent_comment_id") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CourseReview foreign keys
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SearchQuery foreign keys
ALTER TABLE "SearchQuery" ADD CONSTRAINT "SearchQuery_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- STEP 15: Data Migration - Migrate old Blog category strings to Category table
-- ============================================================================

-- Insert unique categories from old Blog.category field into Category table
INSERT INTO "Category" ("name", "slug", "created_at", "updated_at")
SELECT DISTINCT
    "category" as name,
    LOWER(REPLACE("category", ' ', '-')) as slug,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at
FROM "BlogPost"
WHERE "category" IS NOT NULL
ON CONFLICT ("name") DO NOTHING;

-- Update BlogPost to link to Category table
UPDATE "BlogPost" bp
SET "category_id" = c."id"
FROM "Category" c
WHERE bp."category" = c."name";

-- Mark existing blog posts as published
UPDATE "BlogPost"
SET "is_published" = true
WHERE "category_id" IS NOT NULL;

-- Drop the old category column
ALTER TABLE "BlogPost" DROP COLUMN "category";

-- ============================================================================
-- Migration Complete!
-- Total Tables Created: 25
-- - 1 Category (shared)
-- - 3 Blog tables (BlogPost, BlogRepository, BlogSyncLog)
-- - 1 Subscriber (updated)
-- - 2 Instructor tables
-- - 8 Course tables (Course + related)
-- - 3 Unit tables
-- - 4 Lesson tables
-- - 4 Quiz tables
-- - 4 Progress tables
-- - 2 Community tables (Comment, CourseReview)
-- - 1 Analytics table (SearchQuery)
-- ============================================================================
