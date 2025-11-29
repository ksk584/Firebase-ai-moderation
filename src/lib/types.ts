import type { Timestamp } from "firebase/firestore";

export interface Post {
  id: string;
  content: string;
  createdAt: Timestamp;
  authorId: string;
  authorEmail: string;
}
