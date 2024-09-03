-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bio" TEXT NOT NULL,
    "hasOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "profileContext" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "useAzureOpenai" BOOLEAN NOT NULL,
    "username" TEXT NOT NULL,
    "anthropicApiKey" TEXT,
    "azureOpenai35TurboId" TEXT,
    "azureOpenai45TurboId" TEXT,
    "azureOpenai45VisionId" TEXT,
    "azureOpenaiApiKey" TEXT,
    "azureOpenaiEmbeddingsId" TEXT,
    "azureOpenaiEndpoint" TEXT,
    "googleGeminiApiKey" TEXT,
    "groqApiKey" TEXT,
    "mistralApiKey" TEXT,
    "openaiApiKey" TEXT,
    "openaiOrganizationId" TEXT,
    "openrouterApiKey" TEXT,
    "perplexityApiKey" TEXT,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sharing" TEXT NOT NULL DEFAULT 'private',
    "defaultContextLength" INTEGER NOT NULL,
    "defaultModel" TEXT NOT NULL,
    "defaultPrompt" TEXT NOT NULL,
    "defaultTemperature" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "embeddingsProvider" TEXT NOT NULL,
    "includeProfileContext" BOOLEAN NOT NULL,
    "includeWorkspaceInstructions" BOOLEAN NOT NULL,
    "instructions" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL DEFAULT '',
    "isHome" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    CONSTRAINT "Workspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "Folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Folder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sharing" TEXT NOT NULL DEFAULT 'private',
    "description" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "tokens" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FileWorkspace" (
    "userId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("fileId", "workspaceId"),
    CONSTRAINT "FileWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FileWorkspace_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FileWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FileItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sharing" TEXT NOT NULL DEFAULT 'private',
    "content" TEXT NOT NULL,
    "localEmbedding" TEXT,
    "openaiEmbedding" TEXT,
    "tokens" INTEGER NOT NULL,
    CONSTRAINT "FileItem_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FileItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Preset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sharing" TEXT NOT NULL DEFAULT 'private',
    "contextLength" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "embeddingsProvider" TEXT NOT NULL,
    "includeProfileContext" BOOLEAN NOT NULL,
    "includeWorkspaceInstructions" BOOLEAN NOT NULL,
    "model" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "temperature" REAL NOT NULL,
    CONSTRAINT "Preset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Preset_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PresetWorkspace" (
    "userId" TEXT NOT NULL,
    "presetId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("presetId", "workspaceId"),
    CONSTRAINT "PresetWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PresetWorkspace_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "Preset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PresetWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assistant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sharing" TEXT NOT NULL DEFAULT 'private',
    "contextLength" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "embeddingsProvider" TEXT NOT NULL,
    "includeProfileContext" BOOLEAN NOT NULL,
    "includeWorkspaceInstructions" BOOLEAN NOT NULL,
    "model" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "temperature" REAL NOT NULL,
    CONSTRAINT "Assistant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assistant_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssistantWorkspace" (
    "userId" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("assistantId", "workspaceId"),
    CONSTRAINT "AssistantWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssistantWorkspace_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssistantWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "assistantId" TEXT,
    "folderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sharing" TEXT NOT NULL DEFAULT 'private',
    "contextLength" INTEGER NOT NULL,
    "embeddingsProvider" TEXT NOT NULL,
    "includeProfileContext" BOOLEAN NOT NULL,
    "includeWorkspaceInstructions" BOOLEAN NOT NULL,
    "model" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "temperature" REAL NOT NULL,
    CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Chat_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Chat_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Chat_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatFile" (
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("chatId", "fileId"),
    CONSTRAINT "ChatFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatFile_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assistantId" TEXT,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageImagePath" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageImagePath_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageFileItem" (
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileItemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("messageId", "fileItemId"),
    CONSTRAINT "MessageFileItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MessageFileItem_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MessageFileItem_fileItemId_fkey" FOREIGN KEY ("fileItemId") REFERENCES "FileItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sharing" TEXT NOT NULL DEFAULT 'private',
    "content" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Prompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prompt_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PromptWorkspace" (
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("promptId", "workspaceId"),
    CONSTRAINT "PromptWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PromptWorkspace_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PromptWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sharing" TEXT NOT NULL DEFAULT 'private',
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Collection_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CollectionWorkspace" (
    "userId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("collectionId", "workspaceId"),
    CONSTRAINT "CollectionWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionWorkspace_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CollectionFile" (
    "userId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("collectionId", "fileId"),
    CONSTRAINT "CollectionFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionFile_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssistantFile" (
    "userId" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("assistantId", "fileId"),
    CONSTRAINT "AssistantFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssistantFile_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssistantFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssistantCollection" (
    "userId" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("assistantId", "collectionId"),
    CONSTRAINT "AssistantCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssistantCollection_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssistantCollection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sharing" TEXT NOT NULL DEFAULT 'private',
    "customHeaders" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schema" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "Tool_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Tool_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ToolWorkspace" (
    "userId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("toolId", "workspaceId"),
    CONSTRAINT "ToolWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ToolWorkspace_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ToolWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssistantTool" (
    "userId" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("assistantId", "toolId"),
    CONSTRAINT "AssistantTool_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssistantTool_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssistantTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");

-- CreateIndex
CREATE INDEX "Profile_userId_idx" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Workspace_userId_idx" ON "Workspace"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_userId_isHome_key" ON "Workspace"("userId", "isHome");

-- CreateIndex
CREATE INDEX "Folder_userId_idx" ON "Folder"("userId");

-- CreateIndex
CREATE INDEX "Folder_workspaceId_idx" ON "Folder"("workspaceId");

-- CreateIndex
CREATE INDEX "File_userId_idx" ON "File"("userId");

-- CreateIndex
CREATE INDEX "File_folderId_idx" ON "File"("folderId");

-- CreateIndex
CREATE INDEX "FileWorkspace_userId_idx" ON "FileWorkspace"("userId");

-- CreateIndex
CREATE INDEX "FileWorkspace_fileId_idx" ON "FileWorkspace"("fileId");

-- CreateIndex
CREATE INDEX "FileWorkspace_workspaceId_idx" ON "FileWorkspace"("workspaceId");

-- CreateIndex
CREATE INDEX "FileItem_fileId_idx" ON "FileItem"("fileId");

-- CreateIndex
CREATE INDEX "FileItem_userId_idx" ON "FileItem"("userId");

-- CreateIndex
CREATE INDEX "Preset_userId_idx" ON "Preset"("userId");

-- CreateIndex
CREATE INDEX "PresetWorkspace_userId_idx" ON "PresetWorkspace"("userId");

-- CreateIndex
CREATE INDEX "PresetWorkspace_presetId_idx" ON "PresetWorkspace"("presetId");

-- CreateIndex
CREATE INDEX "PresetWorkspace_workspaceId_idx" ON "PresetWorkspace"("workspaceId");

-- CreateIndex
CREATE INDEX "Assistant_userId_idx" ON "Assistant"("userId");

-- CreateIndex
CREATE INDEX "AssistantWorkspace_userId_idx" ON "AssistantWorkspace"("userId");

-- CreateIndex
CREATE INDEX "AssistantWorkspace_assistantId_idx" ON "AssistantWorkspace"("assistantId");

-- CreateIndex
CREATE INDEX "AssistantWorkspace_workspaceId_idx" ON "AssistantWorkspace"("workspaceId");

-- CreateIndex
CREATE INDEX "Chat_userId_idx" ON "Chat"("userId");

-- CreateIndex
CREATE INDEX "Chat_workspaceId_idx" ON "Chat"("workspaceId");

-- CreateIndex
CREATE INDEX "ChatFile_chatId_idx" ON "ChatFile"("chatId");

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE INDEX "MessageImagePath_messageId_idx" ON "MessageImagePath"("messageId");

-- CreateIndex
CREATE INDEX "MessageFileItem_messageId_idx" ON "MessageFileItem"("messageId");

-- CreateIndex
CREATE INDEX "Prompt_userId_idx" ON "Prompt"("userId");

-- CreateIndex
CREATE INDEX "PromptWorkspace_userId_idx" ON "PromptWorkspace"("userId");

-- CreateIndex
CREATE INDEX "PromptWorkspace_promptId_idx" ON "PromptWorkspace"("promptId");

-- CreateIndex
CREATE INDEX "PromptWorkspace_workspaceId_idx" ON "PromptWorkspace"("workspaceId");

-- CreateIndex
CREATE INDEX "Collection_userId_idx" ON "Collection"("userId");

-- CreateIndex
CREATE INDEX "CollectionWorkspace_userId_idx" ON "CollectionWorkspace"("userId");

-- CreateIndex
CREATE INDEX "CollectionWorkspace_collectionId_idx" ON "CollectionWorkspace"("collectionId");

-- CreateIndex
CREATE INDEX "CollectionWorkspace_workspaceId_idx" ON "CollectionWorkspace"("workspaceId");

-- CreateIndex
CREATE INDEX "CollectionFile_collectionId_idx" ON "CollectionFile"("collectionId");

-- CreateIndex
CREATE INDEX "CollectionFile_fileId_idx" ON "CollectionFile"("fileId");

-- CreateIndex
CREATE INDEX "AssistantFile_assistantId_idx" ON "AssistantFile"("assistantId");

-- CreateIndex
CREATE INDEX "AssistantFile_fileId_idx" ON "AssistantFile"("fileId");

-- CreateIndex
CREATE INDEX "AssistantCollection_assistantId_idx" ON "AssistantCollection"("assistantId");

-- CreateIndex
CREATE INDEX "AssistantCollection_collectionId_idx" ON "AssistantCollection"("collectionId");

-- CreateIndex
CREATE INDEX "Tool_userId_idx" ON "Tool"("userId");

-- CreateIndex
CREATE INDEX "ToolWorkspace_toolId_idx" ON "ToolWorkspace"("toolId");

-- CreateIndex
CREATE INDEX "ToolWorkspace_workspaceId_idx" ON "ToolWorkspace"("workspaceId");

-- CreateIndex
CREATE INDEX "AssistantTool_userId_idx" ON "AssistantTool"("userId");

-- CreateIndex
CREATE INDEX "AssistantTool_assistantId_idx" ON "AssistantTool"("assistantId");

-- CreateIndex
CREATE INDEX "AssistantTool_toolId_idx" ON "AssistantTool"("toolId");
