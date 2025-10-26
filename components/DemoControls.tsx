"use client";
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ThumbsUp, ThumbsDown, Coins } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { VERIFIERS } from '@/lib/solana/config';

interface DemoControlsProps {
  activeGoalId: string | null;
  onVoteSuccess: () => void;
}

export const DemoControls = ({ activeGoalId, onVoteSuccess }: DemoControlsProps) => {
  const { publicKey, wallet } = useWallet();
  const { toast } = useToast();
  const [verifierIndex, setVerifierIndex] = useState(0);
  const [voteType, setVoteType] = useState<'yes' | 'no'>('yes');
  const [voting, setVoting] = useState(false);
  const [airdropping, setAirdropping] = useState(false);

  const handleAirdrop = async () => {
    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAirdropping(true);
      console.log('💰 Requesting airdrop...');
      
      const signature = await mockApi.requestAirdrop(publicKey.toString(), 2);
      
      toast({
        title: 'Airdrop successful! 💰',
        description: 'Received 2 SOL for testing',
      });
      
      console.log('✅ Airdrop signature:', signature);
    } catch (error: any) {
      console.error('❌ Airdrop failed:', error);
      toast({
        title: 'Airdrop failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setAirdropping(false);
    }
  };

  const handleSimulateVote = async () => {
    if (!activeGoalId) {
      toast({
        title: 'No active goal',
        description: 'Create and submit a goal for verification first',
        variant: 'destructive',
      });
      return;
    }

    if (!wallet) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return;
    }

    try {
      setVoting(true);
      console.log('🗳️ Simulating vote...', { activeGoalId, verifierIndex, voteType });
      
      const verifierAddress = VERIFIERS[verifierIndex].toBase58();
      
      // Note: In production, you'd need the actual verifier's wallet
      // For testing, we're using the connected wallet to simulate
      const result = await mockApi.vote(
        activeGoalId,
        verifierAddress,
        voteType,
        publicKey!.toString(), // Goal owner's wallet
        wallet // Connected wallet acting as verifier
      );
      
      toast({
        title: `Vote ${voteType === 'yes' ? 'Approved' : 'Rejected'}! ✅`,
        description: result.verified 
          ? 'Goal is now verified! You can claim funds.'
          : `Vote recorded. Need ${2 - result.votes.filter(v => v.vote === 'yes').length} more YES votes.`,
      });
      
      onVoteSuccess();
    } catch (error: any) {
      console.error('❌ Vote failed:', error);
      toast({
        title: 'Vote failed',
        description: error.message || 'Failed to cast vote',
        variant: 'destructive',
      });
    } finally {
      setVoting(false);
    }
  };

  return (
    <Card className="p-4 bg-muted/30 border-dashed">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
            🎭 Demo Controls
            <span className="text-xs font-normal text-muted-foreground">(Testing Tools)</span>
          </h4>
          <p className="text-xs text-muted-foreground">
            Tools for testing on localnet
          </p>
        </div>

        {/* Airdrop Button */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">💰 Get Test SOL</Label>
          <Button
            onClick={handleAirdrop}
            disabled={!publicKey || airdropping}
            size="sm"
            className="w-full"
            variant="outline"
          >
            <Coins className="w-3 h-3 mr-2" />
            {airdropping ? 'Airdropping...' : 'Airdrop 2 SOL'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Get free SOL for testing (localnet only)
          </p>
        </div>

        <div className="border-t border-border pt-3 space-y-3">
          <Label className="text-xs font-semibold">🗳️ Simulate Verification</Label>
          
          {/* Verifier Selection */}
          <div className="space-y-2">
            <Label className="text-xs">Select Verifier</Label>
            <RadioGroup
              value={verifierIndex.toString()}
              onValueChange={(value) => setVerifierIndex(parseInt(value))}
              className="space-y-1"
            >
              {VERIFIERS.map((verifier, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`verifier-${index}`} />
                  <Label 
                    htmlFor={`verifier-${index}`} 
                    className="text-xs cursor-pointer font-mono"
                  >
                    Verifier {index + 1}: {verifier.toBase58().slice(0, 8)}...
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Vote Type */}
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
                  <ThumbsUp className="w-3 h-3 text-green-500" /> Approve
                </Label>
              </div>
              <div className="flex items-center space-x-1 flex-1">
                <RadioGroupItem value="no" id="vote-no" />
                <Label htmlFor="vote-no" className="text-xs cursor-pointer flex items-center gap-1">
                  <ThumbsDown className="w-3 h-3 text-red-500" /> Reject
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handleSimulateVote}
            disabled={!activeGoalId || voting || !wallet}
            size="sm"
            className="w-full"
            variant="secondary"
          >
            {voting ? 'Voting...' : 'Cast Vote'}
          </Button>
        </div>

        {/* Info */}
        <div className="bg-accent/10 rounded p-2 text-xs text-muted-foreground">
          <p className="font-semibold text-accent mb-1">ℹ️ How to test:</p>
          <ol className="space-y-0.5 text-[10px] ml-3">
            <li>1. Airdrop SOL to your wallet</li>
            <li>2. Create a goal</li>
            <li>3. Submit for verification</li>
            <li>4. Cast 2 YES votes to verify</li>
            <li>5. Claim your funds!</li>
          </ol>
        </div>
      </div>
    </Card>
  );
};