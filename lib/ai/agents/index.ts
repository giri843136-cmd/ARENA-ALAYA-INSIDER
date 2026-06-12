import { ContentArchitectAgent } from './contentArchitect';
import { SEOStrategistAgent } from './seoStrategist';
import { TrendRadarAgent } from './trendRadar';
import { BaseAIAgent } from './base';
import { AgentType } from '../types';

const agents = new Map<AgentType, BaseAIAgent>();

agents.set('CONTENT_ARCHITECT', new ContentArchitectAgent());
agents.set('SEO_STRATEGIST', new SEOStrategistAgent());
agents.set('TREND_RADAR', new TrendRadarAgent());
// Add more agents here as they are implemented

export function getAgent(type: AgentType): BaseAIAgent | undefined {
  return agents.get(type);
}

export { BaseAIAgent };
export * from './registry';
