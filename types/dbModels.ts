import {Prisma} from '@prisma/client';
import {PrismaModels} from 'prisma-models'

export type DbModels = PrismaModels<Prisma.ModelName, Prisma.TypeMap>;
