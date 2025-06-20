-- CreateTable
CREATE TABLE "Topic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "topicId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Word_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WordPractice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wordId" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keystrokeTimes" TEXT NOT NULL,
    CONSTRAINT "WordPractice_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WordPracticeCompletion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wordPracticeId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "inputText" TEXT NOT NULL,
    "characterCount" INTEGER NOT NULL,
    "missCount" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "firstStrokeMs" INTEGER,
    "kpm" REAL,
    "rkpm" REAL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WordPracticeCompletion_wordPracticeId_fkey" FOREIGN KEY ("wordPracticeId") REFERENCES "WordPractice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PracticalPractice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PracticalPracticeCompletion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "practicalPracticeId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "characterCount" INTEGER NOT NULL,
    "missCount" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "firstStrokeMs" INTEGER,
    "kpm" REAL,
    "rkpm" REAL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PracticalPracticeCompletion_practicalPracticeId_fkey" FOREIGN KEY ("practicalPracticeId") REFERENCES "PracticalPractice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PracticalWordPractice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "practicalPracticeId" INTEGER NOT NULL,
    "wordPracticeId" INTEGER NOT NULL,
    "wordOrder" INTEGER NOT NULL,
    CONSTRAINT "PracticalWordPractice_practicalPracticeId_fkey" FOREIGN KEY ("practicalPracticeId") REFERENCES "PracticalPractice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PracticalWordPractice_wordPracticeId_fkey" FOREIGN KEY ("wordPracticeId") REFERENCES "WordPractice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WordPracticeCompletion_wordPracticeId_key" ON "WordPracticeCompletion"("wordPracticeId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticalPracticeCompletion_practicalPracticeId_key" ON "PracticalPracticeCompletion"("practicalPracticeId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticalWordPractice_practicalPracticeId_wordOrder_key" ON "PracticalWordPractice"("practicalPracticeId", "wordOrder");
