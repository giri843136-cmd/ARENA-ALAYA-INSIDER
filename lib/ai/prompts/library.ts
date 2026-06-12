/**
 * ALAYA INSIDER — Prompt Library
 */

import { PromptTemplate } from '../types';

export const PROMPT_LIBRARY: PromptTemplate[] = [
  {
    id: 'content_guide',
    name: 'Long-form Buying Guide',
    template: 'Write a warm, deeply considered buying guide for {{topic}} in the {{universe}} universe. Include 6-8 specific recommendations with why we love them, pros/cons, and alternatives.',
    variables: ['topic', 'universe'],
    agentType: 'CONTENT_ARCHITECT',
  },
  {
    id: 'seo_meta',
    name: 'SEO Meta + Schema',
    template: 'Optimize this for search: Title: {{title}}\nExcerpt: {{excerpt}}\nProvide perfect meta title, description, schema type, and 5 internal link suggestions.',
    variables: ['title', 'excerpt'],
    agentType: 'SEO_STRATEGIST',
  },
  {
    id: 'trend_radar',
    name: 'Monthly Trend Radar',
    template: 'From the last {{days}} days of data, surface the most interesting rising trends across products, search, and content. Be specific and actionable.',
    variables: ['days'],
    agentType: 'TREND_RADAR',
  },
  {
    id: 'faq_high_quality',
    name: 'High-Quality FAQ Set',
    template: 'Generate 8-10 genuinely helpful FAQs for {{productOrTopic}}. Make them natural and anticipate real reader questions.',
    variables: ['productOrTopic'],
    agentType: 'FAQ_GENERATOR',
  },
];

export function getPromptById(id: string): PromptTemplate | undefined {
  return PROMPT_LIBRARY.find(p => p.id === id);
}

export function getPromptsByCategory(category: string): PromptTemplate[] {
  // category not on type; filter by name contains for compat
  return PROMPT_LIBRARY.filter(p => p.name.toLowerCase().includes(category.toLowerCase()));
}
