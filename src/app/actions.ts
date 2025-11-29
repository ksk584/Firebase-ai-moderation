'use server';
import { revalidatePath } from 'next/cache';
import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Note: This is a server-side only file.
// Do not use client-side firebase imports here.

function getAdminApp(): App {
    if (getApps().length > 0) {
        return getApp();
    }
    // This will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
    // for authentication, which is automatically set in App Hosting.
    // When running locally, you will need to set this variable yourself.
    return initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
}

const db = getFirestore(getAdminApp());

export async function createPost(content: string) {
  if (!content.trim()) {
    return { error: 'Content cannot be empty.' };
  }

  try {
    await db.collection('posts').add({
      content,
      // Use Firestore server timestamp for consistency
      createdAt: new Date(),
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error creating post:", error);
    return { error: 'Failed to create post.' };
  }
}
