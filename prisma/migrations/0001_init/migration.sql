-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "PortraitAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "PortraitAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortraitSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortraitSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortraitUser" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "PortraitUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortraitVerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PortraitSessionRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "portraits" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortraitSessionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortraitAccount_provider_providerAccountId_key" ON "PortraitAccount"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "PortraitSession_sessionToken_key" ON "PortraitSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "PortraitUser_email_key" ON "PortraitUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PortraitVerificationToken_token_key" ON "PortraitVerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PortraitVerificationToken_identifier_token_key" ON "PortraitVerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "PortraitAccount" ADD CONSTRAINT "PortraitAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PortraitUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortraitSession" ADD CONSTRAINT "PortraitSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PortraitUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortraitSessionRecord" ADD CONSTRAINT "PortraitSessionRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PortraitUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

