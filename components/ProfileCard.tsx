"use client";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, History, Trophy } from 'lucide-react';

interface ProfileCardProps {
  totalGoals: number;
  totalSolLocked: number;
  onCreateGoal: () => void;
  onViewHistory: () => void;
}

export const ProfileCard = ({ 
  totalGoals, 
  totalSolLocked, 
  onCreateGoal,
  onViewHistory 
}: ProfileCardProps) => {
  const { publicKey, connected } = useWallet();

  const shortAddress = publicKey 
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : 'Not connected';

  return (
    <Card className="p-6 shadow-card border-border">
      <div className="flex flex-col gap-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-4xl">
            🎯
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">{connected ? shortAddress : 'Connect Wallet'}</h3>
            <p className="text-sm text-muted-foreground">Accountability Member</p>
          </div>
        </div>

        {/* Wallet Connect */}
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !transition-smooth" />
        </div>

        {/* Stats */}
        {connected && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalGoals}</div>
              <div className="text-xs text-muted-foreground">Total Goals</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-accent">{totalSolLocked.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">SOL Locked</div>
            </div>
          </div>
        )}

        {/* Actions */}
        {connected && (
          <div className="flex flex-col gap-2">
            <Button 
              onClick={onCreateGoal} 
              className="w-full gradient-primary shadow-glow"
            >
              <Target className="w-4 h-4 mr-2" />
              Create New Goal
            </Button>
            <Button 
              onClick={onViewHistory} 
              variant="outline"
              className="w-full"
            >
              <History className="w-4 h-4 mr-2" />
              View History
            </Button>
          </div>
        )}

        {/* Mini Leaderboard */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-accent" />
            <h4 className="text-sm font-semibold">Top Achievers</h4>
          </div>
          <div className="space-y-2">
            {[
              { name: 'alice.sol', goals: 42, emoji: '🥇' },
              { name: 'bob.crypto', goals: 38, emoji: '🥈' },
              { name: 'charlie.dev', goals: 35, emoji: '🥉' },
            ].map((user, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span>{user.emoji}</span>
                  <span className="text-muted-foreground">{user.name}</span>
                </span>
                <span className="font-semibold text-accent">{user.goals}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
