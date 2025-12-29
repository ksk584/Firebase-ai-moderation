
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import type { Post } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Ban, Flag } from 'lucide-react';
import { PostCard } from '@/components/post-card';
import { useAuth } from '@/components/auth-provider';
import { ReportUserDialog } from '@/components/report-user-dialog';
import { useBlocklist } from '@/hooks/use-blocklist';

export default function ProfilePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorInfo, setAuthorInfo] = useState<{ email: string; id: string } | null>(null);

  const params = useParams();
  const { id: authorId } = params;
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const { blocklist, addBlock, removeBlock } = useBlocklist();

  const isBlocked = authorId && typeof authorId === 'string' && blocklist.includes(authorId);

  useEffect(() => {
    if (!authorId || typeof authorId !== 'string') {
      setError('Invalid user ID.');
      setLoading(false);
      return;
    }

    const fetchUserPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/actions/get-user-posts/${authorId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user posts.');
        }
        const postData = await response.json();
        setPosts(postData);
        if (postData.length > 0) {
          setAuthorInfo({ email: postData[0].authorEmail, id: postData[0].authorId });
        } else {
            // If the user has no posts, we can't get their email. 
            // This is a limitation of the current anonymous data structure.
            // We'll just show their ID.
            setAuthorInfo({ email: 'Anonymous', id: authorId });
        }
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [authorId, toast]);

  const getUsername = (email?: string) => {
    if (!email || email === 'Anonymous') return 'Anonymous';
    return email.substring(0, 5);
  };

  const getInitials = (email?: string) => {
    if (!email || email === 'Anonymous') return 'A';
    return email[0].toUpperCase();
  };

  const handleBlockToggle = () => {
    if (typeof authorId !== 'string') return;
    if (isBlocked) {
      removeBlock(authorId);
      toast({ title: 'User Unblocked', description: `You will now see content from ${getUsername(authorInfo?.email)}.` });
    } else {
      addBlock(authorId);
      toast({ title: 'User Blocked', description: `You will no longer see content from ${getUsername(authorInfo?.email)}.` });
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
      );
    }

    if (error) {
      return <p className="text-destructive text-center">{error}</p>;
    }

    if (posts.length === 0) {
      return <p className="text-muted-foreground text-center">This user hasn't posted anything yet.</p>;
    }

    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    );
  };
  
  const profileAuthor = {
      id: authorId as string,
      email: authorInfo?.email || 'Anonymous',
  }

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-2xl min-h-screen py-8 px-4">
        <div className="mb-6">
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to feed
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-6 bg-card rounded-lg border">
          <Avatar className="h-24 w-24 text-4xl">
            <AvatarFallback>{getInitials(authorInfo?.email)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold">{getUsername(authorInfo?.email)}</h1>
            <p className="text-muted-foreground break-all">User ID: {authorId}</p>
          </div>
          {user && user.uid !== authorId && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleBlockToggle} variant={isBlocked ? 'default' : 'outline'}>
                <Ban className="mr-2 h-4 w-4" />
                {isBlocked ? 'Unblock' : 'Block'}
              </Button>
              <ReportUserDialog author={profileAuthor}>
                <Button variant="outline">
                  <Flag className="mr-2 h-4 w-4" />
                  Report User
                </Button>
              </ReportUserDialog>
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Posts</h2>
        {renderContent()}
      </main>
    </>
  );
}
