import { prisma } from './db.server.ts'

export const getCollectionFilesByCollectionId = async (collectionId: string) => {
  const collectionFiles = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: {
      id: true,
      name: true,
      CollectionFile: {
        select: {
          file: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      }
    }
  })

  if (!collectionFiles) {
    throw new Error("Collection not found")
  }

  return {
    ...collectionFiles,
    files: collectionFiles.CollectionFile.map(cf => cf.file)
  }
}

export const createCollectionFile = async (
  collectionFile: {
    userId: string
    collectionId: string
    fileId: string
  }
) => {
  const createdCollectionFile = await prisma.collectionFile.create({
    data: collectionFile,
    include: {
      collection: true,
      file: true
    }
  })

  return createdCollectionFile
}

export const createCollectionFiles = async (
  collectionFiles: {
    userId: string
    collectionId: string
    fileId: string
  }[]
) => {
  const createdCollectionFiles = await prisma.collectionFile.createMany({
    data: collectionFiles
  })

  return createdCollectionFiles
}

export const deleteCollectionFile = async (
  collectionId: string,
  fileId: string
) => {
  await prisma.collectionFile.delete({
    where: {
      collectionId_fileId: {
        collectionId,
        fileId
      }
    }
  })

  return true
}