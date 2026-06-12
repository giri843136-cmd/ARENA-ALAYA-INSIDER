import { NextResponse } from 'next/server';
import { PROMPT_LIBRARY, getPromptById, getPromptsByCategory } from '@/lib/ai/prompts/library';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const id = searchParams.get('id');

  if (id) {
    return NextResponse.json(getPromptById(id) || { error: 'Not found' });
  }

  if (category) {
    return NextResponse.json(getPromptsByCategory(category));
  }

  return NextResponse.json({ prompts: PROMPT_LIBRARY });
}
