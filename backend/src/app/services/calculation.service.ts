import config from '../../config';

export type TRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface IFeatureForCalculation {
  estimatedHours: number;
  isIncluded: boolean;
  category?: 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'INTEGRATION' | 'AI';
  complexity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ICalculatedMetrics {
  totalHours: number;
  totalScopePoints: number;
  scopePointValue: number;
  baseCost: number;
  riskBufferPercent: number;
  riskBufferAmount: number;
  finalTotalCost: number;
  estimatedWeeks: number;
  milestone1Amount: number;
  milestone2Amount: number;
  milestone3Amount: number;
}

export class CalculationService {
  // South Asia delivery-studio baseline in USD per weighted scope point.
  // This is a fixed-scope pricing unit, never a per-hour client rate.
  static readonly DEFAULT_SCOPE_POINT_VALUE = config.pricing.south_asia_scope_point_usd;

  static getFeatureScopePoints(feature: Pick<IFeatureForCalculation, 'category' | 'complexity'>): number {
    const complexityPoints = {
      LOW: 1.5,
      MEDIUM: 3,
      HIGH: 5,
    }[feature.complexity || 'MEDIUM'];
    const workstreamWeight = {
      FRONTEND: 0.95,
      BACKEND: 1.1,
      DATABASE: 1.2,
      INTEGRATION: 1.25,
      AI: 1.35,
    }[feature.category || 'BACKEND'];

    return complexityPoints * workstreamWeight;
  }

  static getRiskBufferPercent(riskLevel: TRiskLevel): number {
    switch (riskLevel) {
      case 'LOW':
        return 5;
      case 'HIGH':
        return 20;
      case 'MEDIUM':
      default:
        return 12;
    }
  }

  static calculateMetrics(
    features: IFeatureForCalculation[],
    scopePointValue: number,
    riskLevel: TRiskLevel
  ): ICalculatedMetrics {
    const includedFeatures = features.filter((feature) => feature.isIncluded);
    const totalHours = includedFeatures.reduce(
      (sum, feature) => sum + Number(feature.estimatedHours || 0),
      0
    );
    const totalScopePoints = includedFeatures.reduce(
      (sum, feature) => sum + this.getFeatureScopePoints(feature),
      0
    );
    const safePointValue = Number(scopePointValue) > 0
      ? Number(scopePointValue)
      : this.DEFAULT_SCOPE_POINT_VALUE;
    // Fixed-fee allocation is based on scoped complexity, not delivery hours.
    const baseCost = Math.round(totalScopePoints * safePointValue * 100) / 100;

    const riskBufferPercent = this.getRiskBufferPercent(riskLevel);
    const riskBufferAmount = Math.round(baseCost * (riskBufferPercent / 100) * 100) / 100;

    const finalTotalCost = Math.round((baseCost + riskBufferAmount) * 100) / 100;
    const estimatedWeeks = totalHours > 0 ? Math.ceil(totalHours / 30) : 0;

    // 30% - 40% - 30% milestone distribution with zero cent drift
    const milestone1Amount = Math.round(finalTotalCost * 0.3 * 100) / 100;
    const milestone2Amount = Math.round(finalTotalCost * 0.4 * 100) / 100;
    const milestone3Amount =
      Math.round((finalTotalCost - milestone1Amount - milestone2Amount) * 100) / 100;

    return {
      totalHours,
      totalScopePoints,
      scopePointValue: safePointValue,
      baseCost,
      riskBufferPercent,
      riskBufferAmount,
      finalTotalCost,
      estimatedWeeks,
      milestone1Amount,
      milestone2Amount,
      milestone3Amount,
    };
  }

  static calculateMetricsForFixedFee(
    features: IFeatureForCalculation[],
    fixedFee: number,
    riskLevel: TRiskLevel
  ): ICalculatedMetrics {
    const includedFeatures = features.filter((feature) => feature.isIncluded);
    const totalHours = includedFeatures.reduce(
      (sum, feature) => sum + Number(feature.estimatedHours || 0),
      0
    );
    const totalScopePoints = includedFeatures.reduce(
      (sum, feature) => sum + this.getFeatureScopePoints(feature),
      0
    );
    const riskBufferPercent = this.getRiskBufferPercent(riskLevel);
    const finalTotalCost = Math.round(Number(fixedFee) * 100) / 100;
    const baseCost = Math.round((finalTotalCost / (1 + riskBufferPercent / 100)) * 100) / 100;
    const riskBufferAmount = Math.round((finalTotalCost - baseCost) * 100) / 100;
    const scopePointValue = totalScopePoints > 0 ? baseCost / totalScopePoints : this.DEFAULT_SCOPE_POINT_VALUE;
    const estimatedWeeks = totalHours > 0 ? Math.ceil(totalHours / 30) : 0;
    const milestone1Amount = Math.round(finalTotalCost * 0.3 * 100) / 100;
    const milestone2Amount = Math.round(finalTotalCost * 0.4 * 100) / 100;
    const milestone3Amount = Math.round((finalTotalCost - milestone1Amount - milestone2Amount) * 100) / 100;

    return {
      totalHours,
      totalScopePoints,
      scopePointValue,
      baseCost,
      riskBufferPercent,
      riskBufferAmount,
      finalTotalCost,
      estimatedWeeks,
      milestone1Amount,
      milestone2Amount,
      milestone3Amount,
    };
  }
}

export default CalculationService;
