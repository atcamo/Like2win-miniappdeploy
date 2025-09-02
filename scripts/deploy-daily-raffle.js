const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Like2Win Daily Raffle Contract...");

  // DEGEN token address on Base mainnet
  const DEGEN_TOKEN_ADDRESS = "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed";
  
  console.log("📄 Using DEGEN token address:", DEGEN_TOKEN_ADDRESS);

  // Get the contract factory
  const Like2WinDailyRaffle = await ethers.getContractFactory("Like2WinDailyRaffle");

  // Deploy the contract
  const dailyRaffle = await Like2WinDailyRaffle.deploy(DEGEN_TOKEN_ADDRESS);

  await dailyRaffle.waitForDeployment();

  const contractAddress = await dailyRaffle.getAddress();
  
  console.log("✅ Like2WinDailyRaffle deployed to:", contractAddress);
  
  // Get the deployer address (owner)
  const [deployer] = await ethers.getSigners();
  console.log("👤 Contract owner:", deployer.address);
  
  console.log("\n📋 Next Steps:");
  console.log("1. Verify contract on BaseScan:");
  console.log(`   npx hardhat verify --network base ${contractAddress} ${DEGEN_TOKEN_ADDRESS}`);
  console.log("2. Fund contract with DEGEN tokens (3500 DEGEN for 7 days)");
  console.log("3. Call startWeeklyRaffleSeries() to begin the daily raffles");
  console.log("4. Update backend APIs to use this contract address");
  
  // Save deployment info
  const deploymentInfo = {
    network: "base",
    contractAddress,
    degenTokenAddress: DEGEN_TOKEN_ADDRESS,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    transactionHash: dailyRaffle.deploymentTransaction().hash
  };
  
  console.log("\n💾 Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
  
  return deploymentInfo;
}

main()
  .then((info) => {
    console.log("🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });