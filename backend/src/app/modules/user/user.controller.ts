import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const result = await UserServices.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.getSingleUserFromDB(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.updateUserIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.deleteUserFromDB(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const UserControllers = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
