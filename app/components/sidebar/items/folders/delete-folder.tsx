import { Button } from "#app/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "#app/components/ui/dialog"
import { ChatbotUIContext } from "#app/../context/context"
import { deleteFolder } from "#app/utils/folders.server"
import { DbModels } from "#app/../types/dbModels"
import { ContentType } from "#app/../types/content-type"
import { IconTrash } from "@tabler/icons-react"
import { FC, useContext, useRef, useState } from "react"
import { toast } from "sonner"
import { prisma } from '#app/utils/db.server.js'

interface DeleteFolderProps {
  folder: DbModels["Folder"]
  contentType: ContentType
}

export const DeleteFolder: FC<DeleteFolderProps> = ({
  folder,
  contentType
}) => {
  const {
    setChats,
    setFolders,
    setPresets,
    setPrompts,
  } = useContext(ChatbotUIContext)

  const buttonRef = useRef<HTMLButtonElement>(null)

  const [showFolderDialog, setShowFolderDialog] = useState(false)

  const stateUpdateFunctions = {
    chats: setChats,
    presets: setPresets,
    prompts: setPrompts,
  }

  const handleDeleteFolderOnly = async () => {
    await deleteFolder(folder.id)

    setFolders(prevState => prevState.filter(c => c.id !== folder.id))

    setShowFolderDialog(false)

    const setStateFunction = stateUpdateFunctions[contentType]

    if (!setStateFunction) return

    setStateFunction((prevItems: any) =>
      prevItems.map((item: any) => {
        if (item.folder_id === folder.id) {
          return {
            ...item,
            folder_id: null
          }
        }

        return item
      })
    )
  }

  const handleDeleteFolderAndItems = async () => {
    const setStateFunction = stateUpdateFunctions[contentType]

    if (!setStateFunction) return

    const modelName = contentType === 'chats' ? 'chat' : contentType.slice(0, -1);
    try {
      await (prisma[modelName as keyof typeof prisma] as any).deleteMany({
        where: { folder_id: folder.id }
      })

      setStateFunction((prevItems: any) =>
        prevItems.filter((item: any) => item.folder_id !== folder.id)
      )

      await handleDeleteFolderOnly()
    } catch (error) {
      toast.error("Error deleting items: " + (error as Error).message)
    }
  }


  return (
    <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
      <DialogTrigger asChild>
        <IconTrash className="hover:opacity-50" size={18} />
      </DialogTrigger>

      <DialogContent className="min-w-[550px]">
        <DialogHeader>
          <DialogTitle>Delete {folder.name}</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete this folder?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowFolderDialog(false)}>
            Cancel
          </Button>

          <Button
            ref={buttonRef}
            variant="destructive"
            onClick={handleDeleteFolderAndItems}
          >
            Delete Folder & Included Items
          </Button>

          <Button
            ref={buttonRef}
            variant="destructive"
            onClick={handleDeleteFolderOnly}
          >
            Delete Folder Only
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
