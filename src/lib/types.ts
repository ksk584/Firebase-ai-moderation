
import type { Timestamp } from "firebase/firestore";

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  // Firestore timestamps can be serialized differently.
  // We handle the object shape, a direct Date object, or a string after JSON serialization.
  createdAt: Timestamp | { seconds: number; nanoseconds: number } | Date | string;
  authorId: string;
  authorEmail: string;
}

export interface Comment {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string; // Already serialized
  authorId: string;
  authorEmail: string;
  postId: string;
}
