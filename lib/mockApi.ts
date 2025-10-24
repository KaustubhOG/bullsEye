import { Goal, CreateGoalData, Vote, FeedItem } from '@/types/goal';

// Mock data store
let mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Complete 30-day fitness challenge',
    description: 'Workout 5 days a week for the next month',
    amountSol: 0.5,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    verificationType: 'strangers',
    failDestination: 'burn',
    status: 'active',
    votes: [
      { wallet: '4xQw...7pZk', vote: 'yes', timestamp: new Date().toISOString() }
    ],
    requiredVotes: 3,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ownerWallet: 'demo-wallet',
  },
  {
    id: '2',
    title: 'Launch side project MVP',
    description: 'Build and deploy a working prototype by end of month',
    amountSol: 1.0,
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    verificationType: 'friend',
    verifierWallet: 'HJ3g...9mKp',
    failDestination: 'company',
    status: 'pending',
    votes: [],
    requiredVotes: 1,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ownerWallet: 'demo-wallet',
  },
];

let mockFeed: FeedItem[] = [
  {
    id: 'f1',
    type: 'goal_completed',
    username: 'alice.sol',
    avatar: '🎯',
    message: 'successfully completed "Read 10 books" and claimed 0.3 SOL!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    goalId: '123',
  },
  {
    id: 'f2',
    type: 'goal_created',
    username: 'bob.crypto',
    avatar: '🚀',
    message: 'committed 0.5 SOL to "Learn Rust programming"',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    goalId: '124',
  },
  {
    id: 'f3',
    type: 'goal_failed',
    username: 'charlie.dev',
    avatar: '🔥',
    message: 'failed "Daily meditation" - 0.2 SOL sent to burn wallet',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    goalId: '125',
  },
  {
    id: 'f4',
    type: 'verification_requested',
    username: 'diana.sol',
    avatar: '✨',
    message: 'requested verification for "Morning runs challenge"',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    goalId: '126',
  },
  {
    id: 'f5',
    type: 'goal_completed',
    username: 'eve.eth',
    avatar: '💎',
    message: 'successfully completed "Code every day" and claimed 0.8 SOL!',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    goalId: '127',
  },
];

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  async createGoal(data: CreateGoalData, ownerWallet: string): Promise<Goal> {
    await delay(500);
    
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      ...data,
      status: 'pending',
      votes: [],
      requiredVotes: data.verificationType === 'friend' ? 1 : 3,
      createdAt: new Date().toISOString(),
      ownerWallet,
    };
    
    mockGoals.push(newGoal);
    
    // Add to feed
    mockFeed.unshift({
      id: `feed-${Date.now()}`,
      type: 'goal_created',
      username: 'You',
      avatar: '🎯',
      message: `committed ${data.amountSol} SOL to "${data.title}"`,
      timestamp: new Date().toISOString(),
      goalId: newGoal.id,
    });
    
    return newGoal;
  },

  async getGoals(wallet?: string): Promise<Goal[]> {
    await delay(300);
    return wallet 
      ? mockGoals.filter(g => g.ownerWallet === wallet)
      : mockGoals;
  },

  async getGoal(id: string): Promise<Goal | null> {
    await delay(200);
    return mockGoals.find(g => g.id === id) || null;
  },

  async requestVerification(goalId: string): Promise<{ blinkLinks: { verifier: string; link: string }[] }> {
    await delay(500);
    
    const goal = mockGoals.find(g => g.id === goalId);
    if (!goal) throw new Error('Goal not found');
    
    const blinkLinks = goal.verificationType === 'friend'
      ? [{ 
          verifier: goal.verifierWallet || 'friend',
          link: `https://blink.example/act?goal=${goalId}&type=verify&v=${goal.verifierWallet}`
        }]
      : [
          { verifier: 'stranger-1', link: `https://blink.example/act?goal=${goalId}&type=verify&v=1` },
          { verifier: 'stranger-2', link: `https://blink.example/act?goal=${goalId}&type=verify&v=2` },
          { verifier: 'stranger-3', link: `https://blink.example/act?goal=${goalId}&type=verify&v=3` },
        ];
    
    goal.blinkLinks = blinkLinks;
    goal.status = 'active';
    
    // Add to feed
    mockFeed.unshift({
      id: `feed-${Date.now()}`,
      type: 'verification_requested',
      username: 'You',
      avatar: '✨',
      message: `requested verification for "${goal.title}"`,
      timestamp: new Date().toISOString(),
      goalId: goal.id,
    });
    
    return { blinkLinks };
  },

  async vote(goalId: string, verifierWallet: string, vote: 'yes' | 'no'): Promise<{ votes: Vote[]; verified: boolean }> {
    await delay(400);
    
    const goal = mockGoals.find(g => g.id === goalId);
    if (!goal) throw new Error('Goal not found');
    
    // Remove existing vote from this verifier if any
    goal.votes = goal.votes.filter(v => v.wallet !== verifierWallet);
    
    // Add new vote
    goal.votes.push({
      wallet: verifierWallet,
      vote,
      timestamp: new Date().toISOString(),
    });
    
    const yesVotes = goal.votes.filter(v => v.vote === 'yes').length;
    const verified = yesVotes >= goal.requiredVotes;
    
    if (verified) {
      goal.status = 'verified';
    }
    
    return { votes: goal.votes, verified };
  },

  async claimFunds(goalId: string): Promise<{ txSig: string; success: boolean }> {
    await delay(600);
    
    const goal = mockGoals.find(g => g.id === goalId);
    if (!goal) throw new Error('Goal not found');
    if (goal.status !== 'verified') throw new Error('Goal not verified yet');
    
    goal.status = 'claimed';
    
    // Add to feed
    mockFeed.unshift({
      id: `feed-${Date.now()}`,
      type: 'goal_completed',
      username: 'You',
      avatar: '🎯',
      message: `successfully completed "${goal.title}" and claimed ${goal.amountSol} SOL!`,
      timestamp: new Date().toISOString(),
      goalId: goal.id,
    });
    
    return {
      txSig: `mock-tx-${Date.now()}`,
      success: true,
    };
  },

  async getFeed(): Promise<FeedItem[]> {
    await delay(200);
    return mockFeed;
  },
};
