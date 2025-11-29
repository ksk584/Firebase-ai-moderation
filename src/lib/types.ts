import type { Timestamp } from "firebase/firestore";

export interface Post {
  id: string;
  content: string;
  // Firestore timestamps can be serialized differently.
  // We handle the object shape, a direct Date object, or a string after JSON serialization.
  createdAt: Timestamp | { seconds: number; nanoseconds: number } | Date | string;
  authorId: string;
  authorEmail: string;
}
