"use client";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { Goal } from '@/types/goal';
import { copyToClipboard, shareOnTwitter } from '@/lib/blink';

interface VerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
}

export const VerificationModal = ({ open, onOpenChange, goal }: VerificationModalProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!goal || !goal.blinkLinks) return null;

  const handleCopy = async (link: string, index: number) => {
    const success = await copyToClipboard(link);
    if (success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleShare = (link: string) => {
    shareOnTwitter(
      `Help me verify my goal: "${goal.title}" 🎯`,
      link
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Verification Links Ready! ✨</DialogTitle>
          <DialogDescription>
            Share these Blink links with your verifiers. They can click to vote on your completion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Goal Summary */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">{goal.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{goal.amountSol} SOL locked</Badge>
              <Badge variant="outline">
                {goal.requiredVotes} {goal.requiredVotes === 1 ? 'vote' : 'votes'} needed
              </Badge>
            </div>
          </div>

          {/* Blink Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Verification Blinks:</h4>
            {goal.blinkLinks.map((blink, index) => (
              <div
                key={index}
                className="border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {goal.verificationType === 'friend' ? 'Friend Verifier' : `Verifier ${index + 1}`}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {blink.verifier}
                  </Badge>
                </div>

                <div className="bg-muted/50 rounded p-3 font-mono text-xs break-all">
                  {blink.link}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(blink.link, index)}
                    className="flex-1"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShare(blink.link)}
                    className="flex-1"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Share on X
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-sm">
            <p className="text-accent font-semibold mb-1">📬 What happens next?</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Share these links with your verifiers</li>
              <li>• They'll click and vote on whether you completed your goal</li>
              <li>• Once you get {goal.requiredVotes} {goal.requiredVotes === 1 ? 'approval' : 'approvals'}, you can claim your funds!</li>
            </ul>
          </div>

          <Button onClick={() => onOpenChange(false)} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
