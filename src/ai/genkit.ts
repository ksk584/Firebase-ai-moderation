import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { geminiApiKey } from '@/lib/config';

export const ai = genkit({
  plugins: [googleAI({apiKey: geminiApiKey})],
  model: 'googleai/gemini-2.5-flash-latest',
});
