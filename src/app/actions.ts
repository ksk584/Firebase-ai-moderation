'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function createPost(content: string) {
  if (!content.trim()) {
    return { error: 'Content cannot be empty.' };
  }

  try {
    await addDoc(collection(db, 'posts'), {
      content,
      createdAt: serverTimestamp(),
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error creating post:", error);
    return { error: 'Failed to create post.' };
  }
}
