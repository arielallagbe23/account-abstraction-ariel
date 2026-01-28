// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/MultiOwnerAccountFactory.sol";

contract CreateAccountScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");
        address owner1 = vm.envAddress("OWNER1_ADDRESS");
        address owner2 = vm.envAddress("OWNER2_ADDRESS");
        address guardian = vm.envAddress("GUARDIAN_ADDRESS");
        uint256 salt = vm.envUint("ACCOUNT_SALT");

        vm.startBroadcast(deployerPrivateKey);
        address[] memory owners = new address[](2);
        owners[0] = owner1;
        owners[1] = owner2;
        MultiOwnerAccountFactory(factoryAddress).createAccount(owners, guardian, salt);
        vm.stopBroadcast();
    }
}
