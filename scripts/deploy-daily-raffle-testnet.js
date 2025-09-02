const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Deploying Like2Win Daily Raffle Contract to Base Sepolia Testnet...");

  // Mock DEGEN token address for testing (you'll need to deploy a test ERC20 token)
  // For now, we'll use a placeholder - in testnet you'd deploy a mock DEGEN token first
  const MOCK_DEGEN_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual test token
  
  console.log("⚠️  WARNING: Using placeholder token address for testnet");
  console.log("📄 Mock DEGEN token address:", MOCK_DEGEN_TOKEN_ADDRESS);
  console.log("🔧 Deploy a test ERC20 token first and update this address");

  // Get the contract factory
  const Like2WinDailyRaffle = await ethers.getContractFactory("Like2WinDailyRaffle");

  // Deploy the contract
  console.log("📡 Deploying to Base Sepolia...");
  const dailyRaffle = await Like2WinDailyRaffle.deploy(MOCK_DEGEN_TOKEN_ADDRESS);

  await dailyRaffle.waitForDeployment();

  const contractAddress = await dailyRaffle.getAddress();
  
  console.log("✅ Like2WinDailyRaffle deployed to Base Sepolia:", contractAddress);
  
  // Get the deployer address (owner)
  const [deployer] = await ethers.getSigners();
  console.log("👤 Contract owner:", deployer.address);
  
  console.log("\n📋 Next Steps for Testnet:");
  console.log("1. Deploy a test ERC20 token to act as DEGEN");
  console.log("2. Update this script with the test token address");
  console.log("3. Verify contract on Base Sepolia explorer:");
  console.log(`   npx hardhat verify --network base-sepolia ${contractAddress} ${MOCK_DEGEN_TOKEN_ADDRESS}`);
  console.log("4. Mint test tokens to contract and test all functions");
  console.log("5. Test daily raffle creation and execution");
  
  // Save deployment info
  const deploymentInfo = {
    network: "base-sepolia",
    contractAddress,
    mockTokenAddress: MOCK_DEGEN_TOKEN_ADDRESS,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    transactionHash: dailyRaffle.deploymentTransaction().hash
  };
  
  console.log("\n💾 Testnet Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
  
  return deploymentInfo;
}

main()
  .then((info) => {
    console.log("🎉 Testnet deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Testnet deployment failed:", error);
    process.exit(1);
  });