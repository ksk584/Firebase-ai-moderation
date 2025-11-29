import type { Timestamp } from "firebase/firestore";

export interface Post {
  id: string;
  content: string;
  // Firestore timestamps can be serialized differently.
  // Let's handle both the object shape and the direct Date object after conversion.
  createdAt: Timestamp | { seconds: number; nanoseconds: number };
  authorId: string;
  authorEmail: string;
}
