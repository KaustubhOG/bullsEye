"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ProfileCard } from "@/components/ProfileCard";
import { GoalCard } from "@/components/GoalCard";
import { SocialFeed } from "@/components/SocialFeed";
import { CreateGoalModal } from "@/components/CreateGoalModal";
import { VerificationModal } from "@/components/VerificationModal";
import { DemoControls } from "@/components/DemoControls";
import { Goal, FeedItem } from "@/types/goal";
import { mockApi } from "@/lib/mockApi";

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);

  const loadData = async () => {
    try {
      const [goalsData, feedData] = await Promise.all([
        mockApi.getGoals(publicKey?.toString()),
        mockApi.getFeed(),
      ]);
      setGoals(goalsData);
      setFeed(feedData);
      
      const active = goalsData.find(g => g.status !== 'claimed') || null;
      setActiveGoal(active);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [publicKey]);

  const handleCreateGoal = () => {
    if (!connected) {
      return;
    }
    setCreateModalOpen(true);
  };

  const handleVerificationRequest = async (goal: Goal) => {
    try {
      const result = await mockApi.requestVerification(goal.id);
      const updatedGoal = { ...goal, blinkLinks: result.blinkLinks, status: 'active' as const };
      setSelectedGoal(updatedGoal);
      setVerificationModalOpen(true);
      loadData();
    } catch (error) {
      console.error('Failed to request verification:', error);
    }
  };

  const totalSolLocked = goals
    .filter(g => g.status !== 'claimed' && g.status !== 'failed')
    .reduce((sum, g) => sum + g.amountSol, 0);

  return (
    <div className="min-h-screen p-6 bg-background text-foreground">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-primary bg-clip-text text-transparent">
            Accountability as a Service
          </h1>
          <p className="text-muted-foreground">
            Lock SOL, set goals, get verified by the community, and claim rewards 🎯
          </p>
        </header>

        {/* Three-Compartment Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Profile & Controls */}
          <div className="lg:col-span-3 space-y-6">
            <ProfileCard
              totalGoals={goals.length}
              totalSolLocked={totalSolLocked}
              onCreateGoal={handleCreateGoal}
              onViewHistory={() => console.log('View history')}
            />
            
            {connected && (
              <DemoControls
                activeGoalId={activeGoal?.id || null}
                onVoteSuccess={loadData}
              />
            )}
          </div>

          {/* Right Column - Active Goal */}
          <div className="lg:col-span-9">
            <GoalCard
              goal={activeGoal}
              onVerificationRequest={handleVerificationRequest}
              onRefresh={loadData}
            />
          </div>
        </div>

        {/* Bottom Section - Social Feed */}
        <div className="mt-6">
          <SocialFeed items={feed} />
        </div>

        {/* Modals */}
        <CreateGoalModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSuccess={loadData}
        />

        <VerificationModal
          open={verificationModalOpen}
          onOpenChange={setVerificationModalOpen}
          goal={selectedGoal}
        />
      </div>
    </div>
  );
}