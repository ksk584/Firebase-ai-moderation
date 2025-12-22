
'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useAuth } from './auth-provider';
import type { Comment } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

interface CommentListProps {
    postId: string;
}

export function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { db } = useAuth();

  useEffect(() => {
    if (!db || !postId) {
        setLoading(false);
        return;
    };

    setLoading(true);
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt;
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
          postId: data.postId,
        } as Comment;
      });
      setComments(commentsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching comments:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch comments.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, postId, toast]);

    const getInitials = (email?: string) => {
        if (!email) return 'A';
        return email[0].toUpperCase();
    };

    const getUsername = (email?: string) => {
        if (!email) return 'Anonymous';
        return email.substring(0, 5);
    };

  if (loading) {
    return (
       <div className="space-y-4">
            <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
             <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
       </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {comments.length > 0 ? (
        comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
                <Avatar>
                    <AvatarFallback>{getInitials(comment.authorEmail)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <div className="flex items-baseline gap-2">
                        <p className="font-semibold text-sm">{getUsername(comment.authorEmail)}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                     <div className="text-sm text-foreground/90 space-y-4">
                        <p className="whitespace-pre-wrap">{comment.content}</p>
                        {comment.imageUrl && (
                            <Dialog>
                            <DialogTrigger asChild>
                                <div className="relative aspect-video w-full max-w-xs cursor-pointer">
                                <Image 
                                    src={comment.imageUrl}
                                    alt="Comment image"
                                    fill
                                    className="rounded-md object-cover border"
                                />
                                </div>
                            </DialogTrigger>
                            <DialogContent className="p-0 border-0 max-w-4xl">
                                <Image 
                                    src={comment.imageUrl}
                                    alt="Comment image"
                                    width={1920}
                                    height={1080}
                                    className="rounded-md object-contain w-full h-full"
                                />
                            </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>
            </div>
        ))
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No comments yet. Be the first to reply!</p>
        </div>
      )}
    </div>
  );
}

