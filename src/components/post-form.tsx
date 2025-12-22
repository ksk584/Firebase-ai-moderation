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
import { SendHorizonal, X } from 'lucide-react';
import { useAuth } from './auth-provider';

const formSchema = z.object({
  content: z.string().min(1, 'Post cannot be empty').max(280, 'Post cannot exceed 280 characters'),
  image: z.any().optional(),
});

interface PostFormProps {
  onPostSuccess?: () => void;
}

export function PostForm({ onPostSuccess }: PostFormProps) {
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
        description: 'You must be logged in to post.',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
        const idToken = await user.getIdToken();
        
        const body = {
          content: values.content,
          imageUrl: imagePreview,
        };

        const response = await fetch('/api/actions/create-post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to create post.');
        }

        form.reset();
        setImagePreview(null);
        toast({
          title: 'Success',
          description: 'Your post has been shared.',
        });
        
        router.refresh();
        onPostSuccess?.();

    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Could not create post.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="What's on your mind?..."
                  className="resize-none"
                  rows={4}
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
              width={400}
              height={300}
              className="rounded-md object-cover w-full aspect-video"
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

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
               <FormLabel htmlFor="image-upload" className={cn("w-full cursor-pointer", imagePreview && "hidden")}>
                <Input id="image-upload" type="file" accept="image/png, image/jpeg, image/gif" className="sr-only" onChange={handleImageChange} disabled={isSubmitting} />
                <div className="border-2 border-dashed border-muted-foreground/50 rounded-md p-4 text-center text-muted-foreground hover:bg-accent">
                    Add an image (optional)
                </div>
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post'}
            <SendHorizonal className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
