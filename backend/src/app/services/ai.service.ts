import { FeatureCategory, FeatureComplexity, RiskLevel } from '@prisma/client';
import config from '../../config';

export interface IAIFeatureItem {
  title: string;
  category: FeatureCategory;
  complexity: FeatureComplexity;
  estimatedHours: number;
}

export interface IAIEstimateResult {
  executiveSummary: string;
  riskLevel: RiskLevel;
  recommendedStack: string[];
  aiConfidenceScore: number;
  isFallbackUsed: boolean;
  features: IAIFeatureItem[];
}

export class AIService {
  /**
   * Main entry point to generate an AI scope and cost estimate
   */
  static async generateScope(
    title: string,
    rawRequirement: string
  ): Promise<IAIEstimateResult> {
    if (config.ai.gemini_api_key) {
      try {
        const geminiResult = await this.callGeminiAPI(title, rawRequirement);
        if (geminiResult) return geminiResult;
      } catch (err) {
        console.warn('[AIService] Gemini API error, falling back to rule engine:', err);
      }
    }

    if (config.ai.openai_api_key) {
      try {
        const openaiResult = await this.callOpenAI(title, rawRequirement);
        if (openaiResult) return openaiResult;
      } catch (err) {
        console.warn('[AIService] OpenAI API error, falling back to rule engine:', err);
      }
    }

    // Default offline deterministic estimation engine
    return this.generateFallbackEstimate(title, rawRequirement);
  }

  /**
   * Gemini API call
   */
  private static async callGeminiAPI(
    title: string,
    rawRequirement: string
  ): Promise<IAIEstimateResult | null> {
    const prompt = this.buildPrompt(title, rawRequirement);
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.ai.gemini_api_key,
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    if (!this.isValidEstimate(parsed)) return null;
    return {
      executiveSummary: parsed.executiveSummary,
      riskLevel: parsed.riskLevel as RiskLevel,
      recommendedStack: parsed.recommendedStack,
      aiConfidenceScore: Number(parsed.aiConfidenceScore) || 90,
      isFallbackUsed: false,
      features: parsed.features as IAIFeatureItem[],
    };
  }

  /**
   * OpenAI API call
   */
  private static async callOpenAI(
    title: string,
    rawRequirement: string
  ): Promise<IAIEstimateResult | null> {
    const prompt = this.buildPrompt(title, rawRequirement);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(15000),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.openai_api_key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;

    const parsed = JSON.parse(text);
    if (!this.isValidEstimate(parsed)) return null;
    return {
      executiveSummary: parsed.executiveSummary,
      riskLevel: parsed.riskLevel as RiskLevel,
      recommendedStack: parsed.recommendedStack,
      aiConfidenceScore: Number(parsed.aiConfidenceScore) || 92,
      isFallbackUsed: false,
      features: parsed.features as IAIFeatureItem[],
    };
  }

  private static isValidEstimate(value: unknown): boolean {
    if (!value || typeof value !== 'object') return false;
    const result = value as Record<string, unknown>;
    if (
      typeof result.executiveSummary !== 'string' ||
      !result.executiveSummary.trim() ||
      !Object.values(RiskLevel).includes(result.riskLevel as RiskLevel) ||
      !Array.isArray(result.recommendedStack) ||
      result.recommendedStack.length === 0 ||
      !result.recommendedStack.every((item) => typeof item === 'string') ||
      typeof result.aiConfidenceScore !== 'number' ||
      !Number.isFinite(result.aiConfidenceScore) ||
      result.aiConfidenceScore < 0 ||
      result.aiConfidenceScore > 100 ||
      !Array.isArray(result.features) ||
      result.features.length < 6 ||
      result.features.length > 8
    ) {
      return false;
    }

    return result.features.every((feature: unknown) => {
      if (!feature || typeof feature !== 'object') return false;
      const item = feature as Record<string, unknown>;
      return (
        typeof item.title === 'string' &&
        item.title.trim().length > 0 &&
        Object.values(FeatureCategory).includes(item.category as FeatureCategory) &&
        Object.values(FeatureComplexity).includes(item.complexity as FeatureComplexity) &&
        typeof item.estimatedHours === 'number' &&
        Number.isFinite(item.estimatedHours) &&
        item.estimatedHours >= 1 &&
        item.estimatedHours <= 200
      );
    });
  }

  private static buildPrompt(title: string, rawRequirement: string): string {
    return `You are an expert software architect and scoping engine.
Analyze this software project requirement and output valid JSON only:
Title: "${title}"
Requirement: "${rawRequirement}"

JSON schema required:
{
  "executiveSummary": "2-3 sentence executive summary of scope, architecture, and delivery path",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "recommendedStack": ["string", "string"],
  "aiConfidenceScore": 85,
  "features": [
    {
      "title": "Feature Name",
      "category": "FRONTEND" | "BACKEND" | "DATABASE" | "INTEGRATION" | "AI",
      "complexity": "LOW" | "MEDIUM" | "HIGH",
      "estimatedHours": 20
    }
  ]
}
Include exactly 6 to 8 core features. Respond with JSON only.`;
  }

  /**
   * Domain-aware, intelligent Fallback Generator
   */
  public static generateFallbackEstimate(
    title: string,
    rawRequirement: string
  ): IAIEstimateResult {
    const normalizedText = ` ${`${title} ${rawRequirement}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()} `;
    const hasAny = (...terms: string[]) =>
      terms.some((term) => {
        const normalizedTerm = term.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        return normalizedText.includes(` ${normalizedTerm} `);
      });

    // 1. Risk Classification heuristic
    let riskLevel: RiskLevel = RiskLevel.MEDIUM;
    let confidence = 86;

    if (
      hasAny('ai', 'blockchain', 'real time', 'realtime', 'streaming', 'microservice', 'microservices', 'multi-vendor', 'high availability', 'payment gateway', 'recurring payments')
    ) {
      riskLevel = RiskLevel.HIGH;
      confidence = 82;
    } else if (
      hasAny('blog', 'landing', 'portfolio', 'simple')
    ) {
      riskLevel = RiskLevel.LOW;
      confidence = 94;
    }

    // 2. Tech stack recommendation
    const recommendedStack = [
      'Next.js 15 (React 19)',
      'TypeScript',
      'Tailwind CSS',
      'Node.js & Express',
      'PostgreSQL',
      'Prisma ORM',
    ];
    if (hasAny('real time', 'realtime', 'chat')) {
      recommendedStack.push('Socket.io', 'Redis');
    }
    if (hasAny('ai', 'machine learning')) {
      recommendedStack.push('OpenAI / Gemini API');
    }

    // 3. Domain feature selection
    const features: IAIFeatureItem[] = [
      {
        title: 'Authentication & Role-Based Access Control (RBAC)',
        category: FeatureCategory.BACKEND,
        complexity: FeatureComplexity.MEDIUM,
        estimatedHours: 18,
      },
      {
        title: 'Database Schema Design & Migration Pipeline',
        category: FeatureCategory.DATABASE,
        complexity: FeatureComplexity.MEDIUM,
        estimatedHours: 14,
      },
    ];

    if (hasAny('e-commerce', 'ecommerce', 'shop', 'cart', 'product catalog')) {
      features.push(
        {
          title: 'Product Catalog & Advanced Multi-Facet Filtering',
          category: FeatureCategory.FRONTEND,
          complexity: FeatureComplexity.MEDIUM,
          estimatedHours: 24,
        },
        {
          title: 'Shopping Cart & Secure Checkout Flow',
          category: FeatureCategory.FRONTEND,
          complexity: FeatureComplexity.HIGH,
          estimatedHours: 30,
        },
        {
          title: 'Stripe / SSLCommerz Payment Gateway Integration',
          category: FeatureCategory.INTEGRATION,
          complexity: FeatureComplexity.HIGH,
          estimatedHours: 22,
        },
        {
          title: 'Order Processing & Inventory Synchronization Engine',
          category: FeatureCategory.BACKEND,
          complexity: FeatureComplexity.HIGH,
          estimatedHours: 26,
        }
      );
    } else if (hasAny('food', 'restaurant', 'meal', 'menu')) {
      features.push(
        {
          title: 'Restaurant Menu & Add-on Item Selection UI',
          category: FeatureCategory.FRONTEND,
          complexity: FeatureComplexity.MEDIUM,
          estimatedHours: 20,
        },
        {
          title: 'Real-time GPS Delivery Tracking & Map Integration',
          category: FeatureCategory.INTEGRATION,
          complexity: FeatureComplexity.HIGH,
          estimatedHours: 32,
        },
        {
          title: 'Order Dispatch & Driver Assignment Backend Queue',
          category: FeatureCategory.BACKEND,
          complexity: FeatureComplexity.HIGH,
          estimatedHours: 28,
        },
        {
          title: 'In-app Push Notifications for Order Status Updates',
          category: FeatureCategory.INTEGRATION,
          complexity: FeatureComplexity.MEDIUM,
          estimatedHours: 16,
        }
      );
    } else if (hasAny('hospital', 'health', 'clinic', 'patient', 'medical')) {
      features.push(
        {
          title: 'Doctor Appointment Scheduling & Calendar Booking',
          category: FeatureCategory.FRONTEND,
          complexity: FeatureComplexity.MEDIUM,
          estimatedHours: 25,
        },
        {
          title: 'Patient Electronic Health Records (EHR) Storage & Encryption',
          category: FeatureCategory.DATABASE,
          complexity: FeatureComplexity.HIGH,
          estimatedHours: 28,
        },
        {
          title: 'Prescription Generator & Diagnostic Report Uploads',
          category: FeatureCategory.BACKEND,
          complexity: FeatureComplexity.MEDIUM,
          estimatedHours: 20,
        },
        {
          title: 'Doctor & Patient Consultation Dashboard',
          category: FeatureCategory.FRONTEND,
          complexity: FeatureComplexity.MEDIUM,
          estimatedHours: 22,
        }
      );
    } else if (hasAny('courier', 'logistics', 'rider', 'cash on delivery', 'delivery otp', 'merchant settlement')) {
      features.push(
        {
          title: 'Cash-on-Delivery Collection & Merchant Settlement',
          category: FeatureCategory.BACKEND,
          complexity: FeatureComplexity.HIGH,
          estimatedHours: 28,
        },
        {
          title: 'Rider Payout Balancing & Delivery Reconciliation',
          category: FeatureCategory.BACKEND,
          complexity: FeatureComplexity.HIGH,
          estimatedHours: 24,
        },
        {
          title: 'Delivery OTP Confirmation & Status Integration',
          category: FeatureCategory.INTEGRATION,
          complexity: FeatureComplexity.MEDIUM,
          estimatedHours: 18,
        },
        {
          title: 'Merchant Ledger & Operations Reporting',
          category: FeatureCategory.DATABASE,
          complexity: FeatureComplexity.HIGH,
          estimatedHours: 22,
        }
      );
    } else if (hasAny('payment', 'gateway', 'bkash', 'nagad', 'webhook', 'reconciliation', 'ledger', 'subscription', 'refund')) {
      features.push(
        {
          title: 'Payment Gateway Orchestration & Webhook Handling',
          category: FeatureCategory.INTEGRATION,
          complexity: FeatureComplexity.HIGH,
          estimatedHours: 26,
        },
        {
          title: 'Recurring Billing, Token Lifecycle & Subscription Management',
          category: FeatureCategory.BACKEND,
          complexity: FeatureComplexity.HIGH,
          estimatedHours: 24,
        },
        {
          title: 'Dispute, Refund & Payment Status Workflow',
          category: FeatureCategory.BACKEND,
          complexity: FeatureComplexity.HIGH,
          estimatedHours: 20,
        },
        {
          title: 'Merchant Ledger Reconciliation & Settlement Reports',
          category: FeatureCategory.DATABASE,
          complexity: FeatureComplexity.HIGH,
          estimatedHours: 26,
        }
      );
    } else {
      // Default modern SaaS application features
      features.push(
        {
          title: 'Core Business Entity CRUD & RESTful API Architecture',
          category: FeatureCategory.BACKEND,
          complexity: FeatureComplexity.MEDIUM,
          estimatedHours: 24,
        },
        {
          title: 'Responsive Admin & User Operations Dashboard',
          category: FeatureCategory.FRONTEND,
          complexity: FeatureComplexity.HIGH,
          estimatedHours: 28,
        },
        {
          title: 'Automated Status Workflow & Audit Log State Machine',
          category: FeatureCategory.BACKEND,
          complexity: FeatureComplexity.MEDIUM,
          estimatedHours: 20,
        },
        {
          title: 'Data Export (CSV/PDF) & Reporting Engine',
          category: FeatureCategory.INTEGRATION,
          complexity: FeatureComplexity.LOW,
          estimatedHours: 14,
        }
      );
    }

    // AI or Analytics feature
    if (hasAny('ai', 'machine learning', 'recommendation engine', 'intelligent assistant')) {
      features.push({
        title: 'Intelligent AI Recommendations & Insights Engine',
        category: FeatureCategory.AI,
        complexity: FeatureComplexity.HIGH,
        estimatedHours: 25,
      });
    } else {
      features.push({
        title: 'Analytical KPI Metrics & Performance Summary Cards',
        category: FeatureCategory.FRONTEND,
        complexity: FeatureComplexity.LOW,
        estimatedHours: 12,
      });
    }

    const focus = features
      .slice(2, 5)
      .map((feature) => feature.title.toLowerCase())
      .join(', ');
    const executiveSummary = `Estimate for "${title}" focused on ${focus}. The baseline includes the core data and access-control work needed to deliver these features. Review feature hours and assumptions before submitting the scope for approval.`;

    return {
      executiveSummary,
      riskLevel,
      recommendedStack,
      aiConfidenceScore: confidence,
      isFallbackUsed: true,
      features,
    };
  }
}

export default AIService;
