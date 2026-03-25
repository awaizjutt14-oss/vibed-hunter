-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('RSS', 'NEWS_API', 'REDDIT', 'YOUTUBE', 'GOOGLE_TRENDS', 'SITEMAP', 'CUSTOM', 'MANUAL');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('ACTIVE', 'DISMISSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PacketStatus" AS ENUM ('DRAFT', 'READY', 'EXPORTED', 'FAILED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('HOOK', 'CAPTION', 'SCRIPT', 'CAROUSEL', 'THUMBNAIL', 'CTA', 'KEYWORDS', 'RISK_NOTE');

-- CreateTable
CREATE TABLE "BrainProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Vibed Brain',
    "versionLabel" TEXT NOT NULL DEFAULT 'Default',
    "preferredTraits" TEXT[],
    "dislikedTraits" TEXT[],
    "hookPreferences" JSONB NOT NULL,
    "captionDNA" JSONB NOT NULL,
    "tasteProfile" JSONB NOT NULL,
    "rejectionRules" TEXT[],
    "tieBreakWeights" JSONB NOT NULL,
    "approvedSources" JSONB,
    "topicHistory" JSONB,
    "postOutcomes" JSONB,
    "driftAlerts" JSONB,
    "pendingPatterns" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrainProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstagramAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "igUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "accountType" TEXT,
    "accessToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "permissions" TEXT[],
    "lastSyncedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'connected',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstagramAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstagramMedia" (
    "id" TEXT NOT NULL,
    "igId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "caption" TEXT,
    "mediaType" TEXT,
    "mediaUrl" TEXT,
    "permalink" TEXT,
    "timestamp" TIMESTAMP(3),
    "likeCount" INTEGER,
    "commentCount" INTEGER,
    "viewCount" INTEGER,
    "reach" INTEGER,
    "saves" INTEGER,
    "plays" INTEGER,
    "impressions" INTEGER,
    "insightsRaw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstagramMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrainFeedback" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "reasons" TEXT[],
    "profileSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrainFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrainExample" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "quality" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrainExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "niches" TEXT[],
    "bannedTopics" TEXT[],
    "preferredTone" TEXT NOT NULL DEFAULT 'premium',
    "targetAudienceCountry" TEXT NOT NULL DEFAULT 'US',
    "platformFocus" TEXT[],
    "captionStyle" TEXT NOT NULL DEFAULT 'punchy',
    "minimumOriginalityScore" INTEGER NOT NULL DEFAULT 65,
    "preferredPostingTimes" TEXT[],
    "brandVoiceExamples" TEXT[],
    "contentLengthPreferences" JSONB,
    "scoringWeights" JSONB,
    "highConfidenceOnly" BOOLEAN NOT NULL DEFAULT false,
    "dailyDigestEnabled" BOOLEAN NOT NULL DEFAULT true,
    "digestEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "url" TEXT NOT NULL,
    "region" TEXT,
    "language" TEXT DEFAULT 'en',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "connectorKey" TEXT NOT NULL,
    "tags" TEXT[],
    "pollingMinutes" INTEGER NOT NULL DEFAULT 60,
    "lastFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceItem" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "url" TEXT NOT NULL,
    "publishTime" TIMESTAMP(3),
    "topicTags" TEXT[],
    "region" TEXT,
    "language" TEXT DEFAULT 'en',
    "engagementSignals" JSONB,
    "rawSummary" TEXT,
    "metadata" JSONB,
    "clusterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicCluster" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "canonicalTitle" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "whyNow" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "region" TEXT,
    "language" TEXT DEFAULT 'en',
    "sourceCount" INTEGER NOT NULL DEFAULT 0,
    "bestPlatform" TEXT,
    "publishUrgency" TEXT NOT NULL DEFAULT 'medium',
    "status" "TopicStatus" NOT NULL DEFAULT 'ACTIVE',
    "dedupeFingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendScore" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "freshnessScore" DOUBLE PRECISION NOT NULL,
    "momentumScore" DOUBLE PRECISION NOT NULL,
    "audienceFitScore" DOUBLE PRECISION NOT NULL,
    "originalityPotential" DOUBLE PRECISION NOT NULL,
    "visualContentScore" DOUBLE PRECISION NOT NULL,
    "postabilityScore" DOUBLE PRECISION NOT NULL,
    "noveltyScore" DOUBLE PRECISION NOT NULL,
    "sourceDiversityScore" DOUBLE PRECISION NOT NULL,
    "emotionalPullScore" DOUBLE PRECISION NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "explanation" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrendScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPacket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "status" "PacketStatus" NOT NULL DEFAULT 'DRAFT',
    "conciseSummary" TEXT NOT NULL,
    "originalityNote" TEXT NOT NULL,
    "whyTrending" TEXT NOT NULL,
    "bestPlatform" TEXT NOT NULL,
    "publishTiming" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "sourceCitations" JSONB NOT NULL,
    "guardrailNotes" JSONB NOT NULL,
    "packetJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPacket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedAsset" (
    "id" TEXT NOT NULL,
    "packetId" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "platform" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordWatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeywordWatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigestRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sentTo" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "summary" TEXT,
    "packetIds" TEXT[],
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "DigestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedIdea" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "jobType" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "queueName" TEXT NOT NULL,
    "payload" JSONB,
    "result" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrainProfile_isActive_idx" ON "BrainProfile"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "InstagramAccount_igUserId_key" ON "InstagramAccount"("igUserId");

-- CreateIndex
CREATE UNIQUE INDEX "InstagramMedia_igId_key" ON "InstagramMedia"("igId");

-- CreateIndex
CREATE INDEX "InstagramMedia_accountId_timestamp_idx" ON "InstagramMedia"("accountId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "BrainFeedback_opportunityId_key" ON "BrainFeedback"("opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "Source_userId_isActive_idx" ON "Source"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Source_sourceType_url_key" ON "Source"("sourceType", "url");

-- CreateIndex
CREATE UNIQUE INDEX "SourceItem_dedupeKey_key" ON "SourceItem"("dedupeKey");

-- CreateIndex
CREATE INDEX "SourceItem_sourceId_publishTime_idx" ON "SourceItem"("sourceId", "publishTime");

-- CreateIndex
CREATE INDEX "SourceItem_clusterId_idx" ON "SourceItem"("clusterId");

-- CreateIndex
CREATE INDEX "SourceItem_title_publishTime_idx" ON "SourceItem"("title", "publishTime");

-- CreateIndex
CREATE UNIQUE INDEX "TopicCluster_slug_key" ON "TopicCluster"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TopicCluster_dedupeFingerprint_key" ON "TopicCluster"("dedupeFingerprint");

-- CreateIndex
CREATE INDEX "TopicCluster_status_updatedAt_idx" ON "TopicCluster"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "TopicCluster_niche_updatedAt_idx" ON "TopicCluster"("niche", "updatedAt");

-- CreateIndex
CREATE INDEX "TrendScore_clusterId_finalScore_idx" ON "TrendScore"("clusterId", "finalScore");

-- CreateIndex
CREATE INDEX "TrendScore_createdAt_idx" ON "TrendScore"("createdAt");

-- CreateIndex
CREATE INDEX "ContentPacket_userId_createdAt_idx" ON "ContentPacket"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ContentPacket_clusterId_idx" ON "ContentPacket"("clusterId");

-- CreateIndex
CREATE INDEX "GeneratedAsset_packetId_type_idx" ON "GeneratedAsset"("packetId", "type");

-- CreateIndex
CREATE INDEX "KeywordWatch_userId_isActive_idx" ON "KeywordWatch"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "KeywordWatch_userId_keyword_key" ON "KeywordWatch"("userId", "keyword");

-- CreateIndex
CREATE INDEX "DigestRun_userId_generatedAt_idx" ON "DigestRun"("userId", "generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedIdea_userId_clusterId_key" ON "SavedIdea"("userId", "clusterId");

-- CreateIndex
CREATE INDEX "JobRun_jobType_createdAt_idx" ON "JobRun"("jobType", "createdAt");

-- CreateIndex
CREATE INDEX "JobRun_status_createdAt_idx" ON "JobRun"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceItem" ADD CONSTRAINT "SourceItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceItem" ADD CONSTRAINT "SourceItem_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "TopicCluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendScore" ADD CONSTRAINT "TrendScore_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "TopicCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPacket" ADD CONSTRAINT "ContentPacket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPacket" ADD CONSTRAINT "ContentPacket_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "TopicCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedAsset" ADD CONSTRAINT "GeneratedAsset_packetId_fkey" FOREIGN KEY ("packetId") REFERENCES "ContentPacket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordWatch" ADD CONSTRAINT "KeywordWatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigestRun" ADD CONSTRAINT "DigestRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedIdea" ADD CONSTRAINT "SavedIdea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedIdea" ADD CONSTRAINT "SavedIdea_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "TopicCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRun" ADD CONSTRAINT "JobRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

