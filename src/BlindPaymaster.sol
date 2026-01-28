// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

/*
 Very simple Paymaster for EntryPoint v0.7 that approves all UserOperations.
 WARNING: This is intentionally permissive and should only be used for demos.
*/

import "account-abstraction/contracts/core/BasePaymaster.sol";
import "account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "account-abstraction/contracts/interfaces/PackedUserOperation.sol";

contract BlindPaymaster is BasePaymaster {
    constructor(IEntryPoint entryPoint) BasePaymaster(entryPoint) {}

    function _validatePaymasterUserOp(
        PackedUserOperation calldata /*userOp*/,
        bytes32 /*userOpHash*/,
        uint256 /*maxCost*/
    ) internal override returns (bytes memory context, uint256 validationData) {
        return ("", 0);
    }

    function _postOp(
        PostOpMode /*mode*/,
        bytes calldata /*context*/,
        uint256 /*actualGasCost*/,
        uint256 /*actualUserOpFeePerGas*/
    ) internal override {
        // Intentionally empty
    }
}
