import { BaseAIAgent } from './base';
import { AgentType } from '../types';

export class TrendRadarAgent extends BaseAIAgent {
  readonly type: AgentType = 'TREND_RADAR';

  protected buildPrompt(input: any, memory: any, _config: any): string { // _config kept for interface compatibility with BaseAIAgent + future extensions
    void _config;
    const { timeWindow = '30 days', categories = ['products', 'search'] } = input;

    return `Analyze current trends for ALAYA INSIDER.

Time window: ${timeWindow}
Focus areas: ${categories.join(', ')}

From available signals (search volume, affiliate performance, content engagement, recommendation lift), surface the 5-7 most interesting and actionable trends.

For each trend include:
- What is rising
- Why it matters now
- Specific product/article/brand examples
- Opportunity size / action recommendation

Be tasteful and editorial in your analysis.`;
  }
}
