import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import config from '../../../config';
import prisma from '../../../config/prisma';
import AppError from '../../errors/AppError';
import { IAuthUser, ILoginInput, ILoginResponse, IRegisterInput } from './auth.interface';

const createToken = (payload: IAuthUser): string => {
  return jwt.sign(payload, config.jwt.secret as jwt.Secret, {
    expiresIn: config.jwt.expires_in as any,
  });
};

const registerUser = async (payload: IRegisterInput): Promise<ILoginResponse> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError(StatusCodes.CONFLICT, 'An account with this email already exists!');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(payload.password, salt);

  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email.toLowerCase(),
      passwordHash,
      role: Role.ESTIMATOR,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  const token = createToken(newUser);

  return {
    user: newUser,
    token,
  };
};

const loginUser = async (payload: ILoginInput): Promise<ILoginResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password!');
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, user.passwordHash);

  if (!isPasswordMatch) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password!');
  }

  const authUser: IAuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = createToken(authUser);

  return {
    user: authUser,
    token,
  };
};

const getMe = async (userId: string): Promise<IAuthUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User profile not found!');
  }

  return user;
};

export const AuthServices = {
  registerUser,
  loginUser,
  getMe,
};
