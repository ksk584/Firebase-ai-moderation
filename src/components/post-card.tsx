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
  return (
    <Link href={`/post/${post.id}`} className="block animate-in fade-in-0 duration-500">
      <Card className="w-full break-inside-avoid shadow-md hover:shadow-primary/20 transition-shadow">
        <CardHeader>
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarFallback>{post.authorEmail?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-sm font-medium">{post.authorEmail || 'Anonymous'}</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <p className="text-foreground/90 whitespace-pre-wrap truncate">{post.content}</p>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground p-4 pt-0">
          {post.createdAt ? (
            <p>{formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true })}</p>
          ) : (
            <p>just now</p>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
