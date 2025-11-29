'use server';
import { revalidatePath } from 'next/cache';
import { initializeApp, getApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = getApps().length === 0 ? initializeApp() : getApp();
const db = getFirestore(app);


export async function createPost(content: string) {
  if (!content.trim()) {
    return { error: 'Content cannot be empty.' };
  }

  try {
    await db.collection('posts').add({
      content,
      createdAt: new Date(),
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error creating post:", error);
    return { error: 'Failed to create post.' };
  }
}
