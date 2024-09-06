import { Button } from "#app/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "#app/components/ui/dialog"
import { Input } from "#app/components/ui/input"
import { Label } from "#app/components/ui/label"
import { ChatbotUIContext } from "#app/../context/context"
import { updateFolder } from "#app/utils/folders.server"
import { DbModels } from "#app/../types/dbModels"
import { IconEdit } from "@tabler/icons-react"
import { FC, useContext, useRef, useState } from "react"

interface UpdateFolderProps {
  folder: DbModels["Folder"]
}

export const UpdateFolder: FC<UpdateFolderProps> = ({ folder }) => {
  const { setFolders } = useContext(ChatbotUIContext)

  const buttonRef = useRef<HTMLButtonElement>(null)

  const [showFolderDialog, setShowFolderDialog] = useState(false)
  const [name, setName] = useState(folder.name)

  const handleUpdateFolder = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const updatedFolder = await updateFolder(folder.id, {
      name
    })
    setFolders(prevState =>
      prevState.map(c => (c.id === folder.id ? updatedFolder as typeof c : c))
    )

    setShowFolderDialog(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      buttonRef.current?.click()
    }
  }

  return (
    <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
      <DialogTrigger asChild>
        <IconEdit className="hover:opacity-50" size={18} />
      </DialogTrigger>

      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Edit Folder</DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          <Label>Name</Label>

          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowFolderDialog(false)}>
            Cancel
          </Button>

          <Button ref={buttonRef} onClick={handleUpdateFolder}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
