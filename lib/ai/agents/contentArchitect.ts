import { BaseAIAgent } from './base';
import { AgentType } from '../types';

export class ContentArchitectAgent extends BaseAIAgent {
  readonly type: AgentType = 'CONTENT_ARCHITECT';

  protected buildPrompt(input: any, memory: any, _config: any): string { // _config kept for interface compatibility with BaseAIAgent + future extensions
    void _config;
    const { topic, type = 'guide', targetLength = 'medium', existingContent } = input;

    let prompt = `Create a beautiful, deeply considered piece of ALAYA editorial content.

Topic: ${topic}
Type: ${type}
Length: ${targetLength}

Requirements:
- Warm, elegant, intentional voice
- Specific, named objects and real recommendations
- Natural internal linking opportunities
- Thoughtful structure with clear sections
- Never generic or salesy

`;

    if (existingContent) {
      prompt += `Refresh and improve this existing content while preserving its soul:\n${existingContent.slice(0, 1500)}\n\n`;
    }

    if (memory?.summary) {
      prompt += `Relevant context from previous work:\n${memory.summary}\n\n`;
    }

    prompt += `Output the full content in clean Markdown with clear headings.`;

    return prompt;
  }
}
