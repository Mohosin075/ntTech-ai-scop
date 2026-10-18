import { ProjectStatus } from '@prisma/client';

export interface IGenerateProjectInput {
  title: string;
  rawRequirement: string;
  hourlyRate: number;
}

export interface IUpdateProjectStatusInput {
  status: ProjectStatus;
  rejectionReason?: string;
}

export interface IUpdateHourlyRateInput {
  hourlyRate: number;
}
