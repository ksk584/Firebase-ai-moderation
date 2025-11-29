'use server';
import { revalidatePath } from 'next/cache';
import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { headers } from 'next/headers';

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
const adminAuth = getAdminAuth(getAdminApp());

export async function createPost(content: string) {
  const authorization = headers().get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return { error: 'Unauthorized' };
  }
  const idToken = authorization.split('Bearer ')[1];

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Error verifying token:', error);
    return { error: 'Unauthorized' };
  }
  
  const { uid, email } = decodedToken;

  if (!content.trim()) {
    return { error: 'Content cannot be empty.' };
  }

  try {
    await db.collection('posts').add({
      content,
      createdAt: new Date(),
      authorId: uid,
      authorEmail: email,
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error creating post:", error);
    return { error: 'Failed to create post.' };
  }
}
