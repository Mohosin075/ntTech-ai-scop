import { FeatureCategory, FeatureComplexity } from '@prisma/client';

export interface ICreateFeatureInput {
  title: string;
  category: FeatureCategory;
  complexity: FeatureComplexity;
  estimatedHours: number;
  isIncluded?: boolean;
}

export interface IUpdateFeatureInput {
  title?: string;
  category?: FeatureCategory;
  complexity?: FeatureComplexity;
  estimatedHours?: number;
  isIncluded?: boolean;
}
