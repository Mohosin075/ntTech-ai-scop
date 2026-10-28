import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';

// Every scope mutation locks the parent first, including review and deletion.
// READ COMMITTED ensures reads after a waiting lock see the latest committed scope.
export const withProjectLock = <T>(
  projectId: string,
  operation: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> => prisma.$transaction(async (tx) => {
  await tx.$queryRaw`SELECT id FROM projects WHERE id = ${projectId} FOR UPDATE`;
  return operation(tx);
}, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
