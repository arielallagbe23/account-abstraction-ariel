// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "account-abstraction/contracts/interfaces/IEntryPoint.sol";

contract FundPaymasterScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address entryPointAddress = vm.envAddress("ENTRYPOINT_ADDRESS");
        address paymasterAddress = vm.envAddress("PAYMASTER_ADDRESS");
        uint256 amount = vm.envUint("PAYMASTER_DEPOSIT_WEI");

        vm.startBroadcast(deployerPrivateKey);
        IEntryPoint(entryPointAddress).depositTo{value: amount}(paymasterAddress);
        vm.stopBroadcast();
    }
}
