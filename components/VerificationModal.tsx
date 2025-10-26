"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import { Goal } from '@/types/goal';
import { useState } from 'react';
import { VERIFIERS } from '@/lib/solana/config';

interface VerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
}

export const VerificationModal = ({ open, onOpenChange, goal }: VerificationModalProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!goal) return null;

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Goal Submitted for Verification! ✨</DialogTitle>
          <DialogDescription>
            Your goal has been submitted to the blockchain. Verifiers can now vote on your completion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Goal Summary */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">{goal.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{goal.amountSol} SOL locked</Badge>
              <Badge variant="outline">Need 2 YES votes</Badge>
              <Badge className="bg-purple-500/20 text-purple-500">
                {goal.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Verifiers Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">📋 Registered Verifiers:</h4>
            {VERIFIERS.map((verifier, index) => (
              <div
                key={index}
                className="border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Verifier {index + 1}</span>
                  <Badge variant="outline" className="text-xs font-mono">
                    {verifier.toBase58().slice(0, 8)}...{verifier.toBase58().slice(-4)}
                  </Badge>
                </div>

                <div className="bg-muted/50 rounded p-3 font-mono text-xs break-all">
                  {verifier.toBase58()}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(verifier.toBase58(), index)}
                  className="w-full"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Address
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Current Status */}
          {goal.yesVotes > 0 || goal.noVotes > 0 ? (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-sm">
              <p className="text-accent font-semibold mb-2">🗳️ Voting Progress:</p>
              <div className="space-y-1 text-muted-foreground">
                <p>✅ YES votes: {goal.yesVotes} / 2</p>
                <p>❌ NO votes: {goal.noVotes} / 2</p>
                {goal.finalized && (
                  <p className="font-semibold text-accent mt-2">
                    {goal.yesVotes >= 2 ? '✅ Verification complete!' : '❌ Verification failed'}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-sm">
              <p className="text-accent font-semibold mb-1">📬 What happens next?</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• These verifiers can now vote on your goal</li>
                <li>• Once you get 2 YES votes, you can claim your funds!</li>
                <li>• If you get 2 NO votes, the goal fails</li>
                <li>• Use the Demo Controls to simulate votes for testing</li>
              </ul>
            </div>
          )}

          <Button onClick={() => onOpenChange(false)} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};