import { StatusCodes } from 'http-status-codes';
import prisma from '../../../config/prisma';
import AppError from '../../errors/AppError';
import { TCreateUserInput, TUpdateUserInput } from './user.interface';

const createUserIntoDB = async (payload: TCreateUserInput) => {
  const isUserExist = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isUserExist) {
    throw new AppError(StatusCodes.CONFLICT, 'User with this email already exists!');
  }

  const result = await prisma.user.create({
    data: payload,
  });

  return result;
};

const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tasks: true,
      _count: {
        select: { tasks: true },
      },
    },
  });

  return result;
};

const getSingleUserFromDB = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: { id },
    include: { tasks: true },
  });

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  return result;
};

const updateUserIntoDB = async (id: string, payload: TUpdateUserInput) => {
  await getSingleUserFromDB(id);

  const result = await prisma.user.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteUserFromDB = async (id: string) => {
  await getSingleUserFromDB(id);

  const result = await prisma.user.delete({
    where: { id },
  });

  return result;
};

export const UserServices = {
  createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserIntoDB,
  deleteUserFromDB,
};
