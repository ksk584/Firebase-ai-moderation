
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { SendHorizonal, X, Paperclip } from 'lucide-react';
import { useAuth } from './auth-provider';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(280, 'Comment cannot exceed 280 characters'),
  image: z.any().optional(),
});

interface CommentFormProps {
  postId: string;
}

export function CommentForm({ postId }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Please select an image smaller than 2MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue('image', null);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to comment.',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
        const idToken = await user.getIdToken();
        
        const body = {
          content: values.content,
          imageUrl: imagePreview,
          postId,
        };

        const response = await fetch('/api/actions/create-comment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to create comment.');
        }

        form.reset();
        setImagePreview(null);
        toast({
          title: 'Success',
          description: 'Your comment has been posted.',
        });
        
        // No router.refresh() needed because CommentList uses a real-time listener

    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Could not create comment.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4 border rounded-lg p-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Add a comment..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {imagePreview && (
          <div className="relative">
            <Image
              src={imagePreview}
              alt="Image preview"
              width={200}
              height={150}
              className="rounded-md object-cover w-full aspect-video max-h-48"
            />
             <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove image</span>
            </Button>
          </div>
        )}

        <div className="flex justify-between items-center">
            <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
                <FormItem>
                <FormLabel htmlFor="comment-image-upload">
                    <Input id="comment-image-upload" type="file" accept="image/png, image/jpeg, image/gif" className="sr-only" onChange={handleImageChange} disabled={isSubmitting} />
                    <Button type="button" variant="ghost" size="icon" asChild>
                        <div>
                            <Paperclip className="h-5 w-5 text-muted-foreground" />
                            <span className="sr-only">Add image</span>
                        </div>
                    </Button>
                </FormLabel>
                <FormMessage />
                </FormItem>
            )}
            />

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post Comment'}
                <SendHorizonal className="ml-2 h-4 w-4" />
            </Button>
        </div>
      </form>
    </Form>
  );
}
