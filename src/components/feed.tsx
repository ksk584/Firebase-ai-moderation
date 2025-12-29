
'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useAuth } from './auth-provider';
import type { Post } from '@/lib/types';
import { PostCard } from './post-card';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useBlocklist } from '@/hooks/use-blocklist';

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { db } = useAuth();
  const { blocklist } = useBlocklist();


  useEffect(() => {
    if (!db) {
        setLoading(false);
        return;
    };

    setLoading(true);
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt;
        // Firestore timestamps need to be converted to a serializable format
        let serializableCreatedAt: string;
        if (createdAt instanceof Timestamp) {
            serializableCreatedAt = createdAt.toDate().toISOString();
        } else if (createdAt && typeof createdAt.seconds === 'number') {
            serializableCreatedAt = new Date(createdAt.seconds * 1000).toISOString();
        } else {
            serializableCreatedAt = new Date().toISOString();
        }

        return {
          id: doc.id,
          content: data.content,
          imageUrl: data.imageUrl,
          authorId: data.authorId,
          authorEmail: data.authorEmail,
          createdAt: serializableCreatedAt,
        } as Post;
      });
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch posts.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, toast]);

  if (!db) {
    return (
       <div className="w-full space-y-6">
        <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-36 w-full rounded-lg" />
        </div>
       </div>
    );
  }

  const filteredPosts = posts.filter(post => !blocklist.includes(post.authorId));

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-56 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              No posts yet. Be the first to share!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
