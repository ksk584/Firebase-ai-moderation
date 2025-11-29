'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Post } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="animate-in fade-in-0 duration-500">
      <Card className="w-full break-inside-avoid shadow-md hover:shadow-primary/20 transition-shadow">
        <CardContent className="p-6">
          <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground p-4 pt-0">
          {post.createdAt ? (
            <p>{formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}</p>
          ) : (
            <p>just now</p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
