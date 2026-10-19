import { ProjectStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProjectServices } from './project.service';

const generateProject = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await ProjectServices.generateProjectWithAI(userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'AI scope and milestone estimation generated successfully',
    data: result,
  });
});

const getAllProjects = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.query;
  const result = await ProjectServices.getAllProjectsFromDB(
    req.user!.id,
    req.user!.role,
    status as ProjectStatus | undefined
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Projects retrieved successfully',
    data: result,
  });
});

const getSingleProject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProjectServices.getSingleProjectFromDB(
    id,
    req.user!.id,
    req.user!.role
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Project retrieved successfully',
    data: result,
  });
});

const updateProjectStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const result = await ProjectServices.updateProjectStatus(
    id,
    userId,
    userRole,
    req.body
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Project status successfully updated to ${req.body.status}`,
    data: result,
  });
});

const updateProjectFee = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProjectServices.updateProjectFee(id, req.user!.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Fixed project fee updated successfully',
    data: result,
  });
});

const deleteProject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProjectServices.deleteProjectFromDB(id, req.user!.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Project deleted successfully',
    data: result,
  });
});

export const ProjectControllers = {
  generateProject,
  getAllProjects,
  getSingleProject,
  updateProjectStatus,
  updateProjectFee,
  deleteProject,
};
