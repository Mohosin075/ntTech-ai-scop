import { ProjectStatus } from '@prisma/client';

export interface IGenerateProjectInput {
  title: string;
  rawRequirement: string;
}

export interface IUpdateProjectStatusInput {
  status: ProjectStatus;
  rejectionReason?: string;
}

export interface IUpdateProjectFeeInput {
  finalTotalCost: number;
}
