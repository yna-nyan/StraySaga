import { GoogleGenAI } from '@google/genai';
import type { CatStatus } from '../types';

/**
 * Generates a contextual inner-monologue line for the cat using the
 * Google Generative AI API (Gemini).
 *
 * Returns null on any failure: missing API key, network error, quota
 * exceeded, or a 3-second timeout.
 *
 * Req 16.1 — uses cat name, archetype, Energy, Warmth, Trust as context.
 * Req 16.2 — returns null silently on any error or timeout.
 * Req 16.3 — uses the @google/genai package.
 */
export async function generateContextualLine(
  status: CatStatus,
  scenarioId: string
): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  if (!apiKey) {
    return null;
  }

  const prompt =
    `You are writing a short inner-monologue thought for a stray cat named ` +
    `"${status.name}" in a browser RPG called StraySaga. ` +
    `The cat's archetype is "${status.archetype}" and they are currently ` +
    `at the "${scenarioId}" location. ` +
    `Their current stats are: Energy ${status.energy}/${status.maxEnergy}, ` +
    `Warmth ${status.warmth}/100, Trust ${status.trust}/100. ` +
    `Write a single sentence of first-person thought from the cat's perspective ` +
    `that reflects their personality, current stats, and the location. ` +
    `Keep it under 20 words. Return only the sentence, no quotes, no punctuation beyond the sentence itself.`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Race the API call against a 3-second timeout (Req 16.2)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timed out')), 3000)
    );

    const generatePromise = ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const result = await Promise.race([generatePromise, timeoutPromise]);
    const text = result.text?.trim();

    return text || null;
  } catch {
    // Network failure, timeout, quota exceeded — fall back silently
    return null;
  }
}
