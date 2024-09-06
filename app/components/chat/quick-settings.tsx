import { ChatbotUIContext } from "#app/../context/context"
import { getAssistantCollectionsByAssistantId } from "#app/utils/assistant-collections.server"
import { getAssistantFilesByAssistantId } from "#app/utils/assistant-files.server"
import { getAssistantToolsByAssistantId } from "#app/utils/assistant-tools.server"
import { getCollectionFilesByCollectionId } from "@/db/collection-files"
import useHotkey from "#app/lib/hooks/use-hotkey"
import { LLM_LIST } from "#app/lib/models/llm/llm-list"
import { DbModels } from "#app/../types/dbModels"
import { LLMID } from "#app/../types"
import { IconChevronDown, IconRobotFace } from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { useTranslation } from "remix-i18next"
import { ModelIcon } from "../models/model-icon"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { QuickSettingOption } from "./quick-setting-option"


interface QuickSettingsProps {}

export const QuickSettings: FC<QuickSettingsProps> = ({}) => {
  const { t } = useTranslation()

  useHotkey("p", () => setIsOpen(prevState => !prevState))

  const {
    presets,
    selectedAssistant,
    selectedPreset,
    chatSettings,
    setSelectedPreset,
    setSelectedAssistant,
    setChatSettings,
    assistantImages,
    setChatFiles,
    setSelectedTools,
    setShowFilesDisplay,
    selectedWorkspace
  } = useContext(ChatbotUIContext)

  const inputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100) // FIX: hacky
    }
  }, [isOpen])

  const handleSelectQuickSetting = async (
    item: DbModels["Preset"] | DbModels["Assistant"] | null,
    contentType: "presets" | "assistants" | "remove"
  ) => {
    console.log({ item, contentType })
    if (contentType === "assistants" && item) {
      setSelectedAssistant(item as DbModels["Assistant"])
      setLoading(true)
      let allFiles = []
      const assistantFiles = (await getAssistantFilesByAssistantId(item.id))
        .files
      allFiles = [...assistantFiles]
      const assistantCollections = (
        await getAssistantCollectionsByAssistantId(item.id)
      ).collections
      for (const collection of assistantCollections) {
        const collectionFiles = (
          await getCollectionFilesByCollectionId(collection.id)
        ).files
        allFiles = [...allFiles, ...collectionFiles]
      }
      const assistantTools = (await getAssistantToolsByAssistantId(item.id))
        .tools
      setSelectedTools(assistantTools)
      setChatFiles(
        allFiles.map(file => ({
          id: file.id,
          name: file.name,
          type: file.type,
          file: null
        }))
      )
      if (allFiles.length > 0) setShowFilesDisplay(true)
      setLoading(false)
      setSelectedPreset(null)
    } else if (contentType === "presets" && item) {
      setSelectedPreset(item as DbModels["Preset"])
      setSelectedAssistant(null)
      setChatFiles([])
      setSelectedTools([])
    } else {
      setSelectedPreset(null)
      setSelectedAssistant(null)
      setChatFiles([])
      setSelectedTools([])
      if (selectedWorkspace) {
        setChatSettings({
          model: selectedWorkspace.defaultModel as LLMID,
          prompt: selectedWorkspace.defaultPrompt,
          temperature: selectedWorkspace.defaultTemperature,
          contextLength: selectedWorkspace.defaultContextLength,
          includeProfileContext: selectedWorkspace.includeProfileContext,
          includeWorkspaceInstructions:
            selectedWorkspace.includeWorkspaceInstructions,
          embeddingsProvider: selectedWorkspace.embeddingsProvider as
            | "openai"
            | "local"
        })
      }
      return
    }

    setChatSettings({
      model: item.model as LLMID,
      prompt: item.prompt,
      temperature: item.temperature,
      contextLength: item.contextLength,
      includeProfileContext: item.includeProfileContext,
      includeWorkspaceInstructions: item.includeWorkspaceInstructions,
      embeddingsProvider: item.embeddingsProvider as "openai" | "local"
    })
  }

  const checkIfModified = () => {
    if (!chatSettings) return false

    if (selectedPreset) {
      return (
        selectedPreset.includeProfileContext !==
          chatSettings?.includeProfileContext ||
        selectedPreset.includeWorkspaceInstructions !==
          chatSettings.includeWorkspaceInstructions ||
        selectedPreset.contextLength !== chatSettings.contextLength ||
        selectedPreset.model !== chatSettings.model ||
        selectedPreset.prompt !== chatSettings.prompt ||
        selectedPreset.temperature !== chatSettings.temperature
      )
    } else if (selectedAssistant) {
      return (
        selectedAssistant.includeProfileContext !==
          chatSettings.includeProfileContext ||
        selectedAssistant.includeWorkspaceInstructions !==
          chatSettings.includeWorkspaceInstructions ||
        selectedAssistant.contextLength !== chatSettings.contextLength ||
        selectedAssistant.model !== chatSettings.model ||
        selectedAssistant.prompt !== chatSettings.prompt ||
        selectedAssistant.temperature !== chatSettings.temperature
      )
    }

    return false
  }

  const isModified = checkIfModified()

  const items = [
    ...presets.map(preset => ({ ...preset, contentType: "presets" }))
  ]

  const selectedAssistantImage = selectedPreset
    ? ""
    : assistantImages.find(
        image => image.path === selectedAssistant?.imagePath
      )?.base64 || ""

  const modelDetails = LLM_LIST.find(
    (model: { modelId: string }) => model.modelId === selectedPreset?.model
  )

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        setIsOpen(isOpen)
        setSearch("")
      }}
    >
      <DropdownMenuTrigger asChild className="max-w-[400px]" disabled={loading}>
        <Button variant="ghost" className="flex space-x-3 text-lg">
          {selectedPreset && (
            <ModelIcon
              provider={modelDetails?.provider || "custom"}
              width={32}
              height={32}
            />
          )}

          {selectedAssistant &&
            (selectedAssistantImage ? (
              <img
                className="rounded"
                src={selectedAssistantImage}
                alt="Assistant"
                width={28}
                height={28}
              />
            ) : (
              <IconRobotFace
                className="bg-primary text-secondary border-primary rounded border-DEFAULT p-1"
                size={28}
              />
            ))}

          {loading ? (
            <div className="animate-pulse">Loading assistant...</div>
          ) : (
            <>
              <div className="overflow-hidden text-ellipsis">
                {isModified &&
                  (selectedPreset || selectedAssistant) &&
                  "Modified "}

                {selectedPreset?.name ||
                  selectedAssistant?.name ||
                  t("Quick Settings")}
              </div>

              <IconChevronDown className="ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="min-w-[300px] max-w-[500px] space-y-4"
        align="start"
      >
        {presets.length === 0 ? (
          <div className="p-8 text-center">No items found.</div>
        ) : (
          <>
            <Input
              ref={inputRef}
              className="w-full"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.stopPropagation()}
            />

            {!!(selectedPreset || selectedAssistant) && (
              <QuickSettingOption
                contentType={selectedPreset ? "presets" : "assistants"}
                isSelected={true}
                item={
                  selectedPreset ||
                  (selectedAssistant as
                    | DbModels["Preset"]
                    | DbModels["Assistant"])
                }
                onSelect={() => {
                  handleSelectQuickSetting(null, "remove")
                }}
                image={selectedPreset ? "" : selectedAssistantImage}
              />
            )}

            {items
              .filter(
                item =>
                  item.name.toLowerCase().includes(search.toLowerCase()) &&
                  item.id !== selectedPreset?.id &&
                  item.id !== selectedAssistant?.id
              )
              .map(({ contentType, ...item }) => (
                <QuickSettingOption
                  key={item.id}
                  contentType={contentType as "presets" | "assistants"}
                  isSelected={false}
                  item={item}
                  onSelect={() =>
                    handleSelectQuickSetting(
                      item,
                      contentType as "presets" | "assistants"
                    )
                  }
                  image={
                    contentType === "assistants"
                      ? assistantImages.find(
                          image =>
                            image.path ===
                            (item as DbModels["Assistant"])?.imagePath || ''
                        )?.base64 || ''
                      : ''
                  }
                />
              ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
