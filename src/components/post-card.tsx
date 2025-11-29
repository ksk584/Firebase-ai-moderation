'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Post } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from './ui/avatar';
import Link from 'next/link';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const getInitials = (email?: string) => {
    if (!email) return 'A';
    return email[0].toUpperCase();
  }

  const getUsername = (email?: string) => {
    if (!email) return 'Anonymous';
    return email.substring(0, 5);
  }

  return (
    <Link href={`/post/${post.id}`} className="block animate-in fade-in-0 duration-500">
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
          <p className="text-foreground/90 whitespace-pre-wrap truncate">{post.content}</p>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground p-4 pt-0">
          {post.createdAt ? (
            <p>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
          ) : (
            <p>just now</p>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
