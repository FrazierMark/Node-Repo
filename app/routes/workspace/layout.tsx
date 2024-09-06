import { Dashboard } from "#app/components/ui/dashboard"
import { ChatbotUIContext } from "#app/../context/context"
import { getAssistantWorkspacesByWorkspaceId } from "#app/utils/assistants.server"
import { getChatsByWorkspaceId } from "#app/utils/chats.server"
import { getCollectionWorkspacesByWorkspaceId } from "#app/utils/collections.server"
import { getFoldersByWorkspaceId } from "#app/utils/folders.server"
import { getPresetWorkspacesByWorkspaceId } from "#app/utils/presets.server"
import { getPromptWorkspacesByWorkspaceId } from "#app/utils/prompts.server"
import { getToolWorkspacesByWorkspaceId } from "#app/utils/tools.server"
import { getWorkspaceById } from "#app/utils/workspaces.server"
import { convertBlobToBase64 } from "#app/lib/blob-to-b64"
import { LLMID } from "../../../types"
import { useNavigation, useParams, useSearchParams, useNavigate } from '@remix-run/react'
import { ReactNode, useContext, useEffect, useState } from "react"
import { ScreenLoader } from "#app/components/ui/screen-loader"
import { getUserId } from '#app/utils/auth.server.ts'

interface WorkspaceLayoutProps {
  children: ReactNode
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const navigate = useNavigate()

  const params = useParams()
  const [searchParams] = useSearchParams()
  const workspaceId = params.workspaceid as string

  const {
    setChatSettings,
    setAssistantImages,
    setChats,
    setFolders,
    setPresets,
    setPrompts,
    selectedWorkspace,
    setSelectedWorkspace,
    setSelectedChat,
    setChatMessages,
    setUserInput,
    setIsGenerating,
    setFirstTokenReceived,
    setChatFiles,
    setChatImages,
    setNewMessageFiles,
    setNewMessageImages,
    setShowFilesDisplay
  } = useContext(ChatbotUIContext)

  const [loading, setLoading] = useState(true)

  async function checkSession(request: Request) {
    const userId = await getUserId(request)
    if (!userId) {
      return navigate('/login')
    }
    return userId
  }

  useEffect(() => {
    const checkSessionAndFetchData = async () => {
      const userId = await checkSession(new Request(window.location.href))
      if (userId) {
        await fetchWorkspaceData(workspaceId)
      }
    }
    checkSessionAndFetchData()
  }, [])

  useEffect(() => {
    ;(async () => await fetchWorkspaceData(workspaceId))()

    setUserInput("")
    setChatMessages([])
    setSelectedChat(null)

    setIsGenerating(false)
    setFirstTokenReceived(false)

    setChatFiles([])
    setChatImages([])
    setNewMessageFiles([])
    setNewMessageImages([])
    setShowFilesDisplay(false)
  }, [workspaceId])

  const fetchWorkspaceData = async (workspaceId: string) => {
    setLoading(true)

    const workspace = await getWorkspaceById(workspaceId)
    setSelectedWorkspace(workspace as any)

    const chats = await getChatsByWorkspaceId(workspaceId)
    setChats(chats as any)

    const folders = await getFoldersByWorkspaceId(workspaceId)
    setFolders(folders as any)

    const presetData = await getPresetWorkspacesByWorkspaceId(workspaceId)
    setPresets(presetData.PresetWorkspace.map(item => item.preset) as any)
    
    const promptData = await getPromptWorkspacesByWorkspaceId(workspaceId)
    setPrompts(promptData.PromptWorkspace.map(item => item.prompt) as any)

    setChatSettings({
      model: (searchParams.get("model") ||
        workspace?.defaultModel ||
        "gpt-4-1106-preview") as LLMID,
      prompt:
        workspace?.defaultPrompt ||
        "You are a friendly, helpful AI assistant.",
      temperature: workspace?.defaultTemperature || 0.5,
      contextLength: workspace?.defaultContextLength || 4096,
      includeProfileContext: workspace?.includeProfileContext || true,
      includeWorkspaceInstructions:
        workspace?.includeWorkspaceInstructions || true,
      embeddingsProvider:
        (workspace?.embeddingsProvider as "openai" | "local") || "openai"
    })

    setLoading(false)
  }

  if (loading) {
    return <ScreenLoader />
  }

  return <Dashboard>{children}</Dashboard>
}
