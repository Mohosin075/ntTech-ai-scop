import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TaskServices } from './task.service';

const createTask = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskServices.createTaskIntoDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Task created successfully',
    data: result,
  });
});

const getAllTasks = catchAsync(async (req: Request, res: Response) => {
  const { userId, status } = req.query;
  const result = await TaskServices.getAllTasksFromDB({
    userId: userId as string | undefined,
    status: status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | undefined,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Tasks retrieved successfully',
    data: result,
  });
});

const getSingleTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TaskServices.getSingleTaskFromDB(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Task retrieved successfully',
    data: result,
  });
});

const updateTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TaskServices.updateTaskIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Task updated successfully',
    data: result,
  });
});

const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TaskServices.deleteTaskFromDB(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Task deleted successfully',
    data: result,
  });
});

export const TaskControllers = {
  createTask,
  getAllTasks,
  getSingleTask,
  updateTask,
  deleteTask,
};
