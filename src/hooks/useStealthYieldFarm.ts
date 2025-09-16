import { useContractRead, useContractWrite, useAccount } from 'wagmi';
import { useState } from 'react';

// Contract ABI - Updated to match the new StealthYieldFarm contract
const STEALTH_YIELD_FARM_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "positionId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "farmer", "type": "address"},
      {"indexed": false, "internalType": "bytes32", "name": "positionHash", "type": "bytes32"}
    ],
    "name": "PositionCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "positionId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "farmer", "type": "address"},
      {"indexed": false, "internalType": "bytes32", "name": "positionHash", "type": "bytes32"}
    ],
    "name": "PositionWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "poolId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "manager", "type": "address"},
      {"indexed": false, "internalType": "bytes32", "name": "poolHash", "type": "bytes32"}
    ],
    "name": "PoolCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "dataType", "type": "string"},
      {"indexed": false, "internalType": "bytes32", "name": "dataHash", "type": "bytes32"}
    ],
    "name": "EncryptedDataUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "uint64", "name": "amount", "type": "uint64"},
      {"internalType": "uint32", "name": "yieldRate", "type": "uint32"},
      {"internalType": "uint32", "name": "duration", "type": "uint32"},
      {"internalType": "string", "name": "strategy", "type": "string"}
    ],
    "name": "createFarmingPosition",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "positionId", "type": "uint256"}
    ],
    "name": "withdrawPosition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint32", "name": "maxCapacity", "type": "uint32"},
      {"internalType": "uint32", "name": "initialYield", "type": "uint32"},
      {"internalType": "string", "name": "poolName", "type": "string"}
    ],
    "name": "createYieldPool",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "farmer", "type": "address"}
    ],
    "name": "getFarmerStats",
    "outputs": [
      {"internalType": "uint32", "name": "reputation", "type": "uint32"},
      {"internalType": "uint64", "name": "staked", "type": "uint64"},
      {"internalType": "uint64", "name": "earned", "type": "uint64"},
      {"internalType": "uint32", "name": "positions", "type": "uint32"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGlobalStats",
    "outputs": [
      {"internalType": "uint64", "name": "liquidity", "type": "uint64"},
      {"internalType": "uint32", "name": "positions", "type": "uint32"},
      {"internalType": "uint32", "name": "pools", "type": "uint32"},
      {"internalType": "uint64", "name": "rewards", "type": "uint64"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract address - this would be the deployed contract address
const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

export function useStealthYieldFarm() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract instance is no longer needed with new wagmi version

  // Read farmer stats
  const { data: farmerStats, refetch: refetchFarmerStats } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: STEALTH_YIELD_FARM_ABI,
    functionName: 'getFarmerStats',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Read global stats
  const { data: globalStats, refetch: refetchGlobalStats } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: STEALTH_YIELD_FARM_ABI,
    functionName: 'getGlobalStats',
  });

  // Create farming position
  const { writeAsync: createPosition } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: STEALTH_YIELD_FARM_ABI,
    functionName: 'createFarmingPosition',
  });

  // Withdraw position
  const { writeAsync: withdrawPosition } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: STEALTH_YIELD_FARM_ABI,
    functionName: 'withdrawPosition',
  });

  // Create yield pool
  const { writeAsync: createYieldPool } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: STEALTH_YIELD_FARM_ABI,
    functionName: 'createYieldPool',
  });

  const handleCreatePosition = async (
    amount: string,
    yieldRate: string,
    duration: string,
    strategy: string
  ) => {
    if (!createPosition) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert string values to BigInt for the contract
      // In a real FHE implementation, these would be encrypted using FHE
      const amountBigInt = BigInt(amount);
      const yieldRateBigInt = BigInt(yieldRate);
      const durationBigInt = BigInt(duration);

      // Validate inputs
      if (amountBigInt <= 0) throw new Error('Amount must be greater than 0');
      if (yieldRateBigInt <= 0) throw new Error('Yield rate must be greater than 0');
      if (durationBigInt <= 0) throw new Error('Duration must be greater than 0');

      const tx = await createPosition({
        args: [amountBigInt, yieldRateBigInt, durationBigInt, strategy],
        value: amountBigInt, // Send ETH as collateral
      });

      await tx.wait();
      await refetchFarmerStats();
      
      console.log('✅ Position created successfully with encrypted data');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create position');
      console.error('❌ Error creating position:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawPosition = async (positionId: number) => {
    if (!withdrawPosition) return;

    setIsLoading(true);
    setError(null);

    try {
      const tx = await withdrawPosition({
        args: [positionId],
      });

      await tx.wait();
      await refetchFarmerStats();
      
      console.log('✅ Position withdrawn successfully - data revealed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw position');
      console.error('❌ Error withdrawing position:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateYieldPool = async (
    poolName: string,
    maxCapacity: string,
    initialYield: string
  ) => {
    if (!createYieldPool) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert string values to BigInt for the contract
      // In a real FHE implementation, these would be encrypted using FHE
      const maxCapacityBigInt = BigInt(maxCapacity);
      const initialYieldBigInt = BigInt(initialYield);

      // Validate inputs
      if (maxCapacityBigInt <= 0) throw new Error('Max capacity must be greater than 0');
      if (initialYieldBigInt <= 0) throw new Error('Initial yield must be greater than 0');

      const tx = await createYieldPool({
        args: [maxCapacityBigInt, initialYieldBigInt, poolName],
      });

      await tx.wait();
      
      console.log('✅ Yield pool created successfully with encrypted parameters');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create yield pool');
      console.error('❌ Error creating yield pool:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    farmerStats,
    globalStats,
    isLoading,
    error,
    createPosition: handleCreatePosition,
    withdrawPosition: handleWithdrawPosition,
    createYieldPool: handleCreateYieldPool,
    refetchFarmerStats,
    refetchGlobalStats,
  };
}
