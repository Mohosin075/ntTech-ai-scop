import { describe, expect, it } from 'vitest';
import CalculationService, { IFeatureForCalculation } from '../calculation.service';

describe('CalculationService — fixed-fee pricing', () => {
  it('should return correct risk buffer percentages', () => {
    expect(CalculationService.getRiskBufferPercent('LOW')).toBe(5);
    expect(CalculationService.getRiskBufferPercent('MEDIUM')).toBe(12);
    expect(CalculationService.getRiskBufferPercent('HIGH')).toBe(20);
  });

  it('prices included features by complexity and workstream, independently of hours', () => {
    const features: IFeatureForCalculation[] = [
      { estimatedHours: 20, isIncluded: true, category: 'FRONTEND', complexity: 'HIGH' },
      { estimatedHours: 30, isIncluded: true, category: 'BACKEND', complexity: 'MEDIUM' },
      { estimatedHours: 50, isIncluded: false, category: 'AI', complexity: 'HIGH' },
    ];
    const result = CalculationService.calculateMetrics(features, 300, 'MEDIUM');

    expect(result.totalHours).toBe(50);
    expect(result.totalScopePoints).toBeCloseTo(8.05);
    expect(result.baseCost).toBe(2415);
    expect(result.riskBufferPercent).toBe(12);
    expect(result.riskBufferAmount).toBe(289.8);
    expect(result.finalTotalCost).toBe(2704.8);
    expect(result.estimatedWeeks).toBe(2);
    const sumMilestones =
      result.milestone1Amount + result.milestone2Amount + result.milestone3Amount;
    expect(sumMilestones).toBe(result.finalTotalCost);

    const changedHours = features.map((feature) => ({ ...feature, estimatedHours: feature.estimatedHours * 2 }));
    expect(CalculationService.calculateMetrics(changedHours, 300, 'MEDIUM').finalTotalCost)
      .toBe(result.finalTotalCost);
  });

  it('reconciles a manually set fixed quote with risk and milestones', () => {
    const features: IFeatureForCalculation[] = [
      { estimatedHours: 17.5, isIncluded: true, category: 'AI', complexity: 'HIGH' },
      { estimatedHours: 33.3, isIncluded: true, category: 'DATABASE', complexity: 'MEDIUM' },
    ];
    const result = CalculationService.calculateMetricsForFixedFee(features, 12000, 'HIGH');

    expect(result.finalTotalCost).toBe(12000);
    expect(result.baseCost).toBe(10000);
    expect(result.riskBufferAmount).toBe(2000);
    expect(result.scopePointValue * result.totalScopePoints).toBeCloseTo(result.baseCost);
    expect(result.milestone1Amount + result.milestone2Amount + result.milestone3Amount)
      .toBe(result.finalTotalCost);
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
    expect(result.totalScopePoints).toBe(0);
  });
});
