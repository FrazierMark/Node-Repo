import { ModelIcon } from "#app/components/models/model-icon"
import { ChatSettingsForm } from "#app/components/ui/chat-settings-form"
import { Input } from "#app/components/ui/input"
import { Label } from "#app/components/ui/label"
import { PRESET_NAME_MAX } from "#app/utils/providers/constants"
import { LLM_LIST } from "#app/lib/models/llm/llm-list"
import { DbModels } from "#app/../types/dbModels"
import { FC, useState } from "react"
import { SidebarItem } from "../all/sidebar-display-item"

interface PresetItemProps {
  preset: DbModels["Preset"]
}

export const PresetItem: FC<PresetItemProps> = ({ preset }) => {
  const [name, setName] = useState(preset.name)
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState(preset.description)
  const [presetChatSettings, setPresetChatSettings] = useState({
    model: preset.model,
    prompt: preset.prompt,
    temperature: preset.temperature,
    contextLength: preset.contextLength,
    includeProfileContext: preset.includeProfileContext,
    includeWorkspaceInstructions: preset.includeWorkspaceInstructions
  })

  const modelDetails = LLM_LIST.find(model => model.modelId === preset.model)

  return (
    <SidebarItem
      item={preset}
      isTyping={isTyping}
      contentType="presets"
      icon={
        <ModelIcon
          provider={modelDetails?.provider || "custom"}
          height={30}
          width={30}
        />
      }
      updateState={{
        name,
        description,
        includeProfileContext: presetChatSettings.includeProfileContext,
        includeWorkspaceInstructions:
          presetChatSettings.includeWorkspaceInstructions,
        contextLength: presetChatSettings.contextLength,
        model: presetChatSettings.model,
        prompt: presetChatSettings.prompt,
        temperature: presetChatSettings.temperature
      }}
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
