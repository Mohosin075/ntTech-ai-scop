import { StatusCodes } from 'http-status-codes';
import prisma from '../../../config/prisma';
import AppError from '../../errors/AppError';
import { TCreateTaskInput, TUpdateTaskInput } from './task.interface';

const createTaskIntoDB = async (payload: TCreateTaskInput) => {
  const isUserExist = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Assigned user does not exist!');
  }

  const result = await prisma.task.create({
    data: payload,
  });

  return result;
};

const getAllTasksFromDB = async (filter?: { userId?: string; status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' }) => {
  const result = await prisma.task.findMany({
    where: {
      ...(filter?.userId && { userId: filter.userId }),
      ...(filter?.status && { status: filter.status }),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  return result;
};

const getSingleTaskFromDB = async (id: string) => {
  const result = await prisma.task.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found!');
  }

  return result;
};

const updateTaskIntoDB = async (id: string, payload: TUpdateTaskInput) => {
  await getSingleTaskFromDB(id);

  const result = await prisma.task.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteTaskFromDB = async (id: string) => {
  await getSingleTaskFromDB(id);

  const result = await prisma.task.delete({
    where: { id },
  });

  return result;
};

export const TaskServices = {
  createTaskIntoDB,
  getAllTasksFromDB,
  getSingleTaskFromDB,
  updateTaskIntoDB,
  deleteTaskFromDB,
};
