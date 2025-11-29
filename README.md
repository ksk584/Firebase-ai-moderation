# AnonVerse

Welcome to AnonVerse, a place to share your thoughts anonymously.

This is a Next.js application built with Firebase for real-time updates and authentication.

## Features

- **Anonymous Posting**: Share messages without revealing your identity.
- **Real-time Feed**: See new posts appear instantly.
- **AI Content Filtering**: Customize your feed by filtering out content based on your preferences.

## Getting Started

First, set up your environment variables. Create a `.env.local` file in the root of the project by copying the `.env.example` file:

```bash
cp .env.example .env.local
```

Then, add your Firebase project configuration and Google API key to `.env.local`.

Next, enable Authentication (Anonymous sign-in) and Firestore in your Firebase project. Create a collection named `posts`.

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
