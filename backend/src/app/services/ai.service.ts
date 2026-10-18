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
    // 1. If Gemini API key is configured, try Gemini API
    if (config.ai.gemini_api_key) {
      try {
        const geminiResult = await this.callGeminiAPI(title, rawRequirement);
        if (geminiResult) return geminiResult;
      } catch (err) {
        console.warn('⚠️ Gemini AI API error, falling back to Rule Engine:', err);
      }
    }

    // 2. If OpenAI API key is configured, try OpenAI API
    if (config.ai.openai_api_key) {
      try {
        const openaiResult = await this.callOpenAI(title, rawRequirement);
        if (openaiResult) return openaiResult;
      } catch (err) {
        console.warn('⚠️ OpenAI API error, falling back to Rule Engine:', err);
      }
    }

    // 3. Fallback Engine (Guaranteed 100% uptime, zero crashes)
    return this.generateFallbackEstimate(title, rawRequirement);
  }

  /**
   * Gemini 1.5/2.0 API call
   */
  private static async callGeminiAPI(
    title: string,
    rawRequirement: string
  ): Promise<IAIEstimateResult | null> {
    const prompt = this.buildPrompt(title, rawRequirement);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.ai.gemini_api_key}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    return {
      executiveSummary: parsed.executiveSummary,
      riskLevel: parsed.riskLevel as RiskLevel,
      recommendedStack: parsed.recommendedStack,
      aiConfidenceScore: Number(parsed.aiConfidenceScore) || 90,
      isFallbackUsed: false,
      features: parsed.features,
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
    return {
      executiveSummary: parsed.executiveSummary,
      riskLevel: parsed.riskLevel as RiskLevel,
      recommendedStack: parsed.recommendedStack,
      aiConfidenceScore: Number(parsed.aiConfidenceScore) || 92,
      isFallbackUsed: false,
      features: parsed.features,
    };
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
    const text = `${title} ${rawRequirement}`.toLowerCase();

    // 1. Risk Classification heuristic
    let riskLevel: RiskLevel = RiskLevel.MEDIUM;
    let confidence = 86;

    if (
      text.includes('ai') ||
      text.includes('blockchain') ||
      text.includes('realtime') ||
      text.includes('streaming') ||
      text.includes('microservice') ||
      text.includes('multi-vendor')
    ) {
      riskLevel = RiskLevel.HIGH;
      confidence = 82;
    } else if (
      text.includes('blog') ||
      text.includes('landing') ||
      text.includes('portfolio') ||
      text.includes('simple')
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
    if (text.includes('realtime') || text.includes('chat')) {
      recommendedStack.push('Socket.io', 'Redis');
    }
    if (text.includes('ai') || text.includes('machine learning')) {
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

    if (text.includes('e-commerce') || text.includes('shop') || text.includes('cart')) {
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
    } else if (text.includes('food') || text.includes('restaurant') || text.includes('delivery')) {
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
    } else if (text.includes('hospital') || text.includes('health') || text.includes('clinic')) {
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
    if (text.includes('ai') || text.includes('analytics') || text.includes('smart')) {
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

    const executiveSummary = `Comprehensive fullstack solution designed for "${title}". Engineered with a modular decoupled architecture, robust PostgreSQL relational schema, secure role-based access control, and scalable milestone-driven delivery milestones.`;

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
