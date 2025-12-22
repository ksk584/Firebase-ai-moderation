
'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Post } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from './ui/avatar';
import Link from 'next/link';
import { Button } from './ui/button';
import { MessageCircle, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from './auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ReportPostDialog } from './report-post-dialog';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { useState } from 'react';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);

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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (userVote === 'like') {
      setLikes(likes - 1);
      setUserVote(null);
    } else {
      setLikes(likes + 1);
      if (userVote === 'dislike') {
        setDislikes(dislikes - 1);
      }
      setUserVote('like');
    }
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (userVote === 'dislike') {
      setDislikes(dislikes - 1);
      setUserVote(null);
    } else {
      setDislikes(dislikes + 1);
      if (userVote === 'like') {
        setLikes(likes - 1);
      }
      setUserVote('dislike');
    }
  }


  return (
    <Card className="w-full break-inside-avoid shadow-md hover:shadow-primary/20 transition-shadow">
       <Link href={`/post/${post.id}`} className="block">
        <CardHeader>
            <div className="flex items-center gap-3">
            <Avatar>
                <AvatarFallback>{getInitials(post.authorEmail)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-sm font-medium">{getUsername(post.authorEmail)}</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
            {post.imageUrl && (
                <Dialog>
                <DialogTrigger asChild>
                    <div className="relative aspect-video w-full cursor-pointer">
                    <Image 
                        src={post.imageUrl}
                        alt="Post image"
                        fill
                        className="rounded-md object-cover border"
                    />
                    </div>
                </DialogTrigger>
                <DialogContent className="p-0 border-0 max-w-4xl">
                    <Image 
                        src={post.imageUrl}
                        alt="Post image"
                        width={1920}
                        height={1080}
                        className="rounded-md object-contain w-full h-full"
                    />
                </DialogContent>
                </Dialog>
            )}
            <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
        </CardContent>
      </Link>
      <CardFooter className="text-xs text-muted-foreground p-4 pt-0 justify-between items-center">
        <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" onClick={handleLike} className={userVote === 'like' ? 'text-primary' : ''}>
                <ThumbsUp className="mr-2 h-4 w-4" />
                {likes}
            </Button>
             <Button variant="ghost" size="sm" onClick={handleDislike} className={userVote === 'dislike' ? 'text-destructive' : ''}>
                <ThumbsDown className="mr-2 h-4 w-4" />
                {dislikes}
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/post/${post.id}`}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Comments
              </Link>
            </Button>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
            {post.createdAt ? (
                <p className="hidden sm:block">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
            ) : (
                <p className="hidden sm:block">just now</p>
            )}
             <ReportPostDialog post={post}>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }}>
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
