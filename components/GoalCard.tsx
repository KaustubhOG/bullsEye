"use client";
import { useState } from 'react';
import { Goal } from '@/types/goal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';

interface GoalCardProps {
  goal: Goal | null;
  onVerificationRequest: (goal: Goal) => void;
  onRefresh: () => void;
}

export const GoalCard = ({ goal, onVerificationRequest, onRefresh }: GoalCardProps) => {
  const { toast } = useToast();
  const [claiming, setClaiming] = useState(false);

  if (!goal) {
    return (
      <Card className="p-12 shadow-card border-border flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">No Active Goal</h3>
          <p className="text-muted-foreground">Create a goal to get started!</p>
        </div>
      </Card>
    );
  }

  const deadline = new Date(goal.deadline);
  const now = new Date();
  const timeLeft = deadline.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil((deadline.getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));

  const yesVotes = goal.votes.filter(v => v.vote === 'yes').length;
  const isVerified = goal.status === 'verified' || yesVotes >= goal.requiredVotes;
  const canClaim = isVerified && goal.status !== 'claimed';

  const handleClaim = async () => {
    try {
      setClaiming(true);
      await mockApi.claimFunds(goal.id);
      toast({
        title: 'Success! 🎉',
        description: `Claimed ${goal.amountSol} SOL successfully!`,
      });
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to claim funds',
        variant: 'destructive',
      });
    } finally {
      setClaiming(false);
    }
  };

  const statusColor = {
    pending: 'bg-muted',
    active: 'bg-accent',
    verified: 'bg-success',
    claimed: 'bg-primary',
    failed: 'bg-destructive',
  }[goal.status];

  return (
    <Card className="p-8 shadow-card border-border">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={statusColor}>
                {goal.status.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {goal.verificationType === 'friend' ? '👤 Friend' : '🌍 Strangers'}
              </Badge>
            </div>
            <h2 className="text-3xl font-bold mb-2">{goal.title}</h2>
            <p className="text-muted-foreground">{goal.description}</p>
          </div>
        </div>

        {/* Amount Locked */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Locked Amount</span>
            <span className="text-2xl font-bold text-primary">{goal.amountSol} SOL</span>
          </div>
        </div>

        {/* Deadline & Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Time Remaining</span>
            </div>
            <span className="font-semibold">
              {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-muted-foreground text-right">
            {deadline.toLocaleDateString()}
          </div>
        </div>

        {/* Verification Progress */}
        {goal.status === 'active' && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Verification Progress</span>
              <span className="text-sm font-bold text-accent">
                {yesVotes} / {goal.requiredVotes} votes
              </span>
            </div>
            <Progress value={(yesVotes / goal.requiredVotes) * 100} className="h-2" />
            <div className="mt-3 space-y-1">
              {goal.votes.map((vote, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  {vote.vote === 'yes' ? (
                    <CheckCircle2 className="w-3 h-3 text-success" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-destructive" />
                  )}
                  <span className="text-muted-foreground">{vote.wallet}</span>
                  <span className={vote.vote === 'yes' ? 'text-success' : 'text-destructive'}>
                    {vote.vote === 'yes' ? 'Approved' : 'Rejected'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {goal.status === 'pending' && (
            <Button
              onClick={() => onVerificationRequest(goal)}
              className="flex-1 gradient-primary shadow-glow"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Request Verification
            </Button>
          )}
          
          {canClaim && (
            <Button
              onClick={handleClaim}
              disabled={claiming}
              className="flex-1 bg-success hover:bg-success/90"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {claiming ? 'Claiming...' : 'Claim Funds'}
            </Button>
          )}

          {goal.status === 'claimed' && (
            <div className="flex-1 bg-success/10 border border-success/20 rounded-lg p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-sm font-semibold text-success">Claimed Successfully!</p>
            </div>
          )}
        </div>

        {/* Fail Destination Info */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          If failed, funds will be sent to: <span className="font-semibold">{goal.failDestination === 'burn' ? '🔥 Burn Wallet' : '🏢 Company Wallet'}</span>
        </div>
      </div>
    </Card>
  );
};
