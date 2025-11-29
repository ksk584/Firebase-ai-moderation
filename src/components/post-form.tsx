'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { SendHorizonal } from 'lucide-react';
import { useAuth } from './auth-provider';

const formSchema = z.object({
  content: z.string().min(1, 'Post cannot be empty').max(280, 'Post cannot exceed 280 characters'),
});

export function PostForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  });

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
        
        const response = await fetch('/api/actions/create-post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ content: values.content }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to create post.');
        }

        form.reset();
        toast({
          title: 'Success',
          description: 'Your post has been shared.',
        });
        // Manually trigger a re-fetch of data on the page
        router.refresh();
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
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Share a thought</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="What\'s on your mind?..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
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
      </CardContent>
    </Card>
  );
}
