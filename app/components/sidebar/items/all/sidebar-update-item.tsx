import { Button } from '#app/components/ui/button'
import { Label } from '#app/components/ui/label'
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '#app/components/ui/sheet'
import { AssignWorkspaces } from '#app/components/workspace/assign-workspaces'
import { ChatbotUIContext } from '#app/../context/context'
import {
	createPresetWorkspaces,
	deletePresetWorkspace,
	getPresetWorkspacesByPresetId,
	updatePreset,
} from '#app/utils/presets.server'
import {
	createPromptWorkspaces,
	deletePromptWorkspace,
	getPromptWorkspacesByPromptId,
	updatePrompt,
} from '#app/utils/prompts.server'
import { DbModels } from '../../../../../types/dbModels'
import { ContentType, DataItemType } from '#app/../types'
import { FC, useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { SidebarDeleteItem } from './sidebar-delete-item'
import { updateChat } from '#app/utils/chats.server.js'
import { Preset, Prompt } from '@prisma/client'

type PresetUpdate = Partial<Omit<Preset, 'id' | 'createdAt' | 'updatedAt'>>
type PromptUpdate = Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>>

interface SidebarUpdateItemProps {
	isTyping: boolean
	item: DataItemType
	contentType: ContentType
	children: React.ReactNode
	renderInputs: (renderState: any) => JSX.Element
	updateState: any
}

export const SidebarUpdateItem: FC<SidebarUpdateItemProps> = ({
	item,
	contentType,
	children,
	renderInputs,
	updateState,
	isTyping,
}) => {
	const { workspaces, selectedWorkspace, setChats, setPresets, setPrompts } =
		useContext(ChatbotUIContext)

	const buttonRef = useRef<HTMLButtonElement>(null)

	const [isOpen, setIsOpen] = useState(false)
	const [startingWorkspaces, setStartingWorkspaces] = useState<DbModels['Workspace'][]>([])
	const [selectedWorkspaces, setSelectedWorkspaces] = useState<DbModels['Workspace'][]>([])

	useEffect(() => {
		if (isOpen) {
			const fetchData = async () => {
				if (workspaces.length > 1) {
					const workspaces = await fetchSelectedWorkspaces()
					setStartingWorkspaces(workspaces as DbModels['Workspace'][])
					setSelectedWorkspaces(workspaces as DbModels['Workspace'][])
				}

				const fetchDataFunction = fetchDataFunctions[contentType]
				if (fetchDataFunction) {
					await fetchDataFunction(item.id)
				}
			}

			fetchData()
		}
	}, [isOpen])

	const renderState = {
		chats: null,
		presets: null,
		prompts: null,
	}

	const fetchDataFunctions = {
		chats: null,
		presets: async (id: string) => { /* implementation */ },
		prompts: async (id: string) => { /* implementation */ }
	}

	const fetchWorkpaceFunctions = {
		chats: null,
		presets: async (presetId: string) => {
			const result = await getPresetWorkspacesByPresetId(presetId)
			return result.PresetWorkspace.map((pw) => pw.workspace)
		},
		prompts: async (promptId: string) => {
			const result = await getPromptWorkspacesByPromptId(promptId)
			return result.promptWorkspaces.map((pw) => pw.workspace)
		},
	}

	const fetchSelectedWorkspaces = async () => {
		const fetchFunction = fetchWorkpaceFunctions[contentType]

		if (!fetchFunction) return []

		const workspaces = await fetchFunction(item.id)

		return workspaces
	}

	const handleWorkspaceUpdates = async (
		startingWorkspaces: DbModels['Workspace'][],
		selectedWorkspaces: DbModels['Workspace'][],
		itemId: string,
		deleteWorkspaceFn: (
			itemId: string,
			workspaceId: string,
		) => Promise<boolean>,
		createWorkspaceFn: (
			workspaces: { user_id: string; item_id: string; workspace_id: string }[],
		) => Promise<void>,
		itemIdKey: string,
	) => {
		if (!selectedWorkspace) return

		const deleteList = startingWorkspaces.filter(
			(startingWorkspace) =>
				!selectedWorkspaces.some(
					(selectedWorkspace) => selectedWorkspace.id === startingWorkspace.id,
				),
		)

		for (const workspace of deleteList) {
			await deleteWorkspaceFn(itemId, workspace.id)
		}

		if (deleteList.map((w) => w.id).includes(selectedWorkspace.id)) {
			const setStateFunction = stateUpdateFunctions[contentType]

			if (setStateFunction) {
				setStateFunction((prevItems: any) =>
					prevItems.filter((prevItem: any) => prevItem.id !== item.id),
				)
			}
		}

		const createList = selectedWorkspaces.filter(
			(selectedWorkspace) =>
				!startingWorkspaces.some(
					(startingWorkspace) => startingWorkspace.id === selectedWorkspace.id,
				),
		)

		await createWorkspaceFn(
			createList.map((workspace) => {
				return {
					user_id: workspace.userId,
					[itemIdKey]: itemId,
					workspace_id: workspace.id,
				} as any
			}),
		)
	}

	const updateFunctions = {
		chats: updateChat,
		presets: async (presetId: string, updateState: PresetUpdate) => {
			const updatedPreset = await updatePreset(presetId, updateState)

			await handleWorkspaceUpdates(
				startingWorkspaces,
				selectedWorkspaces,
				presetId,
				deletePresetWorkspace,
				createPresetWorkspaces as any,
				'preset_id',
			)

			return updatedPreset
		},
		prompts: async (promptId: string, updateState: PromptUpdate) => {
			const updatedPrompt = await updatePrompt(promptId, updateState)

			await handleWorkspaceUpdates(
				startingWorkspaces,
				selectedWorkspaces,
				promptId,
				deletePromptWorkspace,
				createPromptWorkspaces as any,
				'prompt_id',
			)

			return updatedPrompt
		},
	}

	const stateUpdateFunctions = {
		chats: setChats,
		presets: setPresets,
		prompts: setPrompts,
	}

	const handleUpdate = async () => {
		try {
			const updateFunction = updateFunctions[contentType]
			const setStateFunction = stateUpdateFunctions[contentType]

			if (!updateFunction || !setStateFunction) return
			if (isTyping) return // Prevent update while typing

			const updatedItem = await updateFunction(item.id, updateState)

			setStateFunction((prevItems: any) =>
				prevItems.map((prevItem: any) =>
					prevItem.id === item.id ? updatedItem : prevItem,
				),
			)

			setIsOpen(false)

			toast.success(`${contentType.slice(0, -1)} updated successfully`)
		} catch (error) {
			toast.error(`Error updating ${contentType.slice(0, -1)}. ${error}`)
		}
	}

	const handleSelectWorkspace = (workspace: DbModels['Workspace']) => {
		setSelectedWorkspaces((prevState) => {
			const isWorkspaceAlreadySelected = prevState.find(
				(selectedWorkspace) => selectedWorkspace.id === workspace.id,
			)

			if (isWorkspaceAlreadySelected) {
				return prevState.filter(
					(selectedWorkspace) => selectedWorkspace.id !== workspace.id,
				)
			} else {
				return [...prevState, workspace]
			}
		})
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!isTyping && e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			buttonRef.current?.click()
		}
	}

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>{children}</SheetTrigger>

			<SheetContent
				className="flex min-w-[450px] flex-col justify-between"
				side="left"
				onKeyDown={handleKeyDown}
			>
				<div className="grow overflow-auto">
					<SheetHeader>
						<SheetTitle className="text-2xl font-bold">
							Edit {contentType.slice(0, -1)}
						</SheetTitle>
					</SheetHeader>

					<div className="mt-4 space-y-3">
						{workspaces.length > 1 && (
							<div className="space-y-1">
								<Label>Assigned Workspaces</Label>

								<AssignWorkspaces
									selectedWorkspaces={selectedWorkspaces}
									onSelectWorkspace={handleSelectWorkspace}
								/>
							</div>
						)}

						{renderInputs(renderState[contentType])}
					</div>
				</div>

				<SheetFooter className="mt-2 flex justify-between">
					<SidebarDeleteItem item={item} contentType={contentType} />

					<div className="flex grow justify-end space-x-2">
						<Button variant="outline" onClick={() => setIsOpen(false)}>
							Cancel
						</Button>

						<Button ref={buttonRef} onClick={handleUpdate}>
							Save
						</Button>
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
