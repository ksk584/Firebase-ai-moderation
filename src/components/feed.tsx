'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from './auth-provider';
import type { Post } from '@/lib/types';
import { PostCard } from './post-card';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { db } = useAuth();

  useEffect(() => {
    if (!db) return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch posts.' });
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
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

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-36 w-full rounded-lg" />
          </>
        ) : posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
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
