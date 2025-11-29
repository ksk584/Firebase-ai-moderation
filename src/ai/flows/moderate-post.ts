'use server';
/**
 * @fileOverview A content moderation AI agent.
 *
 * - moderatePost - A function that handles the post moderation process.
 * - ModeratePostInput - The input type for the moderatePost function.
 * - ModeratePostOutput - The return type for the moderatePost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModeratePostInputSchema = z.object({
  content: z.string().describe('The content of the post to be moderated.'),
});
export type ModeratePostInput = z.infer<typeof ModeratePostInputSchema>;

const ModeratePostOutputSchema = z.object({
  offensive: z
    .boolean()
    .describe('Whether or not the post is considered offensive.'),
  reason: z
    .string()
    .describe('The reason for the moderation decision, if applicable.'),
});
export type ModeratePostOutput = z.infer<typeof ModeratePostOutputSchema>;

export async function moderatePost(
  input: ModeratePostInput
): Promise<ModeratePostOutput> {
  return moderatePostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderatePostPrompt',
  input: {schema: ModeratePostInputSchema},
  output: {schema: ModeratePostOutputSchema},
  prompt: `You are an AI content moderator for a social media platform. Your task is to determine if a post is offensive.

  Analyze the following post content for any of the following violations:
  - Hate speech
  - Harassment
  - Violence
  - Self-harm
  - Nudity or sexual content
  
  Post Content: {{{content}}}
  
  If the post is offensive, set the 'offensive' field to true and provide a concise reason in the 'reason' field.
  If the post is not offensive, set the 'offensive' field to false and the 'reason' field to an empty string.`,
});

const moderatePostFlow = ai.defineFlow(
  {
    name: 'moderatePostFlow',
    inputSchema: ModeratePostInputSchema,
    outputSchema: ModeratePostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
