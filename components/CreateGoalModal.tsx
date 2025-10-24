"use client";
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreateGoalData, VerificationType, FailDestination } from '@/types/goal';
import { mockApi } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';

interface CreateGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateGoalModal = ({ open, onOpenChange, onSuccess }: CreateGoalModalProps) => {
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState<CreateGoalData>({
    title: '',
    description: '',
    amountSol: 0.1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    verificationType: 'strangers',
    verifierWallet: '',
    failDestination: 'burn',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    if (formData.amountSol <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Amount must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);
      const deadlineISO = new Date(formData.deadline).toISOString();
      await mockApi.createGoal(
        { ...formData, deadline: deadlineISO },
        publicKey.toString()
      );
      
      toast({
        title: 'Goal Created! 🎯',
        description: `Successfully locked ${formData.amountSol} SOL`,
      });
      
      onOpenChange(false);
      onSuccess();
      
      setFormData({
        title: '',
        description: '',
        amountSol: 0.1,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        verificationType: 'strangers',
        verifierWallet: '',
        failDestination: 'burn',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create goal',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Goal</DialogTitle>
          <DialogDescription>
            Lock SOL and commit to your goal. Choose your verification method and what happens if you don't succeed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Complete 30-day fitness challenge"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your goal in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Lock Amount (SOL) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amountSol}
              onChange={(e) => setFormData({ ...formData, amountSol: parseFloat(e.target.value) || 0 })}
              required
            />
            <p className="text-xs text-muted-foreground">Minimum 0.01 SOL</p>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline *</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Verification Type */}
          <div className="space-y-3">
            <Label>Verification Method *</Label>
            <RadioGroup
              value={formData.verificationType}
              onValueChange={(value) => setFormData({ ...formData, verificationType: value as VerificationType })}
            >
              <div className="flex items-center space-x-2 border border-border rounded-lg p-4 hover:bg-muted/30 transition-smooth">
                <RadioGroupItem value="strangers" id="strangers" />
                <Label htmlFor="strangers" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Community Verification (3 strangers)</div>
                  <div className="text-xs text-muted-foreground">Random community members will vote on your completion</div>
                </Label>
              </div>

              {/* Disabled friend verification */}
              <div className="flex items-center space-x-2 border border-border rounded-lg p-4 opacity-50 cursor-not-allowed">
                <RadioGroupItem value="friend" id="friend" disabled />
                <Label htmlFor="friend" className="flex-1 cursor-not-allowed">
                  <div className="font-semibold">
                    Friend Verification (1 person) <span className="text-xs text-muted-foreground">(coming soon)</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    This feature will be available in future updates
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Verifier Wallet — Hidden */}
          {false && (
            <div className="space-y-2">
              <Label htmlFor="verifier">Verifier Wallet Address *</Label>
              <Input
                id="verifier"
                placeholder="Enter Solana wallet address"
                value={formData.verifierWallet}
                onChange={(e) => setFormData({ ...formData, verifierWallet: e.target.value })}
                required
              />
            </div>
          )}

          {/* Fail Destination */}
          <div className="space-y-3">
            <Label>If You Don't Succeed *</Label>
            <RadioGroup
              value={formData.failDestination}
              onValueChange={(value) => setFormData({ ...formData, failDestination: value as FailDestination })}
            >
              <div className="flex items-center space-x-2 border border-border rounded-lg p-4 hover:bg-muted/30 transition-smooth">
                <RadioGroupItem value="burn" id="burn" />
                <Label htmlFor="burn" className="flex-1 cursor-pointer">
                  <div className="font-semibold">🔥 Burn Wallet</div>
                  <div className="text-xs text-muted-foreground">SOL will be sent to an unrecoverable address</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border border-border rounded-lg p-4 hover:bg-muted/30 transition-smooth">
                <RadioGroupItem value="company" id="company" />
                <Label htmlFor="company" className="flex-1 cursor-pointer">
                  <div className="font-semibold">🏢 Company Wallet</div>
                  <div className="text-xs text-muted-foreground">SOL will go to platform treasury</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary shadow-glow"
              disabled={creating}
            >
              {creating ? 'Creating...' : `Lock & Create Goal`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
