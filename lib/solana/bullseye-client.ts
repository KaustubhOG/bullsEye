import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import IDL from "./idl/bullseye.json";
import {
  PROGRAM_ID,
  VERIFIERS,
  BURN_ADDRESS,
  COMPANY_WALLET,
  getConnection,
  solToLamports,
  lamportsToSol,
  NETWORK,
} from "./config";
import {
  deriveGoalPda,
  deriveVerificationPda,
  convertGoalAccountToGoal,
  validateGoalData,
  parseAnchorError,
} from "./utils";
import type {
  Goal,
  GoalAccount,
  VerificationAccount,
  CreateGoalData,
  TransactionResult,
  Vote,
} from "./types";

/**
 * BullseyeClient - Main client for interacting with BullsEye smart contract
 */
export class BullseyeClient {
  private connection: Connection;
  private program: Program<Bullseye> | null = null;
  private provider: AnchorProvider | null = null;

  constructor(connection?: Connection) {
    this.connection = connection || getConnection();
  }

  /**
   * Initialize the Anchor program with wallet
   */
  private async initializeProgram(wallet: any): Promise<Program<Bullseye>> {
    if (this.program && this.provider?.wallet === wallet) {
      return this.program;
    }

    this.provider = new AnchorProvider(this.connection, wallet, {
      commitment: "confirmed",
    });

    this.program = new Program(IDL as any, this.provider) as Program<any>;

    return this.program;
  }

  // ============================================================================
  // GOAL MANAGEMENT
  // ============================================================================

  /**
   * Create a new goal and lock SOL
   */
  async createGoal(
    data: CreateGoalData,
    wallet: any
  ): Promise<{ goal: Goal; signature: string }> {
    try {
      // Validate data
      const validation = validateGoalData(data);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const program = await this.initializeProgram(wallet);
      const userPubkey = wallet.publicKey;

      // Derive PDAs
      const [goalPda] = deriveGoalPda(userPubkey);
      const [verificationPda] = deriveVerificationPda(goalPda);

      // Convert data
      const amount = new BN(solToLamports(data.amountSol));
      const deadline = new BN(
        Math.floor(new Date(data.deadline).getTime() / 1000)
      );
      const failAction =
        data.failDestination === "burn" ? { burn: {} } : { companyWallet: {} };

      // Send transaction
      const tx = await program.methods
        .initializeGoal(
          data.title,
          data.description,
          amount,
          deadline,
          failAction,
          VERIFIERS
        )
        .accounts({
          goal: goalPda,
          verification: verificationPda,
          user: userPubkey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Goal created! TX:", tx);

      // Fetch the created goal
      const goal = await this.getGoal(userPubkey.toBase58());
      if (!goal) {
        throw new Error("Failed to fetch created goal");
      }

      return { goal, signature: tx };
    } catch (error) {
      console.error("❌ Error creating goal:", error);
      throw new Error(parseAnchorError(error));
    }
  }

  /**
   * Get a specific goal by user's wallet address
   * FIXED: Now uses fetchNullable to handle non-existent accounts gracefully
   */
  async getGoal(userWallet: string): Promise<Goal | null> {
    try {
      const userPubkey = new PublicKey(userWallet);
      const [goalPda] = deriveGoalPda(userPubkey);
      const [verificationPda] = deriveVerificationPda(goalPda);

      // Create a dummy wallet for read-only operations
      const dummyWallet = {
        publicKey: userPubkey,
        signTransaction: async (tx: Transaction) => tx,
        signAllTransactions: async (txs: Transaction[]) => txs,
      };

      const program = await this.initializeProgram(dummyWallet);

      // Fetch accounts - use fetchNullable to handle non-existent accounts
      const goalAccount = await program.account.goal.fetchNullable(goalPda);
      
      if (!goalAccount) {
        console.log(`ℹ️ No goal found for wallet: ${userWallet}`);
        return null;
      }

      const verificationAccount = await program.account.verification.fetchNullable(
        verificationPda
      );

      if (!verificationAccount) {
        console.log(`⚠️ Goal exists but verification account missing for: ${userWallet}`);
        return null;
      }

      // Convert to frontend format
      const goal = convertGoalAccountToGoal(
        goalAccount as unknown as GoalAccount,
        verificationAccount as unknown as VerificationAccount,
        goalPda
      );

      return goal;
    } catch (error) {
      console.error("Error fetching goal:", error);
      return null;
    }
  }

  /**
   * Get all goals (for feed/discovery)
   */
  async getAllGoals(): Promise<Goal[]> {
    try {
      // Create a dummy wallet for read-only operations
      const dummyKeypair = anchor.web3.Keypair.generate();
      const dummyWallet = {
        publicKey: dummyKeypair.publicKey,
        signTransaction: async (tx: Transaction) => tx,
        signAllTransactions: async (txs: Transaction[]) => txs,
      };

      const program = await this.initializeProgram(dummyWallet);

      // Fetch all goal accounts
      const goalAccounts = await program.account.goal.all();

      const goals: Goal[] = [];

      for (const accountInfo of goalAccounts) {
        try {
          const goalPda = accountInfo.publicKey;
          const goalAccount = accountInfo.account as unknown as GoalAccount;
          const [verificationPda] = deriveVerificationPda(goalPda);

          // Use fetchNullable here too for safety
          const verificationAccount = await program.account.verification.fetchNullable(
            verificationPda
          );

          if (!verificationAccount) {
            console.log(`⚠️ Skipping goal ${goalPda.toBase58()} - missing verification account`);
            continue;
          }

          const goal = convertGoalAccountToGoal(
            goalAccount,
            verificationAccount as unknown as VerificationAccount,
            goalPda
          );
          goals.push(goal);
        } catch (error) {
          console.error("Error processing goal:", error);
        }
      }

      return goals;
    } catch (error) {
      console.error("Error fetching all goals:", error);
      return [];
    }
  }

  // ============================================================================
  // VERIFICATION
  // ============================================================================

  /**
   * Submit goal for verification
   */
  async submitForVerification(
    userWallet: string,
    wallet: any
  ): Promise<{ signature: string; verificationDeadline: Date }> {
    try {
      const program = await this.initializeProgram(wallet);
      const userPubkey = new PublicKey(userWallet);

      const [goalPda] = deriveGoalPda(userPubkey);
      const [verificationPda] = deriveVerificationPda(goalPda);

      const tx = await program.methods
        .submitForVerification()
        .accounts({
          goal: goalPda,
          verification: verificationPda,
          user: wallet.publicKey,
        })
        .rpc();

      console.log("✅ Submitted for verification! TX:", tx);

      // Calculate verification deadline (24 hours from now)
      const verificationDeadline = new Date(Date.now() + 86400 * 1000);

      return { signature: tx, verificationDeadline };
    } catch (error) {
      console.error("❌ Error submitting for verification:", error);
      throw new Error(parseAnchorError(error));
    }
  }

  /**
   * Cast vote (verifiers only)
   */
  async castVote(
    userWallet: string,
    vote: boolean,
    wallet: any
  ): Promise<{
    signature: string;
    yesVotes: number;
    noVotes: number;
    finalized: boolean;
  }> {
    try {
      const program = await this.initializeProgram(wallet);
      const userPubkey = new PublicKey(userWallet);

      const [goalPda] = deriveGoalPda(userPubkey);
      const [verificationPda] = deriveVerificationPda(goalPda);

      const tx = await program.methods
        .castVote(vote)
        .accounts({
          goal: goalPda,
          verification: verificationPda,
          verifier: wallet.publicKey,
        })
        .rpc();

      console.log("✅ Vote cast! TX:", tx);

      // Fetch updated verification
      const verificationAccount = (await program.account.verification.fetch(
        verificationPda
      )) as unknown as VerificationAccount;

      return {
        signature: tx,
        yesVotes: verificationAccount.yesVotes,
        noVotes: verificationAccount.noVotes,
        finalized: verificationAccount.finalized,
      };
    } catch (error) {
      console.error("❌ Error casting vote:", error);
      throw new Error(parseAnchorError(error));
    }
  }

  // ============================================================================
  // CLAIM/DISTRIBUTE
  // ============================================================================

  /**
   * Claim funds (on success) or distribute (on failure)
   */
  async claimOrDistribute(
    userWallet: string,
    wallet: any
  ): Promise<{ signature: string; success: boolean }> {
    try {
      const program = await this.initializeProgram(wallet);
      const userPubkey = new PublicKey(userWallet);

      const [goalPda] = deriveGoalPda(userPubkey);
      const [verificationPda] = deriveVerificationPda(goalPda);

      // Fetch goal to determine recipient
      const goalAccount = (await program.account.goal.fetch(
        goalPda
      )) as unknown as GoalAccount;
      const verificationAccount = (await program.account.verification.fetch(
        verificationPda
      )) as unknown as VerificationAccount;

      // Determine recipient based on verification result and fail action
      let recipient: PublicKey;
      const isSuccess =
        verificationAccount.result && "success" in verificationAccount.result;

      if (isSuccess) {
        recipient = userPubkey; // User gets funds back
      } else {
        // Failure - check fail action
        if ("burn" in goalAccount.failAction) {
          recipient = BURN_ADDRESS;
        } else {
          recipient = COMPANY_WALLET;
        }
      }

      const tx = await program.methods
        .claimOrDistribute()
        .accounts({
          goal: goalPda,
          verification: verificationPda,
          user: wallet.publicKey,
          recipient: recipient,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Funds distributed! TX:", tx);

      return { signature: tx, success: isSuccess || false };
    } catch (error) {
      console.error("❌ Error claiming/distributing:", error);
      throw new Error(parseAnchorError(error));
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Airdrop SOL (for testing on localnet/devnet)
   */
  async airdrop(publicKey: PublicKey, amount: number = 1): Promise<string> {
    try {
      if (NETWORK === "mainnet-beta") {
        throw new Error("Airdrop not available on mainnet");
      }

      const signature = await this.connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );

      await this.connection.confirmTransaction(signature);
      console.log("✅ Airdrop successful!", signature);

      return signature;
    } catch (error) {
      console.error("❌ Airdrop failed:", error);
      throw error;
    }
  }

  /**
   * Get SOL balance
   */
  async getBalance(publicKey: PublicKey): Promise<number> {
    const balance = await this.connection.getBalance(publicKey);
    return lamportsToSol(balance);
  }

  /**
   * Check if wallet is a verifier
   */
  isVerifier(publicKey: PublicKey): boolean {
    return VERIFIERS.some((v) => v.equals(publicKey));
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let clientInstance: BullseyeClient | null = null;

/**
 * Get singleton instance of BullseyeClient
 */
export function getBullseyeClient(): BullseyeClient {
  if (!clientInstance) {
    clientInstance = new BullseyeClient();
  }
  return clientInstance;
}

export default BullseyeClient;