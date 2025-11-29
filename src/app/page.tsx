import { PostForm } from '@/components/post-form';
import { Feed } from '@/components/feed';

export default function Home() {
  return (
    <main className="container mx-auto max-w-2xl min-h-screen py-8 px-4">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold tracking-tight text-primary">
          AnonVerse
        </h1>
        <p className="text-muted-foreground mt-2">
          Share your thoughts. Stay anonymous.
        </p>
      </header>
      
      <div className="space-y-8">
        <PostForm />
        <Feed />
      </div>
    </main>
  );
}
