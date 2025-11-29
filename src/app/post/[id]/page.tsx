'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Post } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';

export default function PostPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/actions/get-post/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch post.');
        }
        const postData = await response.json();
        setPost(postData);
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err.message || 'Could not fetch post.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, toast]);

  const getUsername = (email?: string) => {
    if (!email) return 'Anonymous';
    return email.substring(0, 5);
  };

  const getInitials = (email?: string) => {
    if (!email) return 'A';
    return email[0].toUpperCase();
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toast({
      title: 'Post Reported',
      description: 'Thank you for your feedback.',
    });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user || !post) return;
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/actions/delete-post/${post.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete post.');
      }
      toast({
        title: 'Success',
        description: 'Post deleted successfully.',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-24" />
          </CardFooter>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className="w-full text-center py-10">
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      );
    }

    if (!post) {
      return (
        <Card className="w-full text-center py-10">
          <CardContent>
            <p className="text-muted-foreground">Post not found.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full break-inside-avoid">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{getInitials(post.authorEmail)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-sm font-medium">{getUsername(post.authorEmail)}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground p-4 pt-0 justify-between">
           <div className="flex items-center gap-4">
              {post.createdAt ? (
                <p>{formatDistanceToNow(new Date(post.createdAt as string), { addSuffix: true })}</p>
              ) : (
                <p>just now</p>
              )}
               <Button variant="ghost" size="sm" onClick={handleReport}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Report
              </Button>
              {user && user.uid === post.authorId && (
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleDelete}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                  </Button>
              )}
           </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-2xl min-h-screen py-8 px-4">
        <div className="mb-4">
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to feed
            </Link>
          </Button>
        </div>
        <div className="space-y-8">{renderContent()}</div>
      </main>
    </>
  );
}
