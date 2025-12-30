
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-provider';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface ReportUserDialogProps {
  author: { id: string; email: string };
  children: React.ReactNode;
}

const reportReasons = [
  { id: 'impersonation', label: 'Impersonation' },
  { id: 'hate_speech', label: 'Hate Speech or Symbols' },
  { id: 'harassment', label: 'Harassment or Bullying' },
  { id: 'spam', label: 'Spam' },
  { id: 'other', label: 'Other' },
];

export function ReportUserDialog({ author, children }: ReportUserDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState('');
  const { toast } = useToast();
  const { user, db } = useAuth();


  const handleReport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

     if (!user || !db) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to report content.',
        });
        return;
    }

    if (!selectedReason) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please select a reason for reporting.',
        });
        return;
    }
    
    if (selectedReason === 'other' && !otherReason.trim()) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please specify a reason.',
        });
        return;
    }

    try {
        await addDoc(collection(db, 'reports'), {
            type: 'user',
            reportedId: author.id,
            reportedAuthorEmail: author.email,
            reporterId: user.uid,
            reporterEmail: user.email,
            reason: selectedReason,
            otherReason: selectedReason === 'other' ? otherReason : '',
            createdAt: serverTimestamp(),
        });

        toast({
            title: 'User Reported',
            description: 'Thank you for your feedback. We will review this user profile.',
        });
        
        setSelectedReason(null);
        setOtherReason('');
        const closeButton = document.getElementById(`close-report-user-${author.id}`);
        closeButton?.click();

    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Reporting Failed',
            description: error.message || 'Could not submit report.',
        });
    }
  };
  
  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        setSelectedReason(null);
        setOtherReason('');
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Report User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Why are you reporting this user? Your report is anonymous.
          </p>
          <RadioGroup
            value={selectedReason || ''}
            onValueChange={setSelectedReason}
            className="grid gap-2"
          >
            {reportReasons.map((reason) => (
              <div key={reason.id} className="flex items-center space-x-2">
                <RadioGroupItem value={reason.id} id={`user-${reason.id}`} />
                <Label htmlFor={`user-${reason.id}`}>{reason.label}</Label>
              </div>
            ))}
          </RadioGroup>
          {selectedReason === 'other' && (
            <Input
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              placeholder="Please specify..."
              className="mt-2"
            />
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
             <Button id={`close-report-user-${author.id}`} variant="ghost" onClick={(e) => e.stopPropagation()}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleReport}>Submit Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
