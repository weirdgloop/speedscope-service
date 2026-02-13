/*
  Warnings:

  - Added the required column `frameTimesData` to the `AggregatedProfile` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AggregatedProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "profileCount" INTEGER NOT NULL,
    "speedscopeData" BLOB NOT NULL,
    "frameTimesData" BLOB NOT NULL
);
INSERT INTO "new_AggregatedProfile" ("endTime", "id", "profileCount", "speedscopeData", "startTime", "type") SELECT "endTime", "id", "profileCount", "speedscopeData", "startTime", "type" FROM "AggregatedProfile";
DROP TABLE "AggregatedProfile";
ALTER TABLE "new_AggregatedProfile" RENAME TO "AggregatedProfile";
CREATE INDEX "AggregatedProfile_type_idx" ON "AggregatedProfile"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
