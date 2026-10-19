import { Feature, FeatureCategory, FeatureComplexity } from '@/types';

const COMPLEXITY_POINTS: Record<FeatureComplexity, number> = {
  LOW: 1.5,
  MEDIUM: 3,
  HIGH: 5,
};

const WORKSTREAM_WEIGHTS: Record<FeatureCategory, number> = {
  FRONTEND: 0.95,
  BACKEND: 1.1,
  DATABASE: 1.2,
  INTEGRATION: 1.25,
  AI: 1.35,
};

export const getFeatureScopePoints = (feature: Pick<Feature, 'category' | 'complexity'>) =>
  COMPLEXITY_POINTS[feature.complexity] * WORKSTREAM_WEIGHTS[feature.category];

export const getFeatureAllocation = (
  feature: Pick<Feature, 'category' | 'complexity'>,
  scopePointValue: number
) => getFeatureScopePoints(feature) * scopePointValue;

