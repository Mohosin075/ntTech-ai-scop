export type Role = 'ESTIMATOR' | 'ADMIN';

export type ProjectStatus = 'AI_ESTIMATED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type FeatureCategory = 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'INTEGRATION' | 'AI';

export type FeatureComplexity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Feature {
  id: string;
  projectId: string;
  title: string;
  category: FeatureCategory;
  complexity: FeatureComplexity;
  estimatedHours: number;
  isIncluded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  createdById: string;
  title: string;
  rawRequirement: string;
  hourlyRate: number;
  status: ProjectStatus;
  executiveSummary: string;
  riskLevel: RiskLevel;
  recommendedStack: string[];
  aiConfidenceScore: number;
  isFallbackUsed: boolean;
  totalHours: number;
  baseCost: number;
  riskBufferPercent: number;
  riskBufferAmount: number;
  finalTotalCost: number;
  estimatedWeeks: number;
  milestone1Amount: number;
  milestone2Amount: number;
  milestone3Amount: number;
  rejectionReason?: string | null;
  reviewedById?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  reviewedBy?: User | null;
  features: Feature[];
  _count?: {
    features: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface AuthResponse {
  user: User;
  token: string;
}
