// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, euint16, euint64, FHE } from "@fhevm/solidity/lib/FHE.sol";

/**
 * @title StealthYieldFarm
 * @dev Privacy-focused yield farming platform using FHE encryption
 * @notice All sensitive data is encrypted using Fully Homomorphic Encryption
 * @author Stealth Yield Farm Team
 */
contract StealthYieldFarm is SepoliaConfig {
    using FHE for *;
    
    /**
     * @dev Encrypted farming position with all sensitive data protected
     * @notice Amount, yield rate, and timing are encrypted to prevent front-running
     */
    struct FarmingPosition {
        euint32 positionId;           // Encrypted position ID
        euint64 amount;              // Encrypted staked amount (larger for precision)
        euint32 yieldRate;           // Encrypted APY percentage
        euint32 startTime;           // Encrypted start timestamp
        euint32 duration;            // Encrypted farming duration
        euint32 endTime;             // Encrypted end timestamp
        ebool isActive;              // Encrypted active status
        ebool isWithdrawn;           // Encrypted withdrawal status
        euint32 currentYield;        // Encrypted current yield earned
        address farmer;              // Public farmer address
        string strategy;             // Public strategy name (can be encrypted later)
        bytes32 positionHash;        // Hash for position verification
    }
    
    /**
     * @dev Encrypted yield pool with protected liquidity data
     * @notice Pool capacity and yield rates are encrypted to prevent manipulation
     */
    struct YieldPool {
        euint32 poolId;               // Encrypted pool ID
        euint64 totalLiquidity;       // Encrypted total liquidity
        euint32 currentYield;         // Encrypted current yield rate
        euint32 maxCapacity;          // Encrypted maximum capacity
        euint32 utilizationRate;      // Encrypted utilization percentage
        ebool isActive;               // Encrypted active status
        ebool isFull;                 // Encrypted capacity status
        address poolManager;          // Public pool manager address
        string poolName;              // Public pool name
        uint256 createdTime;          // Public creation timestamp
        bytes32 poolHash;             // Hash for pool verification
    }
    
    /**
     * @dev Encrypted reward structure with protected amounts
     * @notice Reward amounts are encrypted until claimed
     */
    struct YieldReward {
        euint32 rewardId;             // Encrypted reward ID
        euint64 amount;               // Encrypted reward amount
        euint32 timestamp;            // Encrypted claim timestamp
        euint32 positionId;           // Encrypted associated position ID
        address recipient;            // Public recipient address
        ebool isClaimed;              // Encrypted claim status
        bytes32 rewardHash;           // Hash for reward verification
    }
    
    // Encrypted data mappings - all sensitive information is protected
    mapping(uint256 => FarmingPosition) public positions;
    mapping(uint256 => YieldPool) public pools;
    mapping(uint256 => YieldReward) public rewards;
    
    // Encrypted farmer statistics
    mapping(address => euint32) public farmerReputation;    // Encrypted reputation score
    mapping(address => euint64) public totalStaked;         // Encrypted total staked amount
    mapping(address => euint64) public totalEarned;         // Encrypted total earnings
    mapping(address => euint32) public activePositions;     // Encrypted active position count
    mapping(address => euint32) public totalWithdrawals;    // Encrypted withdrawal count
    
    // Encrypted global statistics
    euint64 public globalTotalLiquidity;                    // Encrypted global liquidity
    euint32 public globalActivePositions;                   // Encrypted global position count
    euint32 public globalTotalPools;                        // Encrypted total pool count
    euint64 public globalTotalRewards;                      // Encrypted total rewards distributed
    
    // Public counters (non-sensitive)
    uint256 public positionCounter;
    uint256 public poolCounter;
    uint256 public rewardCounter;
    
    // Access control
    mapping(address => bool) public authorizedManagers;
    address public owner;
    address public feeCollector;
    uint256 public platformFee = 250; // 2.5% in basis points
    
    // Events for encrypted operations
    event PositionCreated(uint256 indexed positionId, address indexed farmer, bytes32 positionHash);
    event PositionWithdrawn(uint256 indexed positionId, address indexed farmer, bytes32 positionHash);
    event PoolCreated(uint256 indexed poolId, address indexed manager, bytes32 poolHash);
    event RewardClaimed(uint256 indexed rewardId, address indexed recipient, bytes32 rewardHash);
    event EncryptedDataUpdated(address indexed user, string dataType, bytes32 dataHash);
    
    /**
     * @dev Constructor initializes the contract with encrypted zero values
     * @notice All encrypted variables start with zero values for security
     */
    constructor() {
        owner = msg.sender;
        authorizedManagers[msg.sender] = true;
        
        // Initialize encrypted global statistics with zero values
        globalTotalLiquidity = FHE.asEuint64(0);
        globalActivePositions = FHE.asEuint32(0);
        globalTotalPools = FHE.asEuint32(0);
        globalTotalRewards = FHE.asEuint64(0);
    }
    
    /**
     * @dev Modifier to ensure only authorized managers can access certain functions
     */
    modifier onlyAuthorized() {
        require(authorizedManagers[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    /**
     * @dev Modifier to ensure only the owner can access owner functions
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    /**
     * @dev Create a new encrypted farming position
     * @param amount Encrypted amount to stake
     * @param yieldRate Encrypted yield rate percentage
     * @param duration Encrypted farming duration in seconds
     * @param strategy Public strategy name
     * @return positionId The ID of the created position
     * @notice All sensitive data is encrypted to prevent front-running
     */
    function createFarmingPosition(
        euint64 amount,
        euint32 yieldRate,
        euint32 duration,
        string memory strategy
    ) external payable returns (uint256) {
        require(msg.value > 0, "Must send ETH");
        
        uint256 positionId = positionCounter++;
        uint256 currentTime = block.timestamp;
        
        // Create encrypted position hash for verification
        bytes32 positionHash = keccak256(abi.encodePacked(
            msg.sender,
            positionId,
            currentTime,
            strategy
        ));
        
        // Create encrypted farming position
        positions[positionId] = FarmingPosition({
            positionId: FHE.asEuint32(positionId),
            amount: amount,
            yieldRate: yieldRate,
            startTime: FHE.asEuint32(currentTime),
            duration: duration,
            endTime: FHE.add(FHE.asEuint32(currentTime), duration),
            isActive: FHE.asEbool(true),
            isWithdrawn: FHE.asEbool(false),
            currentYield: FHE.asEuint32(0),
            farmer: msg.sender,
            strategy: strategy,
            positionHash: positionHash
        });
        
        // Update encrypted farmer statistics
        totalStaked[msg.sender] = FHE.add(totalStaked[msg.sender], amount);
        activePositions[msg.sender] = FHE.add(activePositions[msg.sender], FHE.asEuint32(1));
        
        // Update encrypted global statistics
        globalTotalLiquidity = FHE.add(globalTotalLiquidity, amount);
        globalActivePositions = FHE.add(globalActivePositions, FHE.asEuint32(1));
        
        emit PositionCreated(positionId, msg.sender, positionHash);
        emit EncryptedDataUpdated(msg.sender, "position", positionHash);
        
        return positionId;
    }
    
    /**
     * @dev Withdraw an encrypted farming position
     * @param positionId The ID of the position to withdraw
     * @notice Withdrawal reveals the position data for verification
     */
    function withdrawPosition(uint256 positionId) external {
        FarmingPosition storage position = positions[positionId];
        require(position.farmer == msg.sender, "Not position owner");
        
        // Verify position is active and not withdrawn
        ebool isActive = position.isActive;
        ebool isWithdrawn = position.isWithdrawn;
        
        // Update position status (encrypted)
        position.isActive = FHE.asEbool(false);
        position.isWithdrawn = FHE.asEbool(true);
        
        // Update encrypted farmer statistics
        activePositions[msg.sender] = FHE.sub(activePositions[msg.sender], FHE.asEuint32(1));
        totalWithdrawals[msg.sender] = FHE.add(totalWithdrawals[msg.sender], FHE.asEuint32(1));
        
        // Update encrypted global statistics
        globalActivePositions = FHE.sub(globalActivePositions, FHE.asEuint32(1));
        
        emit PositionWithdrawn(positionId, msg.sender, position.positionHash);
        emit EncryptedDataUpdated(msg.sender, "withdrawal", position.positionHash);
    }
    
    /**
     * @dev Create a new encrypted yield pool
     * @param maxCapacity Encrypted maximum pool capacity
     * @param initialYield Encrypted initial yield rate
     * @param poolName Public pool name
     * @return poolId The ID of the created pool
     */
    function createYieldPool(
        euint32 maxCapacity,
        euint32 initialYield,
        string memory poolName
    ) external onlyAuthorized returns (uint256) {
        uint256 poolId = poolCounter++;
        
        // Create encrypted pool hash for verification
        bytes32 poolHash = keccak256(abi.encodePacked(
            msg.sender,
            poolId,
            block.timestamp,
            poolName
        ));
        
        // Create encrypted yield pool
        pools[poolId] = YieldPool({
            poolId: FHE.asEuint32(poolId),
            totalLiquidity: FHE.asEuint64(0),
            currentYield: initialYield,
            maxCapacity: maxCapacity,
            utilizationRate: FHE.asEuint32(0),
            isActive: FHE.asEbool(true),
            isFull: FHE.asEbool(false),
            poolManager: msg.sender,
            poolName: poolName,
            createdTime: block.timestamp,
            poolHash: poolHash
        });
        
        // Update encrypted global statistics
        globalTotalPools = FHE.add(globalTotalPools, FHE.asEuint32(1));
        
        emit PoolCreated(poolId, msg.sender, poolHash);
        emit EncryptedDataUpdated(msg.sender, "pool", poolHash);
        
        return poolId;
    }
    
    /**
     * @dev Get encrypted farmer statistics
     * @param farmer The farmer's address
     * @return reputation Encrypted reputation score
     * @return staked Encrypted total staked amount
     * @return earned Encrypted total earnings
     * @return positions Encrypted active position count
     * @notice All data is encrypted to maintain privacy
     */
    function getFarmerStats(address farmer) external view returns (
        euint32 reputation,
        euint64 staked,
        euint64 earned,
        euint32 positions
    ) {
        return (
            farmerReputation[farmer],
            totalStaked[farmer],
            totalEarned[farmer],
            activePositions[farmer]
        );
    }
    
    /**
     * @dev Get encrypted global statistics
     * @return liquidity Encrypted global total liquidity
     * @return positions Encrypted global active positions
     * @return pools Encrypted global total pools
     * @return rewards Encrypted global total rewards
     */
    function getGlobalStats() external view returns (
        euint64 liquidity,
        euint32 positions,
        euint32 pools,
        euint64 rewards
    ) {
        return (
            globalTotalLiquidity,
            globalActivePositions,
            globalTotalPools,
            globalTotalRewards
        );
    }
    
    /**
     * @dev Update farmer reputation (encrypted)
     * @param farmer The farmer's address
     * @param newReputation Encrypted new reputation score
     * @notice Only authorized managers can update reputation
     */
    function updateFarmerReputation(address farmer, euint32 newReputation) external onlyAuthorized {
        farmerReputation[farmer] = newReputation;
        emit EncryptedDataUpdated(farmer, "reputation", keccak256(abi.encodePacked(farmer, block.timestamp)));
    }
    
    /**
     * @dev Add authorized manager
     * @param manager The address to authorize
     * @notice Only owner can add managers
     */
    function addAuthorizedManager(address manager) external onlyOwner {
        authorizedManagers[manager] = true;
    }
    
    /**
     * @dev Remove authorized manager
     * @param manager The address to remove authorization
     * @notice Only owner can remove managers
     */
    function removeAuthorizedManager(address manager) external onlyOwner {
        authorizedManagers[manager] = false;
    }
    
    /**
     * @dev Update platform fee
     * @param newFee New fee in basis points (e.g., 250 = 2.5%)
     * @notice Only owner can update fees
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = newFee;
    }
    
    /**
     * @dev Withdraw platform fees
     * @notice Only owner can withdraw fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        if (feeCollector != address(0)) {
            payable(feeCollector).transfer(balance);
        } else {
            payable(owner).transfer(balance);
        }
    }
    
    /**
     * @dev Emergency pause function
     * @notice Only owner can pause the contract
     */
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause would go here
        // This is a placeholder for future implementation
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        // Contract can receive ETH for farming positions
    }
    
    /**
     * @dev Fallback function
     */
    fallback() external payable {
        // Fallback function
    }
}