// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Like2WinRaffle.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address degenToken = 0x4ed4E862860beD51a9570b96d89aF5E1B0Eff945; // $DEGEN on Base
        
        vm.startBroadcast(deployerPrivateKey);
        
        Like2WinRaffle raffle = new Like2WinRaffle(degenToken);
        
        console.log("Like2Win Raffle deployed to:", address(raffle));
        console.log("DEGEN token:", degenToken);
        
        vm.stopBroadcast();
    }
}