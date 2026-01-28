// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/MultiOwnerAccountFactory.sol";
import "../src/BlindPaymaster.sol";
import "../src/DummyNFT.sol";
import "account-abstraction/contracts/interfaces/IEntryPoint.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address entryPointAddress = vm.envAddress("ENTRYPOINT_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        IEntryPoint entryPoint = IEntryPoint(entryPointAddress);

        MultiOwnerAccountFactory factory = new MultiOwnerAccountFactory(entryPoint);
        console.log("MultiOwnerAccountFactory deployed at:", address(factory));

        BlindPaymaster paymaster = new BlindPaymaster(entryPoint);
        console.log("BlindPaymaster deployed at:", address(paymaster));

        DummyNFT nft = new DummyNFT();
        console.log("DummyNFT deployed at:", address(nft));

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("EntryPoint (existing):", entryPointAddress);
        console.log("Factory:", address(factory));
        console.log("Paymaster:", address(paymaster));
        console.log("DummyNFT:", address(nft));
    }
}
