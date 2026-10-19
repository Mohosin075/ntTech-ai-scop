import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FeatureServices } from './feature.service';

const addFeature = catchAsync(async (req: Request, res: Response) => {
  const { id: projectId } = req.params;
  const result = await FeatureServices.addFeatureToProject(
    projectId,
    req.user!.id,
    req.body
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Feature added and metrics recalculated successfully',
    data: result,
  });
});

const updateFeature = catchAsync(async (req: Request, res: Response) => {
  const { id: projectId, featureId } = req.params;
  const result = await FeatureServices.updateFeatureInProject(
    projectId,
    featureId,
    req.user!.id,
    req.body
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Feature updated and metrics recalculated successfully',
    data: result,
  });
});

const deleteFeature = catchAsync(async (req: Request, res: Response) => {
  const { id: projectId, featureId } = req.params;
  const result = await FeatureServices.deleteFeatureFromProject(
    projectId,
    featureId,
    req.user!.id
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Feature deleted and metrics recalculated successfully',
    data: result,
  });
});

export const FeatureControllers = {
  addFeature,
  updateFeature,
  deleteFeature,
};
