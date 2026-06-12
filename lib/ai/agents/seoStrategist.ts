import { BaseAIAgent } from './base';
import { AgentType } from '../types';

export class SEOStrategistAgent extends BaseAIAgent {
  readonly type: AgentType = 'SEO_STRATEGIST';

  protected buildPrompt(input: any, memory: any, _config: any): string { // _config kept for interface compatibility with BaseAIAgent + future extensions
    void _config;
    const { title, content, targetKeywords = [] } = input;

    return `You are an elite SEO strategist for ALAYA INSIDER.

Content Title: ${title}
Target Keywords: ${targetKeywords.join(', ') || 'none specified'}

Current Content (excerpt):
${content?.slice(0, 1200) || 'N/A'}

Provide:
1. Optimized meta title (under 60 chars)
2. Compelling meta description (under 155 chars)
3. Schema.org recommendations (Article / Product / FAQPage etc.)
4. 5-7 high-value internal linking suggestions with anchor text
5. Entity opportunities and content gap notes
6. AI Overview / Voice search optimization notes

Be precise and actionable.`;
  }
}
