'use server';
/**
 * @fileOverview A content moderation AI agent.
 *
 * - moderatePost - A function that handles the post moderation process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModeratePostInputSchema = z.object({
  content: z.string().describe('The text content of the post to be moderated.'),
  image: z
    .string()
    .optional()
    .describe(
      "An optional image associated with the post, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

const ModeratePostOutputSchema = z.object({
  offensive: z
    .boolean()
    .describe('Whether or not the post is considered offensive.'),
  reason: z
    .string()
    .describe('The reason for the moderation decision, if applicable.'),
});

export async function moderatePost(
  input: z.infer<typeof ModeratePostInputSchema>
): Promise<z.infer<typeof ModeratePostOutputSchema>> {
  return moderatePostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderatePostPrompt',
  input: {schema: ModeratePostInputSchema},
  output: {schema: ModeratePostOutputSchema},
  prompt: `You are an AI content moderator for a social media platform. Your task is to determine if a post is offensive based on its text and/or image content.

  Analyze the following post for any of the following violations:
  - Hate speech
  - Harassment
  - Violence
  - Self-harm
  - Sexually explicit content
  
  Post Text: {{{content}}}
  {{#if image}}
  Image: {{media url=image}}
  {{/if}}

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
    if (!output) {
      // Failsafe: if moderation is inconclusive, assume it's not offensive to avoid blocking the user.
      return { offensive: false, reason: '' };
    }
    return output;
  }
);
