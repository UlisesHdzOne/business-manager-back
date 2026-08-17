-- DropIndex
DROP INDEX "Book_title_key";

CREATE UNIQUE INDEX "Book_title_lower_key"
ON "Book" (LOWER("title"));