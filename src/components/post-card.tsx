
'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Post } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from './ui/avatar';
import Link from 'next/link';
import { Button } from './ui/button';
import { MessageCircle, Trash2 } from 'lucide-react';
import { useAuth } from './auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ReportPostDialog } from './report-post-dialog';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const getInitials = (email?: string) => {
    if (!email) return 'A';
    return email[0].toUpperCase();
  };

  const getUsername = (email?: string) => {
    if (!email) return 'Anonymous';
    return email.substring(0, 5);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) return;
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
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };


  return (
    <Card className="w-full break-inside-avoid shadow-md hover:shadow-primary/20 transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{getInitials(post.authorEmail)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-sm font-medium">{getUsername(post.authorEmail)}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <Link href={`/post/${post.id}`} className="block">
          <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
        </Link>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground p-4 pt-0 justify-between">
        <div className="flex items-center gap-4">
            {post.createdAt ? (
                <p>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
            ) : (
                <p>just now</p>
            )}
             <ReportPostDialog post={post}>
              <Button variant="ghost" size="sm">
                <MessageCircle className="mr-2 h-4 w-4" />
                Report
              </Button>
            </ReportPostDialog>
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
}
