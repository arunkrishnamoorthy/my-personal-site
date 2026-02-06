-- AlterTable
ALTER TABLE "BlogPost" RENAME CONSTRAINT "Blog_pkey" TO "BlogPost_pkey";

-- AlterTable
ALTER TABLE "BlogPost" ALTER COLUMN "content" DROP DEFAULT;
ALTER TABLE "BlogPost" ALTER COLUMN "published_at" DROP DEFAULT;
ALTER TABLE "BlogPost" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "hls_encryption_key" VARCHAR(500),
ADD COLUMN     "hls_playlist_path" VARCHAR(500),
ADD COLUMN     "hls_storage_path" VARCHAR(500),
ADD COLUMN     "video_type" VARCHAR(20) NOT NULL DEFAULT 'youtube';

-- AlterTable
ALTER TABLE "Subscriber" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updated_at" DROP DEFAULT;

-- RenameIndex
ALTER INDEX "Blog_slug_key" RENAME TO "BlogPost_slug_key";
