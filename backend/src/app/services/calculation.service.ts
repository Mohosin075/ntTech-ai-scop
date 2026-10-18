export type TRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface IFeatureForCalculation {
  estimatedHours: number;
  isIncluded: boolean;
}

export interface ICalculatedMetrics {
  totalHours: number;
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
    hourlyRate: number,
    riskLevel: TRiskLevel
  ): ICalculatedMetrics {
    const totalHours = features
      .filter((f) => f.isIncluded)
      .reduce((sum, f) => sum + Number(f.estimatedHours || 0), 0);

    const safeRate = Number(hourlyRate) > 0 ? Number(hourlyRate) : 25;
    const baseCost = Math.round(totalHours * safeRate * 100) / 100;

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
