import { prisma } from "#app/utils/db.server"
import type { Profile } from "@prisma/client"

export async function getProfileByUserId(userId: string): Promise<Profile> {
  const profile = await prisma.profile.findUnique({
    where: { userId }
  })

  if (!profile) {
    throw new Error("Profile not found")
  }

  return profile
}

export async function getProfilesByUserId(userId: string): Promise<Profile[]> {
  const profiles = await prisma.profile.findMany({
    where: { userId }
  })

  if (!profiles.length) {
    throw new Error("No profiles found")
  }

  return profiles
}

export async function createProfile(profile: Omit<Profile, "id" | "createdAt" | "updatedAt">): Promise<Profile> {
  return prisma.profile.create({
    data: profile
  })
}

export async function updateProfile(
  profileId: string,
  profile: Partial<Omit<Profile, "id" | "createdAt" | "updatedAt">>
): Promise<Profile> {
  return prisma.profile.update({
    where: { id: profileId },
    data: profile
  })
}

export async function deleteProfile(profileId: string): Promise<boolean> {
  await prisma.profile.delete({
    where: { id: profileId }
  })

  return true
}