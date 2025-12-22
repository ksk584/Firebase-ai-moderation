
'use client';

import { Feed } from '@/components/feed';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PostForm } from '@/components/post-form';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-2xl min-h-screen py-8 px-4">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-tight text-primary">
            SafeSocial
          </h1>
          <p className="text-muted-foreground mt-2">
            Share your thoughts. Stay safe.
          </p>
        </header>

        <div className="space-y-8">
          <Feed />
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
            size="icon"
          >
            <Plus className="h-8 w-8" />
            <span className="sr-only">Create Post</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share a thought</DialogTitle>
          </DialogHeader>
          {/* By passing a callback to close the dialog on success, we don't need to import the dialog context into the form */}
          <PostForm onPostSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
