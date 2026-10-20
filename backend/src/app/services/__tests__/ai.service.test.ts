import { describe, expect, it } from 'vitest';
import AIService from '../ai.service';

describe('AIService — deterministic fallback evaluation', () => {
  it('builds a bounded, domain-relevant estimate for a healthcare brief', () => {
    const estimate = AIService.generateFallbackEstimate(
      'Clinic appointment platform',
      'A clinic system for patient records, doctor schedules, appointment booking, and prescriptions.'
    );

    expect(estimate.isFallbackUsed).toBe(true);
    expect(estimate.riskLevel).toBe('MEDIUM');
    expect(estimate.features.length).toBeGreaterThanOrEqual(6);
    expect(estimate.features.length).toBeLessThanOrEqual(8);
    expect(estimate.features.some((feature) => /appointment|patient|doctor/i.test(feature.title))).toBe(true);
    expect(estimate.features.every((feature) => feature.estimatedHours >= 1 && feature.estimatedHours <= 200)).toBe(true);
    expect(estimate.recommendedStack.length).toBeGreaterThan(0);
  });

  it('classifies a simple portfolio as low risk and returns a stable fallback shape', () => {
    const estimate = AIService.generateFallbackEstimate(
      'Simple portfolio website',
      'A simple portfolio and landing page for a freelance designer.'
    );

    expect(estimate.riskLevel).toBe('LOW');
    expect(estimate.aiConfidenceScore).toBeGreaterThanOrEqual(0);
    expect(estimate.aiConfidenceScore).toBeLessThanOrEqual(100);
    expect(estimate.features.length).toBeGreaterThanOrEqual(6);
    expect(estimate.features.length).toBeLessThanOrEqual(8);
    expect(estimate.executiveSummary).toContain('Simple portfolio website');
  });

  it('accurately scopes a UI redesign and image/color update without boilerplate auth or db', () => {
    const estimate = AIService.generateFallbackEstimate(
      'Website design update',
      'I have a new design but I need redesign it, simple update some image and color'
    );

    expect(estimate.isFallbackUsed).toBe(true);
    expect(estimate.riskLevel).toBe('LOW');
    expect(estimate.features.length).toBe(4);
    expect(estimate.features.some((f) => /authentication|database/i.test(f.title))).toBe(false);
    expect(estimate.features.some((f) => /color|palette/i.test(f.title))).toBe(true);
    expect(estimate.features.some((f) => /image|asset/i.test(f.title))).toBe(true);
    const totalHours = estimate.features.reduce((sum, f) => sum + f.estimatedHours, 0);
    expect(totalHours).toBeLessThanOrEqual(20);
  });
});

