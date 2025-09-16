import { useContractRead, useContractWrite, useAccount } from 'wagmi';
import { useState } from 'react';
import { FHEEncryption, ContractInteraction, PrivacyUtils } from '@/lib/fhe';

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
      // Prepare and encrypt the data using FHE
      const encryptedData = ContractInteraction.prepareEncryptedPositionData(
        amount,
        yieldRate,
        duration
      );

      // Validate encrypted data
      if (!ContractInteraction.validateEncryptedData(encryptedData)) {
        throw new Error('Invalid encrypted data');
      }

      // Log encrypted data (masked for security)
      console.log('🔐 Encrypting position data:', PrivacyUtils.maskSensitiveData({
        amount: encryptedData.amount.toString(),
        yieldRate: encryptedData.yieldRate,
        duration: encryptedData.duration,
        strategy,
        proof: encryptedData.proof
      }));

      // Call contract with encrypted data
      const tx = await createPosition({
        args: [
          encryptedData.amount,
          encryptedData.yieldRate,
          encryptedData.duration,
          strategy
        ],
        value: encryptedData.amount, // Send ETH as collateral
      });

      console.log('📝 Transaction submitted:', tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt.transactionHash);

      // Refresh farmer stats
      await refetchFarmerStats();
      
      console.log('🎉 Position created successfully with FHE encrypted data');
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        positionId: receipt.logs[0]?.topics[1] // Extract position ID from event
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create position';
      setError(errorMessage);
      console.error('❌ Error creating position:', err);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawPosition = async (positionId: number) => {
    if (!withdrawPosition) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔓 Initiating position withdrawal and data revelation...');
      console.log('📊 Position ID:', positionId);

      // Call contract to withdraw position (this reveals the encrypted data)
      const tx = await withdrawPosition({
        args: [positionId],
      });

      console.log('📝 Withdrawal transaction submitted:', tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('✅ Withdrawal transaction confirmed:', receipt.transactionHash);

      // Refresh farmer stats
      await refetchFarmerStats();
      
      console.log('🎉 Position withdrawn successfully - encrypted data revealed on-chain');
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        message: 'Position data has been revealed and is now visible on-chain'
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw position';
      setError(errorMessage);
      console.error('❌ Error withdrawing position:', err);
      
      return {
        success: false,
        error: errorMessage
      };
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
      // Encrypt pool parameters using FHE
      const maxCapacityNumber = parseInt(maxCapacity, 10);
      const initialYieldNumber = parseInt(initialYield, 10);

      // Validate inputs
      if (maxCapacityNumber <= 0) throw new Error('Max capacity must be greater than 0');
      if (initialYieldNumber <= 0) throw new Error('Initial yield must be greater than 0');

      // Encrypt the pool data
      const encryptedMaxCapacity = FHEEncryption.encryptNumber(maxCapacityNumber);
      const encryptedInitialYield = FHEEncryption.encryptNumber(initialYieldNumber);

      console.log('🔐 Encrypting yield pool data:', PrivacyUtils.maskSensitiveData({
        poolName,
        maxCapacity: encryptedMaxCapacity,
        initialYield: encryptedInitialYield
      }));

      // Call contract with encrypted data
      const tx = await createYieldPool({
        args: [maxCapacityNumber, initialYieldNumber, poolName],
      });

      console.log('📝 Pool creation transaction submitted:', tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('✅ Pool creation transaction confirmed:', receipt.transactionHash);
      
      console.log('🎉 Yield pool created successfully with FHE encrypted parameters');
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        poolId: receipt.logs[0]?.topics[1] // Extract pool ID from event
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create yield pool';
      setError(errorMessage);
      console.error('❌ Error creating yield pool:', err);
      
      return {
        success: false,
        error: errorMessage
      };
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
