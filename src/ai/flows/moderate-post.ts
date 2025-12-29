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
  content: z.string().describe('The text content of the post to be moderated.'),
  imageUrl: z.string().nullable().optional().describe(
    "An optional image attached to the post, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
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
  prompt: `You are an AI content moderator for a social media platform. Your task is to determine if a post is offensive based on its text and/or image.

  Analyze the following post content for any of the following violations:
  - Hate speech
  - Harassment
  - Violence
  - Self-harm
  - Nudity or sexual content
  
  Post Text: {{{content}}}
  {{#if (ne imageUrl null)}}
  Post Image: {{media url=imageUrl}}
  {{/if}}

  If the post (either text or image) is offensive, set the 'offensive' field to true and provide a concise reason in the 'reason' field.
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
