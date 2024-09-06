"use client"

import { useChatHandler } from "#app/components/chat/chat-hooks/use-chat-handler"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "#app/components/ui/popover"
import { ChatbotUIContext } from "#app/../context/context"
import { createWorkspace } from "#app/utils/workspaces.server"
import useHotkey from "#app/lib/hooks/use-hotkey"
import { IconBuilding, IconHome, IconPlus } from "@tabler/icons-react"
import { ChevronsUpDown } from "lucide-react"
import { useNavigate } from "@remix-run/react"
import { FC, useContext, useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { DbModels } from "#app/../types/dbModels"

interface WorkspaceSwitcherProps {}

export const WorkspaceSwitcher: FC<WorkspaceSwitcherProps> = ({}) => {
  useHotkey(";", () => setOpen(prevState => !prevState))

  const {
    workspaces,
    workspaceImages,
    selectedWorkspace,
    setSelectedWorkspace,
    setWorkspaces
  } = useContext(ChatbotUIContext)

  const { handleNewChat } = useChatHandler()

  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!selectedWorkspace) return

    setValue(selectedWorkspace.id)
  }, [selectedWorkspace])

  const handleCreateWorkspace = async () => {
    if (!selectedWorkspace) return

    const createdWorkspace = await createWorkspace({
      userId: selectedWorkspace.userId,
      defaultContextLength: selectedWorkspace.defaultContextLength,
      defaultModel: selectedWorkspace.defaultModel,
      defaultPrompt: selectedWorkspace.defaultPrompt,
      defaultTemperature: selectedWorkspace.defaultTemperature,
      description: "",
      embeddingsProvider: "openai",
      sharing: "private",
      imagePath: "",
      includeProfileContext: selectedWorkspace.includeProfileContext,
      includeWorkspaceInstructions:
        selectedWorkspace.includeWorkspaceInstructions,
      instructions: selectedWorkspace.instructions,
      isHome: false,
      name: "New Workspace"
    })

    setWorkspaces(prevWorkspaces => [...prevWorkspaces, createdWorkspace as DbModels["Workspace"]])
    setSelectedWorkspace(createdWorkspace as DbModels["Workspace"])
    setOpen(false)

    return navigate(`/${createdWorkspace.id}/chat`)
  }

  const getWorkspaceName = (workspaceId: string) => {
    const workspace = workspaces.find(workspace => workspace.id === workspaceId)

    if (!workspace) return

    return workspace.name
  }

  const handleSelect = (workspaceId: string) => {
    const workspace = workspaces.find(workspace => workspace.id === workspaceId)

    if (!workspace) return

    setSelectedWorkspace(workspace)
    setOpen(false)

    return navigate(`/${workspace.id}/chat`)
  }

  const workspaceImage = workspaceImages.find(
    image => image.workspaceId === selectedWorkspace?.id
  )
  const imageSrc = workspaceImage
    ? workspaceImage.url
    : selectedWorkspace?.isHome
      ? ""
      : ""

  const IconComponent = selectedWorkspace?.isHome ? IconHome : IconBuilding

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="border-input flex h-[36px]
        w-full cursor-pointer items-center justify-between rounded-md border px-2 py-1 hover:opacity-50"
      >
        <div className="flex items-center truncate">
          {selectedWorkspace && (
            <div className="flex items-center">
              {workspaceImage ? (
                <img
                  style={{ width: "22px", height: "22px" }}
                  className="mr-2 rounded"
                  src={imageSrc}
                  width={22}
                  height={22}
                  alt={selectedWorkspace.name}
                />
              ) : (
                <IconComponent className="mb-0.5 mr-2" size={22} />
              )}
            </div>
          )}

          {getWorkspaceName(value) || "Select workspace..."}
        </div>

        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="p-2">
        <div className="space-y-2">
          <Button
            className="flex w-full items-center space-x-2"
            size="sm"
            onClick={handleCreateWorkspace}
          >
            <IconPlus />
            <div className="ml-2">New Workspace</div>
          </Button>

          <Input
            placeholder="Search workspaces..."
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="flex flex-col space-y-1">
            {workspaces
              .filter(workspace => workspace.isHome)
              .map(workspace => {
                const image = workspaceImages.find(
                  image => image.workspaceId === workspace.id
                )

                return (
                  <Button
                    key={workspace.id}
                    className="flex items-center justify-start"
                    variant="ghost"
                    onClick={() => handleSelect(workspace.id)}
                  >
                    {image ? (
                      <img
                        style={{ width: "28px", height: "28px" }}
                        className="mr-3 rounded"
                        src={image.url || ""}
                        width={28}
                        height={28}
                        alt={workspace.name}
                      />
                    ) : (
                      <IconHome className="mr-3" size={28} />
                    )}

                    <div className="text-lg font-semibold">
                      {workspace.name}
                    </div>
                  </Button>
                )
              })}

            {workspaces
              .filter(
                workspace =>
                  !workspace.isHome &&
                  workspace.name.toLowerCase().includes(search.toLowerCase())
              )
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(workspace => {
                const image = workspaceImages.find(
                  image => image.workspaceId === workspace.id
                )

                return (
                  <Button
                    key={workspace.id}
                    className="flex items-center justify-start"
                    variant="ghost"
                    onClick={() => handleSelect(workspace.id)}
                  >
                    {image ? (
                      <img
                        style={{ width: "28px", height: "28px" }}
                        className="mr-3 rounded"
                        src={image.url || ""}
                        width={28}
                        height={28}
                        alt={workspace.name}
                      />
                    ) : (
                      <IconBuilding className="mr-3" size={28} />
                    )}

                    <div className="text-lg font-semibold">
                      {workspace.name}
                    </div>
                  </Button>
                )
              })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
