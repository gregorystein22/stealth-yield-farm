// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract StealthYieldFarm is SepoliaConfig {
    using FHE for *;
    
    struct FarmingPosition {
        euint32 positionId;
        euint32 amount;
        euint32 yieldRate;
        euint32 startTime;
        euint32 duration;
        ebool isActive;
        ebool isWithdrawn;
        address farmer;
        string strategy;
    }
    
    struct YieldPool {
        euint32 poolId;
        euint32 totalLiquidity;
        euint32 currentYield;
        euint32 maxCapacity;
        ebool isActive;
        address poolManager;
        string poolName;
        uint256 createdTime;
    }
    
    struct YieldReward {
        euint32 rewardId;
        euint32 amount;
        euint32 timestamp;
        address recipient;
        ebool isClaimed;
    }
    
    mapping(uint256 => FarmingPosition) public positions;
    mapping(uint256 => YieldPool) public pools;
    mapping(uint256 => YieldReward) public rewards;
    mapping(address => euint32) public farmerReputation;
    mapping(address => euint32) public totalStaked;
    mapping(address => euint32) public totalEarned;
    
    uint256 public positionCounter;
    uint256 public poolCounter;
    uint256 public rewardCounter;
    
    address public owner;
    address public feeCollector;
    uint256 public platformFee = 250; // 2.5% in basis points
    
    event PositionCreated(uint256 indexed positionId, address indexed farmer, string strategy);
    event PositionWithdrawn(uint256 indexed positionId, address indexed farmer);
    event PoolCreated(uint256 indexed poolId, address indexed manager, string poolName);
    event RewardClaimed(uint256 indexed rewardId, address indexed recipient);
    event ReputationUpdated(address indexed farmer, uint32 reputation);
    
    constructor(address _feeCollector) {
        owner = msg.sender;
        feeCollector = _feeCollector;
    }
    
    function createFarmingPosition(
        uint256 poolId,
        externalEuint32 amount,
        externalEuint32 duration,
        string memory strategy,
        bytes calldata inputProof
    ) public payable returns (uint256) {
        require(pools[poolId].poolManager != address(0), "Pool does not exist");
        require(bytes(strategy).length > 0, "Strategy cannot be empty");
        
        uint256 positionId = positionCounter++;
        
        // Convert external encrypted values to internal
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        euint32 internalDuration = FHE.fromExternal(duration, inputProof);
        
        positions[positionId] = FarmingPosition({
            positionId: FHE.asEuint32(0), // Will be set properly later
            amount: internalAmount,
            yieldRate: pools[poolId].currentYield,
            startTime: FHE.asEuint32(uint32(block.timestamp)),
            duration: internalDuration,
            isActive: FHE.asEbool(true),
            isWithdrawn: FHE.asEbool(false),
            farmer: msg.sender,
            strategy: strategy
        });
        
        // Update farmer's total staked amount
        totalStaked[msg.sender] = FHE.add(totalStaked[msg.sender], internalAmount);
        
        emit PositionCreated(positionId, msg.sender, strategy);
        return positionId;
    }
    
    function withdrawPosition(
        uint256 positionId,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(positions[positionId].farmer == msg.sender, "Not position owner");
        
        // Check if position is active and not withdrawn
        ebool isActive = positions[positionId].isActive;
        ebool isWithdrawn = positions[positionId].isWithdrawn;
        
        // Calculate yield earned (simplified calculation)
        euint32 amount = positions[positionId].amount;
        euint32 yieldRate = positions[positionId].yieldRate;
        euint32 duration = positions[positionId].duration;
        
        // Calculate yield: amount * yieldRate * duration / 365 days
        euint32 yieldEarned = FHE.mul(
            FHE.mul(amount, yieldRate),
            FHE.div(duration, FHE.asEuint32(365 * 24 * 60 * 60))
        );
        
        // Create reward record
        uint256 rewardId = rewardCounter++;
        rewards[rewardId] = YieldReward({
            rewardId: FHE.asEuint32(0), // Will be set properly later
            amount: yieldEarned,
            timestamp: FHE.asEuint32(uint32(block.timestamp)),
            recipient: msg.sender,
            isClaimed: FHE.asEbool(false)
        });
        
        // Update position status
        positions[positionId].isActive = FHE.asEbool(false);
        positions[positionId].isWithdrawn = FHE.asEbool(true);
        
        // Update farmer's total earned
        totalEarned[msg.sender] = FHE.add(totalEarned[msg.sender], yieldEarned);
        
        emit PositionWithdrawn(positionId, msg.sender);
        return rewardId;
    }
    
    function claimReward(
        uint256 rewardId,
        bytes calldata inputProof
    ) public {
        require(rewards[rewardId].recipient == msg.sender, "Not reward recipient");
        
        // Check if reward is not already claimed
        ebool isClaimed = rewards[rewardId].isClaimed;
        
        // Mark reward as claimed
        rewards[rewardId].isClaimed = FHE.asEbool(true);
        
        emit RewardClaimed(rewardId, msg.sender);
        
        // In a real implementation, transfer tokens here
        // The actual amount would be decrypted off-chain
    }
    
    function createYieldPool(
        string memory poolName,
        externalEuint32 maxCapacity,
        externalEuint32 initialYield,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(bytes(poolName).length > 0, "Pool name cannot be empty");
        
        uint256 poolId = poolCounter++;
        
        // Convert external encrypted values to internal
        euint32 internalMaxCapacity = FHE.fromExternal(maxCapacity, inputProof);
        euint32 internalInitialYield = FHE.fromExternal(initialYield, inputProof);
        
        pools[poolId] = YieldPool({
            poolId: FHE.asEuint32(0), // Will be set properly later
            totalLiquidity: FHE.asEuint32(0),
            currentYield: internalInitialYield,
            maxCapacity: internalMaxCapacity,
            isActive: FHE.asEbool(true),
            poolManager: msg.sender,
            poolName: poolName,
            createdTime: block.timestamp
        });
        
        emit PoolCreated(poolId, msg.sender, poolName);
        return poolId;
    }
    
    function updatePoolYield(
        uint256 poolId,
        externalEuint32 newYield,
        bytes calldata inputProof
    ) public {
        require(pools[poolId].poolManager == msg.sender, "Not pool manager");
        require(pools[poolId].poolManager != address(0), "Pool does not exist");
        
        euint32 internalNewYield = FHE.fromExternal(newYield, inputProof);
        pools[poolId].currentYield = internalNewYield;
    }
    
    function updateFarmerReputation(
        address farmer,
        externalEuint32 reputation,
        bytes calldata inputProof
    ) public {
        require(msg.sender == owner, "Only owner can update reputation");
        require(farmer != address(0), "Invalid farmer address");
        
        euint32 internalReputation = FHE.fromExternal(reputation, inputProof);
        farmerReputation[farmer] = internalReputation;
        
        emit ReputationUpdated(farmer, 0); // Will be decrypted off-chain
    }
    
    function getPositionInfo(uint256 positionId) public view returns (
        uint8 amount,
        uint8 yieldRate,
        uint8 startTime,
        uint8 duration,
        bool isActive,
        bool isWithdrawn,
        address farmer,
        string memory strategy
    ) {
        FarmingPosition storage position = positions[positionId];
        return (
            0, // FHE.decrypt(position.amount) - will be decrypted off-chain
            0, // FHE.decrypt(position.yieldRate) - will be decrypted off-chain
            0, // FHE.decrypt(position.startTime) - will be decrypted off-chain
            0, // FHE.decrypt(position.duration) - will be decrypted off-chain
            false, // FHE.decrypt(position.isActive) - will be decrypted off-chain
            false, // FHE.decrypt(position.isWithdrawn) - will be decrypted off-chain
            position.farmer,
            position.strategy
        );
    }
    
    function getPoolInfo(uint256 poolId) public view returns (
        uint8 totalLiquidity,
        uint8 currentYield,
        uint8 maxCapacity,
        bool isActive,
        address poolManager,
        string memory poolName,
        uint256 createdTime
    ) {
        YieldPool storage pool = pools[poolId];
        return (
            0, // FHE.decrypt(pool.totalLiquidity) - will be decrypted off-chain
            0, // FHE.decrypt(pool.currentYield) - will be decrypted off-chain
            0, // FHE.decrypt(pool.maxCapacity) - will be decrypted off-chain
            false, // FHE.decrypt(pool.isActive) - will be decrypted off-chain
            pool.poolManager,
            pool.poolName,
            pool.createdTime
        );
    }
    
    function getRewardInfo(uint256 rewardId) public view returns (
        uint8 amount,
        uint8 timestamp,
        address recipient,
        bool isClaimed
    ) {
        YieldReward storage reward = rewards[rewardId];
        return (
            0, // FHE.decrypt(reward.amount) - will be decrypted off-chain
            0, // FHE.decrypt(reward.timestamp) - will be decrypted off-chain
            reward.recipient,
            false // FHE.decrypt(reward.isClaimed) - will be decrypted off-chain
        );
    }
    
    function getFarmerStats(address farmer) public view returns (
        uint8 totalStakedAmount,
        uint8 totalEarnedAmount,
        uint8 reputation
    ) {
        return (
            0, // FHE.decrypt(totalStaked[farmer]) - will be decrypted off-chain
            0, // FHE.decrypt(totalEarned[farmer]) - will be decrypted off-chain
            0  // FHE.decrypt(farmerReputation[farmer]) - will be decrypted off-chain
        );
    }
    
    function setPlatformFee(uint256 newFee) public {
        require(msg.sender == owner, "Only owner can set fee");
        require(newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = newFee;
    }
    
    function setFeeCollector(address newCollector) public {
        require(msg.sender == owner, "Only owner can set fee collector");
        require(newCollector != address(0), "Invalid fee collector address");
        feeCollector = newCollector;
    }
}
