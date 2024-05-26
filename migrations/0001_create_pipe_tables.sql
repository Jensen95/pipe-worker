-- CreateTable
CREATE TABLE "Hook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "calledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "headers" TEXT NOT NULL,
    "body" TEXT,
    "collectionUrl" TEXT NOT NULL,
    "pipeId" TEXT,
    CONSTRAINT "Hook_collectionUrl_fkey" FOREIGN KEY ("collectionUrl") REFERENCES "HookCollection" ("url") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hook_pipeId_fkey" FOREIGN KEY ("pipeId") REFERENCES "Pipe" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HookCollection" (
    "url" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Pipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "response" TEXT,
    "responseHeaders" TEXT NOT NULL,
    "statusCode" INTEGER,
    "callTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseTimestamp" DATETIME,
    "url" TEXT NOT NULL,
    "collectionUrl" TEXT NOT NULL,
    "pipeCollectionUrl" TEXT,
    CONSTRAINT "Pipe_collectionUrl_fkey" FOREIGN KEY ("collectionUrl") REFERENCES "HookCollection" ("url") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pipe_pipeCollectionUrl_fkey" FOREIGN KEY ("pipeCollectionUrl") REFERENCES "PipeCollection" ("url") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PipeCollection" (
    "url" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Hook_pipeId_key" ON "Hook"("pipeId");

-- CreateIndex
CREATE UNIQUE INDEX "HookCollection_url_key" ON "HookCollection"("url");

-- CreateIndex
CREATE UNIQUE INDEX "PipeCollection_url_key" ON "PipeCollection"("url");
