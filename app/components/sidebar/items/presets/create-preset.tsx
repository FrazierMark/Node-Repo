import { SidebarCreateItem } from "#app/components/sidebar/items/all/sidebar-create-item"
import { ChatSettingsForm } from "#app/components/ui/chat-settings-form"
import { Input } from "#app/components/ui/input"
import { Label } from "#app/components/ui/label"
import { ChatbotUIContext } from "#app/../context/context"
import { PRESET_NAME_MAX } from "#app/utils/providers/constants"
import { DbModels } from "#app/../types/dbModels"
import { FC, useContext, useState } from "react"
import { Prisma } from '@prisma/client'

interface CreatePresetProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CreatePreset: FC<CreatePresetProps> = ({
  isOpen,
  onOpenChange
}) => {
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)

  const [name, setName] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState("")
  const [presetChatSettings, setPresetChatSettings] = useState({
    model: selectedWorkspace?.defaultModel,
    prompt: selectedWorkspace?.defaultPrompt,
    temperature: selectedWorkspace?.defaultTemperature,
    contextLength: selectedWorkspace?.defaultContextLength,
    includeProfileContext: selectedWorkspace?.includeProfileContext,
    includeWorkspaceInstructions:
      selectedWorkspace?.includeWorkspaceInstructions,
    embeddingsProvider: selectedWorkspace?.embeddingsProvider
  })

  if (!profile) return null
  if (!selectedWorkspace) return null

  return (
    <SidebarCreateItem
      contentType="presets"
      isOpen={isOpen}
      isTyping={isTyping}
      onOpenChange={onOpenChange}
      createState={
        {
          user: { connect: { id: profile.userId } },
          name,
          description,
          includeProfileContext: presetChatSettings.includeProfileContext,
          includeWorkspaceInstructions: presetChatSettings.includeWorkspaceInstructions,
          contextLength: presetChatSettings.contextLength,
          model: presetChatSettings.model,
          prompt: presetChatSettings.prompt,
          temperature: presetChatSettings.temperature,
          embeddingsProvider: presetChatSettings.embeddingsProvider
        } as Prisma.PresetCreateInput
      }
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>Name</Label>

            <Input
              placeholder="Preset name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={PRESET_NAME_MAX}
            />
          </div>

          <ChatSettingsForm
            chatSettings={presetChatSettings as any}
            onChangeChatSettings={setPresetChatSettings}
            useAdvancedDropdown={true}
          />
        </>
      )}
    />
  )
}
