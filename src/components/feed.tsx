'use client';

import { useState, useEffect, useTransition } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from './auth-provider';
import type { Post } from '@/lib/types';
import { PostCard } from './post-card';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Filter, X } from 'lucide-react';
import { filterPosts } from '@/ai/flows/filter-posts';
import { useToast } from '@/hooks/use-toast';

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKeywords, setFilterKeywords] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [isFiltering, startFiltering] = useTransition();
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const { toast } = useToast();
  const { db } = useAuth();

  useEffect(() => {
    if (!db) return;
    setLoading(true);
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch posts.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, toast]);

  useEffect(() => {
    if (!activeFilter) {
      setFilteredPosts(posts);
      return;
    }

    startFiltering(async () => {
      const promises = posts.map(post => 
        filterPosts({ postContent: post.content, userPreferences: activeFilter })
      );

      try {
        const results = await Promise.all(promises);
        const safePosts = posts.filter((_, index) => results[index].isSafe);
        setFilteredPosts(safePosts);
      } catch (error) {
        console.error("AI filtering failed:", error);
        toast({
          variant: 'destructive',
          title: 'Filtering Error',
          description: 'Could not apply AI filter. Please try again.',
        });
        setFilteredPosts(posts); // Fallback to unfiltered posts
      }
    });
  }, [posts, activeFilter, toast]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilter(filterKeywords);
  };

  const clearFilter = () => {
    setFilterKeywords('');
    setActiveFilter('');
  };

  const displayedPosts = activeFilter ? filteredPosts : posts;

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
      <div className="p-4 rounded-lg bg-card border">
        <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="Filter posts with AI (e.g., 'no politics')"
            value={filterKeywords}
            onChange={(e) => setFilterKeywords(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">
            <Filter className="mr-2 h-4 w-4" />
            Apply Filter
          </Button>
        </form>
        {activeFilter && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span>Filtering by: "{activeFilter}"</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearFilter}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {loading || isFiltering ? (
          <>
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-36 w-full rounded-lg" />
          </>
        ) : displayedPosts.length > 0 ? (
          displayedPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              {activeFilter ? "No posts match your filter." : "No posts yet. Be the first to share!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
