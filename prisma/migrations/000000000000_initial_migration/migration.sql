-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wiki" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "cfRay" TEXT NOT NULL,
    "forced" BOOLEAN NOT NULL,
    "speedscopeData" BLOB NOT NULL,
    "parserReport" TEXT,
    "environment" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AggregatedProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "profileCount" INTEGER NOT NULL,
    "speedscopeData" BLOB NOT NULL,
    "frameTimingData" BLOB NOT NULL
);

-- CreateIndex
CREATE INDEX "Profile_timestamp_idx" ON "Profile"("timestamp");

-- CreateIndex
CREATE INDEX "Profile_wiki_idx" ON "Profile"("wiki");

-- CreateIndex
CREATE INDEX "Profile_url_idx" ON "Profile"("url");

-- CreateIndex
CREATE INDEX "Profile_cfRay_idx" ON "Profile"("cfRay");

-- CreateIndex
CREATE INDEX "Profile_forced_idx" ON "Profile"("forced");

-- CreateIndex
CREATE INDEX "Profile_environment_idx" ON "Profile"("environment");

-- CreateIndex
CREATE INDEX "AggregatedProfile_type_idx" ON "AggregatedProfile"("type");

