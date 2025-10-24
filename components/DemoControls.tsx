"use client";
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';

interface DemoControlsProps {
  activeGoalId: string | null;
  onVoteSuccess: () => void;
}

export const DemoControls = ({ activeGoalId, onVoteSuccess }: DemoControlsProps) => {
  const { toast } = useToast();
  const [verifierWallet, setVerifierWallet] = useState('demo-verifier-1');
  const [voteType, setVoteType] = useState<'yes' | 'no'>('yes');
  const [voting, setVoting] = useState(false);

  const handleSimulateVote = async () => {
    if (!activeGoalId) {
      toast({
        title: 'No active goal',
        description: 'Create and activate a goal first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setVoting(true);
      const result = await mockApi.vote(activeGoalId, verifierWallet, voteType);
      
      toast({
        title: `Vote ${voteType === 'yes' ? 'Approved' : 'Rejected'}! ✅`,
        description: result.verified 
          ? 'Goal is now verified! You can claim funds.'
          : `Vote recorded. ${result.votes.filter(v => v.vote === 'yes').length} approvals so far.`,
      });
      
      onVoteSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to simulate vote',
        variant: 'destructive',
      });
    } finally {
      setVoting(false);
    }
  };

  return (
    <Card className="p-4 bg-muted/30 border-dashed">
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
            🎭 Demo Controls
            <span className="text-xs font-normal text-muted-foreground">(For hackathon demo)</span>
          </h4>
          <p className="text-xs text-muted-foreground">
            Simulate verifier votes to test the flow without waiting for real verifiers
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="verifier" className="text-xs">Verifier Wallet</Label>
          <Input
            id="verifier"
            value={verifierWallet}
            onChange={(e) => setVerifierWallet(e.target.value)}
            placeholder="Enter verifier wallet"
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Vote Type</Label>
          <RadioGroup
            value={voteType}
            onValueChange={(value) => setVoteType(value as 'yes' | 'no')}
            className="flex gap-2"
          >
            <div className="flex items-center space-x-1 flex-1">
              <RadioGroupItem value="yes" id="vote-yes" />
              <Label htmlFor="vote-yes" className="text-xs cursor-pointer flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" /> Approve
              </Label>
            </div>
            <div className="flex items-center space-x-1 flex-1">
              <RadioGroupItem value="no" id="vote-no" />
              <Label htmlFor="vote-no" className="text-xs cursor-pointer flex items-center gap-1">
                <ThumbsDown className="w-3 h-3" /> Reject
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          onClick={handleSimulateVote}
          disabled={!activeGoalId || voting}
          size="sm"
          className="w-full"
          variant="secondary"
        >
          {voting ? 'Voting...' : 'Simulate Vote'}
        </Button>
      </div>
    </Card>
  );
};
