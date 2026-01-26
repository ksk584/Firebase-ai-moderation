# SafeSocial

Welcome to SafeSocial, a place to share your thoughts safely.

This is a Next.js application built with Firebase for real-time updates and authentication.

## Features

- **Anonymous Posting**: Share messages without revealing your identity.
- **Real-time Feed**: See new posts appear instantly.
- **AI Content Filtering**: Customize your feed by filtering out content based on your preferences.

## Getting Started

**IMPORTANT: You must complete these steps to run the application.**

1.  **Set up Firebase Configuration:**
    - Open the file `src/lib/config.ts`.
    - Replace the placeholder values in the `firebaseConfig` object with the configuration from your own Firebase project. You can find this in your project's settings in the Firebase console.

2.  **Set up AI Features:**
    - Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    - In `src/lib/config.ts`, replace the `REPLACE_WITH_YOUR_GEMINI_API_KEY` placeholder with your new key.
    - Open `src/ai/genkit.ts` and add the `googleAI` plugin back to the `plugins` array in the `genkit` configuration. It should look like this:
      ```typescript
      export const ai = genkit({
        plugins: [googleAI({apiKey: geminiApiKey})],
        model: 'googleai/gemini-2.5-flash',
      });
      ```

3.  **Firebase Setup:**
    - In the Firebase console, enable Authentication (Email/Password and Google sign-in methods).
    - Enable Firestore and create a collection named `posts`.

4.  **Run the App:**
    - Run the development server:
      ```bash
      npm run dev
      ```
    - Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
