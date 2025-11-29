'use server';
/**
 * @fileOverview Content filtering AI agent using GenAI.
 *
 * - filterPosts - A function that filters posts based on safety and preferences.
 * - FilterPostsInput - The input type for the filterPosts function.
 * - FilterPostsOutput - The return type for the filterPosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FilterPostsInputSchema = z.object({
  postContent: z.string().describe('The content of the post to be filtered.'),
  userPreferences: z
    .string()
    .describe(
      'The user preferences for content filtering, specified as keywords or topics to avoid.'
    ),
});
export type FilterPostsInput = z.infer<typeof FilterPostsInputSchema>;

const FilterPostsOutputSchema = z.object({
  isSafe: z
    .boolean()
    .describe(
      'Whether the content is considered safe and appropriate based on user preferences and general safety guidelines.'
    ),
  reason: z.string().describe('The reason for the filtering decision, if applicable.'),
});
export type FilterPostsOutput = z.infer<typeof FilterPostsOutputSchema>;

export async function filterPosts(input: FilterPostsInput): Promise<FilterPostsOutput> {
  return filterPostsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'filterPostsPrompt',
  input: {schema: FilterPostsInputSchema},
  output: {schema: FilterPostsOutputSchema},
  prompt: `You are an AI content filter designed to assess the safety and appropriateness of social media posts.

You will evaluate the post content based on the following criteria:

- Presence of offensive language, hate speech, or discriminatory content.
- Relevance to user preferences: Does the content align with or violate the user's specified preferences (topics to avoid)? User Preferences: {{{userPreferences}}}
- Overall safety and appropriateness for a general audience.

Post Content: {{{postContent}}}

Based on these criteria, determine whether the content is safe and appropriate. If the content is deemed unsafe or inappropriate, provide a clear and concise reason for the decision.

Return a boolean value for isSafe field, and a string for reason. If isSafe is true, reason should be null.
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const filterPostsFlow = ai.defineFlow(
  {
    name: 'filterPostsFlow',
    inputSchema: FilterPostsInputSchema,
    outputSchema: FilterPostsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
