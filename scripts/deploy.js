const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying StealthYieldFarm contract...");

  // Get the contract factory
  const StealthYieldFarm = await ethers.getContractFactory("StealthYieldFarm");

  // Set the fee collector address (can be the deployer for now)
  const [deployer] = await ethers.getSigners();
  const feeCollector = deployer.address;

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the contract
  const stealthYieldFarm = await StealthYieldFarm.deploy(feeCollector);

  await stealthYieldFarm.deployed();

  console.log("StealthYieldFarm deployed to:", stealthYieldFarm.address);
  console.log("Fee collector set to:", feeCollector);

  // Verify deployment
  const owner = await stealthYieldFarm.owner();
  const feeCollectorAddress = await stealthYieldFarm.feeCollector();
  const platformFee = await stealthYieldFarm.platformFee();

  console.log("Contract owner:", owner);
  console.log("Fee collector:", feeCollectorAddress);
  console.log("Platform fee:", platformFee.toString(), "basis points");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
