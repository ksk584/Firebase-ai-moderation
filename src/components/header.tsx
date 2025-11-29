'use client';

import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export function Header() {
  const { user, auth } = useAuth();

  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <header className="bg-card border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="text-lg font-bold text-primary">SafeSocial</div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
