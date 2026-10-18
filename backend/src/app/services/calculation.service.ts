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
  /**
   * Returns risk buffer percentage based on RiskLevel
   * LOW -> 5%, MEDIUM -> 12%, HIGH -> 20%
   */
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

  /**
   * Pure calculation function for all project cost and milestone metrics
   */
  static calculateMetrics(
    features: IFeatureForCalculation[],
    hourlyRate: number,
    riskLevel: TRiskLevel
  ): ICalculatedMetrics {
    // 1. Total Hours: sum of active (isIncluded === true) features
    const totalHours = features
      .filter((f) => f.isIncluded)
      .reduce((sum, f) => sum + Number(f.estimatedHours || 0), 0);

    const safeRate = Number(hourlyRate) > 0 ? Number(hourlyRate) : 25;

    // 2. Base Cost: Total Hours * Hourly Rate
    const baseCost = Math.round(totalHours * safeRate * 100) / 100;

    // 3. Risk Buffer Amount
    const riskBufferPercent = this.getRiskBufferPercent(riskLevel);
    const riskBufferAmount =
      Math.round(baseCost * (riskBufferPercent / 100) * 100) / 100;

    // 4. Final Total Cost
    const finalTotalCost = Math.round((baseCost + riskBufferAmount) * 100) / 100;

    // 5. Estimated Weeks: ceil(totalHours / 30) (assuming 30 hrs/week)
    const estimatedWeeks = totalHours > 0 ? Math.ceil(totalHours / 30) : 0;

    // 6. Milestones (30% - 40% - 30% Rounding Safe)
    const milestone1Amount = Math.round(finalTotalCost * 0.3 * 100) / 100;
    const milestone2Amount = Math.round(finalTotalCost * 0.4 * 100) / 100;
    // Guaranteed 100% precision with zero cent drift
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
