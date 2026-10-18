import { describe, expect, it } from 'vitest';
import CalculationService, { IFeatureForCalculation } from '../calculation.service';

describe('CalculationService — Mathematical Formula Verification', () => {
  it('should return correct risk buffer percentages', () => {
    expect(CalculationService.getRiskBufferPercent('LOW')).toBe(5);
    expect(CalculationService.getRiskBufferPercent('MEDIUM')).toBe(12);
    expect(CalculationService.getRiskBufferPercent('HIGH')).toBe(20);
  });

  it('should calculate correct metrics for active features and exclude unchecked features', () => {
    const features: IFeatureForCalculation[] = [
      { estimatedHours: 20, isIncluded: true },
      { estimatedHours: 30, isIncluded: true },
      { estimatedHours: 50, isIncluded: false }, // Should be excluded!
    ];
    const hourlyRate = 50;
    const riskLevel = 'MEDIUM'; // 12%

    const result = CalculationService.calculateMetrics(features, hourlyRate, riskLevel);

    // Active hours = 20 + 30 = 50
    expect(result.totalHours).toBe(50);
    // Base Cost = 50 * 50 = $2500
    expect(result.baseCost).toBe(2500);
    // Risk buffer = 12% of 2500 = $300
    expect(result.riskBufferPercent).toBe(12);
    expect(result.riskBufferAmount).toBe(300);
    // Final Cost = 2500 + 300 = $2800
    expect(result.finalTotalCost).toBe(2800);
    // Weeks = ceil(50 / 30) = 2 weeks
    expect(result.estimatedWeeks).toBe(2);

    // Milestone 1 (30%) = 840
    expect(result.milestone1Amount).toBe(840);
    // Milestone 2 (40%) = 1120
    expect(result.milestone2Amount).toBe(1120);
    // Milestone 3 (30%) = 840
    expect(result.milestone3Amount).toBe(840);

    // Exactly matching sum without any rounding discrepancy
    const sumMilestones =
      result.milestone1Amount + result.milestone2Amount + result.milestone3Amount;
    expect(sumMilestones).toBe(result.finalTotalCost);
  });

  it('should handle decimal hours and guarantee 100% precision in milestone sum', () => {
    const features: IFeatureForCalculation[] = [
      { estimatedHours: 17.5, isIncluded: true },
      { estimatedHours: 33.3, isIncluded: true },
    ];
    const hourlyRate = 27.5;
    const riskLevel = 'HIGH'; // 20%

    const result = CalculationService.calculateMetrics(features, hourlyRate, riskLevel);

    const sumMilestones = Math.round(
      (result.milestone1Amount + result.milestone2Amount + result.milestone3Amount) * 100
    ) / 100;

    expect(sumMilestones).toBe(result.finalTotalCost);
  });

  it('should return 0 costs when all features are excluded', () => {
    const features: IFeatureForCalculation[] = [
      { estimatedHours: 25, isIncluded: false },
    ];
    const result = CalculationService.calculateMetrics(features, 30, 'LOW');

    expect(result.totalHours).toBe(0);
    expect(result.baseCost).toBe(0);
    expect(result.finalTotalCost).toBe(0);
    expect(result.estimatedWeeks).toBe(0);
    expect(result.milestone1Amount).toBe(0);
    expect(result.milestone2Amount).toBe(0);
    expect(result.milestone3Amount).toBe(0);
  });
});
