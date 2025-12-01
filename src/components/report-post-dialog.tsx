
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
import { MessageCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Post } from '@/lib/types';

interface ReportPostDialogProps {
  post: Post;
  children: React.ReactNode;
}

const reportReasons = [
  { id: 'hate_speech', label: 'Hate Speech' },
  { id: 'harassment', label: 'Harassment' },
  { id: 'spam', label: 'Spam' },
  { id: 'misinformation', label: 'Misinformation' },
  { id: 'other', label: 'Other' },
];

export function ReportPostDialog({ post, children }: ReportPostDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState('');
  const { toast } = useToast();

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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

    // Here you would typically send the report to your backend
    console.log('Reporting post:', post.id);
    console.log('Reason:', selectedReason === 'other' ? otherReason : selectedReason);

    toast({
      title: 'Post Reported',
      description: 'Thank you for your feedback. We will review this post.',
    });
    setOpen(false);
    setSelectedReason(null);
    setOtherReason('');
  };
  
  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedReason(null);
      setOtherReason('');
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Why are you reporting this post? Your report is anonymous.
          </p>
          <RadioGroup
            value={selectedReason || ''}
            onValueChange={setSelectedReason}
            className="grid gap-2"
          >
            {reportReasons.map((reason) => (
              <div key={reason.id} className="flex items-center space-x-2">
                <RadioGroupItem value={reason.id} id={reason.id} />
                <Label htmlFor={reason.id}>{reason.label}</Label>
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
             <Button variant="ghost" onClick={(e) => e.stopPropagation()}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleReport}>Submit Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
