const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Like2Win Raffle Contract...");

  // $DEGEN token address on Base network
  const DEGEN_TOKEN_ADDRESS = "0x4ed4E862860beD51a9570b96d89aF5E1B0Eff945";

  // Get the contract factory
  const Like2WinRaffle = await ethers.getContractFactory("Like2WinRaffle");
  
  // Deploy the contract
  console.log("📦 Deploying contract with $DEGEN token:", DEGEN_TOKEN_ADDRESS);
  const like2WinRaffle = await Like2WinRaffle.deploy(DEGEN_TOKEN_ADDRESS);
  
  await like2WinRaffle.deployed();
  
  console.log("✅ Like2Win Raffle deployed to:", like2WinRaffle.address);
  console.log("🔗 Transaction hash:", like2WinRaffle.deployTransaction.hash);
  
  // Wait for a few block confirmations
  console.log("⏳ Waiting for block confirmations...");
  await like2WinRaffle.deployTransaction.wait(5);
  
  console.log("🎉 Deployment completed!");
  console.log("📋 Contract Details:");
  console.log("   - Contract Address:", like2WinRaffle.address);
  console.log("   - $DEGEN Token:", DEGEN_TOKEN_ADDRESS);
  console.log("   - Network: Base Mainnet");
  
  // Verify contract on Basescan (optional)
  if (process.env.BASESCAN_API_KEY) {
    console.log("🔍 Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: like2WinRaffle.address,
        constructorArguments: [DEGEN_TOKEN_ADDRESS],
      });
      console.log("✅ Contract verified on Basescan");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  return like2WinRaffle.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });