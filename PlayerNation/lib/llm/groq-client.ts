import type { MatchReport } from '@/types/match';
import { buildUserPrompt, parseMatchReport, SYSTEM_PROMPT } from '@/lib/llm/prompt';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const MAX_RETRIES = 2;

export class LlmError extends Error {
  constructor(
    message: string,
    public readonly code: 'missing_key' | 'rate_limit' | 'network' | 'parse' | 'api'
  ) {
    super(message);
    this.name = 'LlmError';
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateMatchReport(
  matchPayload: string,
  apiKey: string
): Promise<MatchReport> {
  if (!apiKey?.trim()) {
    throw new LlmError(
      'Groq API key is required. Add it in Settings or set EXPO_PUBLIC_GROQ_API_KEY.',
      'missing_key'
    );
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          temperature: 0.4,
          max_tokens: 4096,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(matchPayload) },
          ],
        }),
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') ?? '5', 10);
        if (attempt < MAX_RETRIES) {
          await sleep(retryAfter * 1000);
          continue;
        }
        throw new LlmError('Rate limit reached. Please wait a moment and try again.', 'rate_limit');
      }

      if (!response.ok) {
        const body = await response.text();
        throw new LlmError(
          `Groq API error (${response.status}): ${body.slice(0, 200)}`,
          'api'
        );
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;

      if (!content) {
        throw new LlmError('Empty response from LLM.', 'api');
      }

      return parseMatchReport(content);
    } catch (err) {
      if (err instanceof LlmError) throw err;

      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < MAX_RETRIES) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
    }
  }

  throw new LlmError(
    lastError?.message ?? 'Failed to generate report. Check your connection.',
    'network'
  );
}
